import { Router, Response } from 'express';
import { db, Student, Document, User } from './db';
import { requireAuth, requireRole, AuthenticatedRequest, hashPassword, signToken } from './auth';
import path from 'path';
import fs from 'fs';

const router = Router();

// Helper to get client IP
const getClientIp = (req: AuthenticatedRequest) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
  return typeof ip === 'string' ? ip.split(',')[0].trim() : '127.0.0.1';
};

// ==========================================
// 1. AUTH MODULE
// ==========================================

// Login Handler
router.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  const user = db.getUserByEmail(email);
  if (!user || !user.isActive) {
    // Standard defensive security: generic failure message
    return res.status(401).json({ message: 'Invalid credentials or inactive account.' });
  }

  const hashedInput = hashPassword(password);
  if (user.passwordHash !== hashedInput) {
    return res.status(401).json({ message: 'Invalid credentials or inactive account.' });
  }

  const token = signToken({
    id: user.id,
    email: user.email,
    role: user.role,
    fullName: user.fullName,
  });

  // Log active login event
  db.logAction(user.id, user.fullName, 'LOGIN', 'USER', user.id, {}, getClientIp(req));

  res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
    }
  });
});

// Current User profile session endpoint
router.get('/auth/me', requireAuth, (req: AuthenticatedRequest, res) => {
  res.json({ user: req.user });
});

// ==========================================
// 2. USER MANAGEMENT MODULE (ADMIN ONLY)
// ==========================================

router.get('/users', requireAuth, requireRole(['Admin']), (req: AuthenticatedRequest, res) => {
  const users = db.getUsers().map(u => ({
    id: u.id,
    username: u.username,
    email: u.email,
    fullName: u.fullName,
    role: u.role,
    isActive: u.isActive,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
  }));
  res.json(users);
});

router.post('/users', requireAuth, requireRole(['Admin']), (req: AuthenticatedRequest, res) => {
  const { username, email, fullName, role, password } = req.body;
  
  if (!username || !email || !fullName || !role || !password) {
    return res.status(400).json({ message: 'All fields (username, email, fullName, role, password) are required.' });
  }

  const existingEmail = db.getUserByEmail(email);
  if (existingEmail) {
    return res.status(400).json({ message: 'A user with this email already exists.' });
  }

  const existingUsername = db.getUsers().find(u => u.username.toLowerCase() === username.toLowerCase());
  if (existingUsername) {
    return res.status(400).json({ message: 'A user with this username already exists.' });
  }

  const passwordHash = hashPassword(password);
  const newUser = db.createUser({
    username,
    email,
    fullName,
    role,
    passwordHash,
    isActive: true,
  });

  db.logAction(
    req.user!.id,
    req.user!.fullName,
    'CREATE',
    'USER',
    newUser.id,
    { username, email, fullName, role },
    getClientIp(req)
  );

  res.status(201).json({
    id: newUser.id,
    username: newUser.username,
    email: newUser.email,
    fullName: newUser.fullName,
    role: newUser.role,
    isActive: newUser.isActive,
  });
});

router.put('/users/:id', requireAuth, requireRole(['Admin']), (req: AuthenticatedRequest, res) => {
  const id = parseInt(req.params.id);
  const { fullName, role, isActive, password } = req.body;

  const targetUser = db.getUserById(id);
  if (!targetUser) {
    return res.status(404).json({ message: 'User not found.' });
  }

  const updates: Partial<User> = {};
  if (fullName !== undefined) updates.fullName = fullName;
  if (role !== undefined) updates.role = role;
  if (isActive !== undefined) updates.isActive = isActive;
  if (password) updates.passwordHash = hashPassword(password);

  const updated = db.updateUser(id, updates);
  if (!updated) {
    return res.status(500).json({ message: 'Failed to update user.' });
  }

  db.logAction(
    req.user!.id,
    req.user!.fullName,
    'UPDATE',
    'USER',
    id,
    updates,
    getClientIp(req)
  );

  res.json({
    id: updated.id,
    username: updated.username,
    email: updated.email,
    fullName: updated.fullName,
    role: updated.role,
    isActive: updated.isActive,
  });
});

router.delete('/users/:id', requireAuth, requireRole(['Admin']), (req: AuthenticatedRequest, res) => {
  const id = parseInt(req.params.id);
  
  if (id === req.user!.id) {
    return res.status(400).json({ message: 'You cannot delete your own logged-in administrator account.' });
  }

  const targetUser = db.getUserById(id);
  if (!targetUser) {
    return res.status(404).json({ message: 'User not found.' });
  }

  db.deleteUser(id);
  
  db.logAction(
    req.user!.id,
    req.user!.fullName,
    'DELETE',
    'USER',
    id,
    { email: targetUser.email, username: targetUser.username },
    getClientIp(req)
  );

  res.json({ message: 'User deleted successfully.' });
});

// ==========================================
// 3. DEPARTMENT MODULE
// ==========================================

router.get('/departments', requireAuth, (req, res) => {
  res.json(db.getDepartments());
});

router.post('/departments', requireAuth, requireRole(['Admin', 'Staff']), (req: AuthenticatedRequest, res) => {
  const { name, code, headOfDept } = req.body;
  if (!name || !code) {
    return res.status(400).json({ message: 'Department name and short code are required.' });
  }

  const existingCode = db.getDepartments().find(d => d.code.toUpperCase() === code.toUpperCase());
  if (existingCode) {
    return res.status(400).json({ message: 'A department with this short code already exists.' });
  }

  const newDept = db.createDepartment({ name, code, headOfDept: headOfDept || '' });

  db.logAction(
    req.user!.id,
    req.user!.fullName,
    'CREATE',
    'DEPARTMENT',
    newDept.id,
    { name, code },
    getClientIp(req)
  );

  res.status(201).json(newDept);
});

// ==========================================
// 4. STUDENT CRUD MODULE
// ==========================================

// Get students directory list with extensive Multi-criteria Search/Filter, Pagination, Sorting
router.get('/students', requireAuth, (req, res) => {
  const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
  const deptId = req.query.deptId ? parseInt(req.query.deptId as string) : null;
  const year = req.query.year ? parseInt(req.query.year as string) : null;
  const status = typeof req.query.status === 'string' ? req.query.status : '';
  const sortBy = typeof req.query.sortBy === 'string' ? req.query.sortBy : 'studentId';
  const sortOrder = typeof req.query.sortOrder === 'string' ? req.query.sortOrder : 'asc';
  
  const page = req.query.page ? parseInt(req.query.page as string) : 1;
  const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

  let list = db.getStudents();

  // Multi-criteria Filter Implementation
  if (search) {
    const q = search.toLowerCase();
    list = list.filter(s => 
      s.firstName.toLowerCase().includes(q) ||
      s.lastName.toLowerCase().includes(q) ||
      s.studentId.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      s.city.toLowerCase().includes(q)
    );
  }

  if (deptId !== null && !isNaN(deptId)) {
    list = list.filter(s => s.deptId === deptId);
  }

  if (year !== null && !isNaN(year)) {
    list = list.filter(s => s.currentYear === year);
  }

  if (status) {
    list = list.filter(s => s.status.toLowerCase() === status.toLowerCase());
  }

  // Sorting
  list.sort((a, b) => {
    let valA: any = a[sortBy as keyof Student];
    let valB: any = b[sortBy as keyof Student];

    if (valA === undefined) valA = '';
    if (valB === undefined) valB = '';

    if (typeof valA === 'string') {
      return sortOrder === 'desc' 
        ? valB.localeCompare(valA) 
        : valA.localeCompare(valB);
    } else {
      return sortOrder === 'desc' 
        ? valB - valA 
        : valA - valB;
    }
  });

  // Pagination
  const total = list.length;
  const totalPages = Math.ceil(total / limit);
  const offset = (page - 1) * limit;
  const paginatedList = list.slice(offset, offset + limit);

  // Return counts & metadata
  res.json({
    students: paginatedList,
    pagination: {
      total,
      page,
      limit,
      totalPages,
    }
  });
});

// Get single student details with profile documents and relevant log trail
router.get('/students/:id', requireAuth, (req, res) => {
  const id = parseInt(req.params.id);
  const student = db.getStudentById(id);
  if (!student) {
    return res.status(404).json({ message: 'Student profile not found.' });
  }

  const department = db.getDepartmentById(student.deptId);
  const documents = db.getDocumentsByStudentId(student.id);
  const logs = db.getLogs().filter(l => l.entity === 'STUDENT' && l.entityId === student.id);

  res.json({
    student,
    department,
    documents,
    logs,
  });
});

// Create student with auto-id generation and constraint validations
router.post('/students', requireAuth, requireRole(['Admin', 'Staff']), (req: AuthenticatedRequest, res) => {
  const {
    firstName,
    lastName,
    email,
    phone,
    dob,
    gender,
    bloodGroup,
    address,
    city,
    country,
    deptId,
    enrollmentDate,
    currentYear,
    status,
    profilePhoto,
  } = req.body;

  if (!firstName || !lastName || !email || !dob || !deptId || !enrollmentDate) {
    return res.status(400).json({ message: 'Required fields missing: firstName, lastName, email, dob, deptId, and enrollmentDate are mandatory.' });
  }

  // Check unique constraints
  const emailExists = db.getStudentByEmail(email);
  if (emailExists) {
    return res.status(400).json({ message: `A student with email ${email} already exists.` });
  }

  // Generate clean sequential student ID (SMS - CurrentYear - 3 digit zero padded index)
  const currentYearStr = new Date(enrollmentDate).getFullYear() || new Date().getFullYear();
  const sameYearStudentsCount = db.getStudents().filter(s => s.studentId.startsWith(`SMS-${currentYearStr}-`)).length;
  const idPadding = String(sameYearStudentsCount + 1).padStart(3, '0');
  const generatedStudentId = `SMS-${currentYearStr}-${idPadding}`;

  const created = db.createStudent({
    studentId: generatedStudentId,
    firstName,
    lastName,
    email,
    phone: phone || '',
    dob,
    gender: gender || 'Male',
    bloodGroup: bloodGroup || '',
    address: address || '',
    city: city || '',
    country: country || 'India',
    deptId: parseInt(deptId),
    enrollmentDate,
    currentYear: currentYear ? parseInt(currentYear) : 1,
    status: status || 'Active',
    profilePhoto: profilePhoto || '',
  });

  // Log activity
  db.logAction(
    req.user!.id,
    req.user!.fullName,
    'CREATE',
    'STUDENT',
    created.id,
    { studentId: created.studentId, fullName: `${firstName} ${lastName}`, email },
    getClientIp(req)
  );

  res.status(201).json(created);
});

// Update student profile details
router.put('/students/:id', requireAuth, requireRole(['Admin', 'Staff']), (req: AuthenticatedRequest, res) => {
  const id = parseInt(req.params.id);
  const target = db.getStudentById(id);
  if (!target) {
    return res.status(404).json({ message: 'Student profile not found.' });
  }

  const { email } = req.body;
  if (email && email.toLowerCase() !== target.email.toLowerCase()) {
    const emailExists = db.getStudentByEmail(email);
    if (emailExists) {
      return res.status(400).json({ message: `A student with email ${email} already exists.` });
    }
  }

  // Parse types appropriately
  const updates: Partial<Student> = { ...req.body };
  delete updates.id;
  delete updates.studentId;
  delete updates.createdAt;
  delete updates.updatedAt;

  if (updates.deptId) updates.deptId = parseInt(updates.deptId as any);
  if (updates.currentYear) updates.currentYear = parseInt(updates.currentYear as any);

  const updated = db.updateStudent(id, updates);
  if (!updated) {
    return res.status(500).json({ message: 'Failed to update student profile.' });
  }

  db.logAction(
    req.user!.id,
    req.user!.fullName,
    'UPDATE',
    'STUDENT',
    id,
    updates,
    getClientIp(req)
  );

  res.json(updated);
});

// Soft-delete student
router.delete('/students/:id', requireAuth, requireRole(['Admin']), (req: AuthenticatedRequest, res) => {
  const id = parseInt(req.params.id);
  const student = db.getStudentById(id);
  if (!student) {
    return res.status(404).json({ message: 'Student profile not found.' });
  }

  db.softDeleteStudent(id);

  db.logAction(
    req.user!.id,
    req.user!.fullName,
    'DELETE',
    'STUDENT',
    id,
    { studentId: student.studentId, fullName: `${student.firstName} ${student.lastName}`, status: 'Soft-Deleted' },
    getClientIp(req)
  );

  res.json({ message: 'Student profile archived/soft-deleted successfully.' });
});

// ==========================================
// 5. DOCUMENT UPLOAD SUB-MODULE
// ==========================================

// Mock document uploads to database
router.post('/students/:id/documents', requireAuth, requireRole(['Admin', 'Staff']), (req: AuthenticatedRequest, res) => {
  const studentId = parseInt(req.params.id);
  const student = db.getStudentById(studentId);
  if (!student) {
    return res.status(404).json({ message: 'Student profile not found.' });
  }

  const { docType, fileName, fileBase64, fileSize } = req.body;
  if (!docType || !fileName) {
    return res.status(400).json({ message: 'Document type and file name are required.' });
  }

  // Create document item in database
  const document = db.addDocument({
    studentId,
    docType,
    fileName,
    filePath: fileBase64 || 'virtual://uploads/' + fileName,
    fileSize: fileSize || 1024 * 500, // 500KB default fallback
  });

  db.logAction(
    req.user!.id,
    req.user!.fullName,
    'UPDATE',
    'STUDENT',
    studentId,
    { action: 'Upload Document', document: fileName, docType },
    getClientIp(req)
  );

  res.status(201).json(document);
});

router.delete('/students/:id/documents/:docId', requireAuth, requireRole(['Admin', 'Staff']), (req: AuthenticatedRequest, res) => {
  const studentId = parseInt(req.params.id);
  const docId = parseInt(req.params.docId);

  const student = db.getStudentById(studentId);
  if (!student) {
    return res.status(404).json({ message: 'Student profile not found.' });
  }

  const removed = db.removeDocument(docId);
  if (!removed) {
    return res.status(404).json({ message: 'Document not found.' });
  }

  db.logAction(
    req.user!.id,
    req.user!.fullName,
    'UPDATE',
    'STUDENT',
    studentId,
    { action: 'Delete Document', docId },
    getClientIp(req)
  );

  res.json({ message: 'Document deleted successfully.' });
});

// ==========================================
// 6. REPORTS, ANALYTICS & EXPORT MODULE
// ==========================================

// GET Demographic data distribution
router.get('/reports/demographics', requireAuth, (req, res) => {
  const students = db.getStudents();
  
  const genderMap: Record<string, number> = { Male: 0, Female: 0, Other: 0 };
  const yearMap: Record<string, number> = { '1st Year': 0, '2nd Year': 0, '3rd Year': 0, '4th Year': 0 };
  const bloodMap: Record<string, number> = {};

  students.forEach(s => {
    if (genderMap[s.gender] !== undefined) genderMap[s.gender]++;
    else genderMap[s.gender] = 1;

    const yrKey = s.currentYear === 1 ? '1st Year' : s.currentYear === 2 ? '2nd Year' : s.currentYear === 3 ? '3rd Year' : '4th Year';
    genderMap[yrKey] = (genderMap[yrKey] || 0) + 1;
    yearMap[yrKey]++;

    if (s.bloodGroup) {
      bloodMap[s.bloodGroup] = (bloodMap[s.bloodGroup] || 0) + 1;
    }
  });

  const genderData = Object.keys(genderMap)
    .filter(k => ['Male', 'Female', 'Other'].includes(k))
    .map(key => ({ name: key, value: genderMap[key] }));

  const yearData = Object.keys(yearMap).map(key => ({ name: key, value: yearMap[key] }));
  const bloodData = Object.keys(bloodMap).map(key => ({ name: key, value: bloodMap[key] }));

  res.json({ gender: genderData, year: yearData, blood: bloodData });
});

// GET Enrollment trend metric over time
router.get('/reports/enrollments', requireAuth, (req, res) => {
  const students = db.getStudents();
  const trendMap: Record<string, number> = {};

  students.forEach(s => {
    if (s.enrollmentDate) {
      // Group by Year-Month e.g. "2026-01"
      const dateStr = s.enrollmentDate.substring(0, 7);
      trendMap[dateStr] = (trendMap[dateStr] || 0) + 1;
    }
  });

  // Sort dates chronologically
  const sortedDates = Object.keys(trendMap).sort();
  const enrollmentTrend = sortedDates.map(date => ({
    period: date,
    count: trendMap[date]
  }));

  res.json(enrollmentTrend);
});

// GET Student department distributions
router.get('/reports/departments', requireAuth, (req, res) => {
  const students = db.getStudents();
  const departments = db.getDepartments();

  const deptMap = departments.reduce((acc, dept) => {
    acc[dept.id] = { name: dept.code, count: 0, fullName: dept.name };
    return acc;
  }, {} as Record<number, { name: string; count: number; fullName: string }>);

  students.forEach(s => {
    if (deptMap[s.deptId]) {
      deptMap[s.deptId].count++;
    }
  });

  const deptData = Object.values(deptMap);
  res.json(deptData);
});

// Dynamic CSV/Excel Export route
router.get('/reports/export/csv', requireAuth, (req, res) => {
  const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
  const deptId = req.query.deptId ? parseInt(req.query.deptId as string) : null;
  const year = req.query.year ? parseInt(req.query.year as string) : null;
  const status = typeof req.query.status === 'string' ? req.query.status : '';

  let list = db.getStudents();

  if (search) {
    const q = search.toLowerCase();
    list = list.filter(s => 
      s.firstName.toLowerCase().includes(q) ||
      s.lastName.toLowerCase().includes(q) ||
      s.studentId.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q)
    );
  }
  if (deptId !== null && !isNaN(deptId)) {
    list = list.filter(s => s.deptId === deptId);
  }
  if (year !== null && !isNaN(year)) {
    list = list.filter(s => s.currentYear === year);
  }
  if (status) {
    list = list.filter(s => s.status.toLowerCase() === status.toLowerCase());
  }

  // Construct CSV String
  const headers = 'ID,Student ID,First Name,Last Name,Email,Phone,DOB,Gender,Blood Group,Department,Current Year,Status,Enrollment Date,City,Country\n';
  const depts = db.getDepartments();

  const rows = list.map(s => {
    const dept = depts.find(d => d.id === s.deptId)?.name || 'Unknown';
    return [
      s.id,
      `"${s.studentId}"`,
      `"${s.firstName}"`,
      `"${s.lastName}"`,
      `"${s.email}"`,
      `"${s.phone}"`,
      s.dob,
      s.gender,
      s.bloodGroup,
      `"${dept}"`,
      s.currentYear,
      s.status,
      s.enrollmentDate,
      `"${s.city}"`,
      `"${s.country}"`
    ].join(',');
  }).join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=students_report.csv');
  res.status(200).send(headers + rows);
});

// ==========================================
// 7. SYSTEM SETTINGS & UTILITIES
// ==========================================

// Global Audit logs retrieval
router.get('/system/logs', requireAuth, requireRole(['Admin']), (req, res) => {
  res.json(db.getLogs());
});

// Retrieve system setting values
router.get('/system/settings', requireAuth, (req, res) => {
  res.json(db.getSettings());
});

// Update setting values (Admin only)
router.put('/system/settings', requireAuth, requireRole(['Admin']), (req: AuthenticatedRequest, res) => {
  const updates = req.body; // Key-Value pair object
  
  if (!updates || typeof updates !== 'object') {
    return res.status(400).json({ message: 'Invalid settings body.' });
  }

  for (const [key, val] of Object.entries(updates)) {
    db.updateSetting(key, String(val));
  }

  db.logAction(
    req.user!.id,
    req.user!.fullName,
    'UPDATE',
    'SETTING',
    null,
    updates,
    getClientIp(req)
  );

  res.json({ message: 'Institutional preferences updated successfully.', settings: db.getSettings() });
});

// Backups administration
router.get('/system/backups', requireAuth, requireRole(['Admin']), (req, res) => {
  const backupDir = path.join(process.cwd(), 'backups');
  if (!fs.existsSync(backupDir)) {
    return res.json([]);
  }
  const files = fs.readdirSync(backupDir).filter(f => f.endsWith('.json'));
  const backups = files.map(file => {
    const stats = fs.statSync(path.join(backupDir, file));
    return {
      filename: file,
      size: stats.size,
      createdAt: stats.birthtime.toISOString(),
    };
  }).sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  res.json(backups);
});

router.post('/system/backup', requireAuth, requireRole(['Admin']), (req: AuthenticatedRequest, res) => {
  const filename = db.createBackup();

  db.logAction(
    req.user!.id,
    req.user!.fullName,
    'BACKUP',
    'SETTING',
    null,
    { backupFile: filename },
    getClientIp(req)
  );

  res.status(201).json({ message: 'System snapshot created successfully.', filename });
});

router.post('/system/restore', requireAuth, requireRole(['Admin']), (req: AuthenticatedRequest, res) => {
  const { filename } = req.body;
  if (!filename) {
    return res.status(400).json({ message: 'Filename parameter is required to restore database.' });
  }

  const success = db.restoreBackup(filename);
  if (!success) {
    return res.status(404).json({ message: 'Backup file could not be found or read.' });
  }

  db.logAction(
    req.user!.id,
    req.user!.fullName,
    'RESTORE',
    'SETTING',
    null,
    { restoredFile: filename },
    getClientIp(req)
  );

  res.json({ message: 'System database successfully restored from snapshot.' });
});

export default router;
