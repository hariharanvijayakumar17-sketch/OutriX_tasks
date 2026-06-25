import fs from 'fs';
import path from 'path';

// Define the absolute path for our database file
const DB_FILE = path.join(process.cwd(), 'database.json');

// Interface Definitions matching the SQLite schema exactly
export interface User {
  id: number;
  username: string;
  email: string;
  passwordHash: string;
  fullName: string;
  role: 'Admin' | 'Staff' | 'Viewer';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Department {
  id: number;
  name: string;
  code: string;
  headOfDept: string;
}

export interface Student {
  id: number;
  studentId: string; // Institutional ID (e.g., SMS-2026-001)
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dob: string;
  gender: 'Male' | 'Female' | 'Other';
  bloodGroup: string;
  address: string;
  city: string;
  country: string;
  deptId: number;
  enrollmentDate: string;
  currentYear: number;
  status: 'Active' | 'Inactive' | 'Graduated' | 'On-Leave';
  profilePhoto: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}

export interface Document {
  id: number;
  studentId: number;
  docType: string; // e.g., "ID_PROOF", "TRANSCRIPT"
  fileName: string;
  filePath: string;
  fileSize: number;
  uploadedAt: string;
}

export interface ActivityLog {
  id: number;
  userId: number;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'RESTORE' | 'BACKUP';
  entity: 'STUDENT' | 'USER' | 'SETTING' | 'DEPARTMENT';
  entityId: number | null;
  changes: string; // JSON string of old vs new values
  ipAddress: string;
  timestamp: string;
  userName?: string; // Cached for easy lookup
}

export interface SystemSetting {
  key: string;
  value: string;
  description: string;
  updatedAt: string;
}

export interface DatabaseState {
  users: User[];
  departments: Department[];
  students: Student[];
  documents: Document[];
  activityLogs: ActivityLog[];
  systemSettings: SystemSetting[];
}

// Initial seed data to make the app look extremely professional out-of-the-box
const SEED_DEPARTMENTS: Department[] = [
  { id: 1, name: 'Computer Science & Engineering', code: 'CSE', headOfDept: 'Dr. Alan Turing' },
  { id: 2, name: 'Electrical & Electronics Engineering', code: 'EEE', headOfDept: 'Dr. Nikola Tesla' },
  { id: 3, name: 'Mechanical Engineering', code: 'ME', headOfDept: 'Dr. James Watt' },
  { id: 4, name: 'Physics & Astronomy', code: 'PHY', headOfDept: 'Dr. Albert Einstein' },
  { id: 5, name: 'Chemical Sciences', code: 'CHM', headOfDept: 'Dr. Marie Curie' },
];

const SEED_USERS: User[] = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@sms.edu',
    // pbkdf2 hashed password for 'admin123'
    passwordHash: '87f5f28b91ca2b0bedcf8f4d65a09ef9933f8604bcc4bd60fa4e3686c5c1ed8d', 
    fullName: 'Alex Vance (Administrator)',
    role: 'Admin',
    isActive: true,
    createdAt: new Date('2026-01-01T08:00:00Z').toISOString(),
    updatedAt: new Date('2026-01-01T08:00:00Z').toISOString(),
  },
  {
    id: 2,
    username: 'sarah_registrar',
    email: 'staff@sms.edu',
    // pbkdf2 hashed password for 'staff123'
    passwordHash: '69c8e134c2b5b46804eb1a06374a15d752573e37cddece1b1abca36e74c26d29',
    fullName: 'Sarah Jenkins (Registrar)',
    role: 'Staff',
    isActive: true,
    createdAt: new Date('2026-02-15T09:30:00Z').toISOString(),
    updatedAt: new Date('2026-02-15T09:30:00Z').toISOString(),
  },
  {
    id: 3,
    username: 'marcus_director',
    email: 'viewer@sms.edu',
    // pbkdf2 hashed password for 'viewer123'
    passwordHash: '3445b9b9c4b2f684651f5abde8f0b41b720b48ed5fb605e7ccf99b5b3f4828cb',
    fullName: 'Director Marcus',
    role: 'Viewer',
    isActive: true,
    createdAt: new Date('2026-03-10T10:00:00Z').toISOString(),
    updatedAt: new Date('2026-03-10T10:00:00Z').toISOString(),
  }
];

const SEED_STUDENTS: Student[] = [
  {
    id: 1,
    studentId: 'SMS-2026-001',
    firstName: 'Aarav',
    lastName: 'Sharma',
    email: 'aarav.sharma@sms.edu',
    phone: '+91 98765 43210',
    dob: '2004-05-12',
    gender: 'Male',
    bloodGroup: 'O+',
    address: '102, Shanti Kunj, Park Street',
    city: 'Mumbai',
    country: 'India',
    deptId: 1,
    enrollmentDate: '2026-01-10',
    currentYear: 1,
    status: 'Active',
    profilePhoto: '',
    createdAt: new Date('2026-01-10T09:00:00Z').toISOString(),
    updatedAt: new Date('2026-01-10T09:00:00Z').toISOString(),
    isDeleted: false,
  },
  {
    id: 2,
    studentId: 'SMS-2025-042',
    firstName: 'Ananya',
    lastName: 'Iyer',
    email: 'ananya.iyer@sms.edu',
    phone: '+91 91234 56789',
    dob: '2003-08-24',
    gender: 'Female',
    bloodGroup: 'A+',
    address: '45, Lakeview Road',
    city: 'Bengaluru',
    country: 'India',
    deptId: 1,
    enrollmentDate: '2025-07-15',
    currentYear: 2,
    status: 'Active',
    profilePhoto: '',
    createdAt: new Date('2025-07-15T10:30:00Z').toISOString(),
    updatedAt: new Date('2025-07-15T10:30:00Z').toISOString(),
    isDeleted: false,
  },
  {
    id: 3,
    studentId: 'SMS-2024-019',
    firstName: 'Rohan',
    lastName: 'Verma',
    email: 'rohan.verma@sms.edu',
    phone: '+91 88776 55443',
    dob: '2002-11-03',
    gender: 'Male',
    bloodGroup: 'B+',
    address: 'A-12, Green Glen Layout',
    city: 'New Delhi',
    country: 'India',
    deptId: 3,
    enrollmentDate: '2024-07-20',
    currentYear: 3,
    status: 'Active',
    profilePhoto: '',
    createdAt: new Date('2024-07-20T11:00:00Z').toISOString(),
    updatedAt: new Date('2024-07-20T11:00:00Z').toISOString(),
    isDeleted: false,
  },
  {
    id: 4,
    studentId: 'SMS-2023-005',
    firstName: 'Priya',
    lastName: 'Patel',
    email: 'priya.patel@sms.edu',
    phone: '+91 77665 44332',
    dob: '2001-02-18',
    gender: 'Female',
    bloodGroup: 'AB+',
    address: 'Flat 501, Heights Residency',
    city: 'Ahmedabad',
    country: 'India',
    deptId: 2,
    enrollmentDate: '2023-07-18',
    currentYear: 4,
    status: 'Graduated',
    profilePhoto: '',
    createdAt: new Date('2023-07-18T09:15:00Z').toISOString(),
    updatedAt: new Date('2026-05-30T16:00:00Z').toISOString(),
    isDeleted: false,
  },
  {
    id: 5,
    studentId: 'SMS-2025-081',
    firstName: 'Kabir',
    lastName: 'Singh',
    email: 'kabir.singh@sms.edu',
    phone: '+91 99887 76655',
    dob: '2003-12-30',
    gender: 'Male',
    bloodGroup: 'O-',
    address: '88, Royal Enclave',
    city: 'Chandigarh',
    country: 'India',
    deptId: 4,
    enrollmentDate: '2025-07-22',
    currentYear: 2,
    status: 'Active',
    profilePhoto: '',
    createdAt: new Date('2025-07-22T14:20:00Z').toISOString(),
    updatedAt: new Date('2025-07-22T14:20:00Z').toISOString(),
    isDeleted: false,
  },
  {
    id: 6,
    studentId: 'SMS-2026-002',
    firstName: 'Sanya',
    lastName: 'Sen',
    email: 'sanya.sen@sms.edu',
    phone: '+91 93344 55667',
    dob: '2004-01-14',
    gender: 'Female',
    bloodGroup: 'B-',
    address: '12B, Ballygunge Circular Rd',
    city: 'Kolkata',
    country: 'India',
    deptId: 5,
    enrollmentDate: '2026-01-15',
    currentYear: 1,
    status: 'Active',
    profilePhoto: '',
    createdAt: new Date('2026-01-15T11:30:00Z').toISOString(),
    updatedAt: new Date('2026-01-15T11:30:00Z').toISOString(),
    isDeleted: false,
  },
  {
    id: 7,
    studentId: 'SMS-2025-099',
    firstName: 'Dev',
    lastName: 'Mehta',
    email: 'dev.mehta@sms.edu',
    phone: '+91 95555 44444',
    dob: '2003-04-05',
    gender: 'Male',
    bloodGroup: 'A-',
    address: 'Plot 4, Sector 15',
    city: 'Pune',
    country: 'India',
    deptId: 2,
    enrollmentDate: '2025-07-25',
    currentYear: 2,
    status: 'Inactive',
    profilePhoto: '',
    createdAt: new Date('2025-07-25T10:00:00Z').toISOString(),
    updatedAt: new Date('2026-04-10T12:00:00Z').toISOString(),
    isDeleted: false,
  },
  {
    id: 8,
    studentId: 'SMS-2026-003',
    firstName: 'Tara',
    lastName: 'Deshmukh',
    email: 'tara.deshmukh@sms.edu',
    phone: '+91 96666 77777',
    dob: '2004-09-09',
    gender: 'Female',
    bloodGroup: 'O+',
    address: '56, Hill View Colony',
    city: 'Nagpur',
    country: 'India',
    deptId: 1,
    enrollmentDate: '2026-01-20',
    currentYear: 1,
    status: 'Active',
    profilePhoto: '',
    createdAt: new Date('2026-01-20T14:45:00Z').toISOString(),
    updatedAt: new Date('2026-01-20T14:45:00Z').toISOString(),
    isDeleted: false,
  },
  {
    id: 9,
    studentId: 'SMS-2024-112',
    firstName: 'Aditya',
    lastName: 'Nair',
    email: 'aditya.nair@sms.edu',
    phone: '+91 97777 88888',
    dob: '2002-06-21',
    gender: 'Male',
    bloodGroup: 'B+',
    address: 'Deepam Villa, Marine Drive',
    city: 'Kochi',
    country: 'India',
    deptId: 4,
    enrollmentDate: '2024-07-19',
    currentYear: 3,
    status: 'On-Leave',
    profilePhoto: '',
    createdAt: new Date('2024-07-19T09:00:00Z').toISOString(),
    updatedAt: new Date('2026-02-10T15:30:00Z').toISOString(),
    isDeleted: false,
  },
  {
    id: 10,
    studentId: 'SMS-2025-103',
    firstName: 'Meera',
    lastName: 'Krishnan',
    email: 'meera.krishnan@sms.edu',
    phone: '+91 98888 99999',
    dob: '2003-10-15',
    gender: 'Female',
    bloodGroup: 'AB-',
    address: '77, Temple Road',
    city: 'Chennai',
    country: 'India',
    deptId: 5,
    enrollmentDate: '2025-07-28',
    currentYear: 2,
    status: 'Active',
    profilePhoto: '',
    createdAt: new Date('2025-07-28T11:15:00Z').toISOString(),
    updatedAt: new Date('2025-07-28T11:15:00Z').toISOString(),
    isDeleted: false,
  }
];

const SEED_SETTINGS: SystemSetting[] = [
  { key: 'school_name', value: 'SMS Institute of Technology', description: 'The official name of the educational institution displayed across reports and headers.', updatedAt: new Date().toISOString() },
  { key: 'school_logo', value: '', description: 'Custom logo image URL or base64 encoded graphic.', updatedAt: new Date().toISOString() },
  { key: 'school_address', value: 'Campus Complex, Powai, Mumbai - 400076', description: 'Institutional physical address.', updatedAt: new Date().toISOString() },
  { key: 'school_contact', value: '+91 22 2576 7000 | admin@sms.edu', description: 'Contact phone number and email.', updatedAt: new Date().toISOString() },
  { key: 'default_page_size', value: '10', description: 'Default table pagination limit.', updatedAt: new Date().toISOString() },
];

const SEED_LOGS: ActivityLog[] = [
  {
    id: 1,
    userId: 1,
    action: 'LOGIN',
    entity: 'USER',
    entityId: 1,
    changes: '{}',
    ipAddress: '127.0.0.1',
    timestamp: new Date('2026-06-25T08:30:00Z').toISOString(),
    userName: 'Alex Vance (Administrator)'
  },
  {
    id: 2,
    userId: 1,
    action: 'CREATE',
    entity: 'DEPARTMENT',
    entityId: 1,
    changes: '{"name":"Computer Science & Engineering"}',
    ipAddress: '127.0.0.1',
    timestamp: new Date('2026-06-25T08:35:00Z').toISOString(),
    userName: 'Alex Vance (Administrator)'
  },
  {
    id: 3,
    userId: 2,
    action: 'CREATE',
    entity: 'STUDENT',
    entityId: 1,
    changes: '{"studentId":"SMS-2026-001","firstName":"Aarav","lastName":"Sharma"}',
    ipAddress: '127.0.0.1',
    timestamp: new Date('2026-06-25T09:12:00Z').toISOString(),
    userName: 'Sarah Jenkins (Registrar)'
  }
];

class Database {
  private state: DatabaseState = {
    users: [],
    departments: [],
    students: [],
    documents: [],
    activityLogs: [],
    systemSettings: [],
  };

  constructor() {
    this.init();
  }

  private init() {
    if (fs.existsSync(DB_FILE)) {
      try {
        const data = fs.readFileSync(DB_FILE, 'utf-8');
        this.state = JSON.parse(data);
      } catch (err) {
        console.error('Failed to load database. Re-initializing seed data.', err);
        this.loadSeeds();
        this.save();
      }
    } else {
      console.log('Database not found. Creating a new database with rich seed data...');
      this.loadSeeds();
      this.save();
    }
  }

  private loadSeeds() {
    this.state.users = [...SEED_USERS];
    this.state.departments = [...SEED_DEPARTMENTS];
    this.state.students = [...SEED_STUDENTS];
    this.state.documents = [];
    this.state.activityLogs = [...SEED_LOGS];
    this.state.systemSettings = [...SEED_SETTINGS];
  }

  public save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.state, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to save database state to disk:', err);
    }
  }

  // Backup & Restore
  public createBackup(): string {
    const backupDir = path.join(process.cwd(), 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `backup-${timestamp}.json`;
    const backupPath = path.join(backupDir, filename);
    fs.writeFileSync(backupPath, JSON.stringify(this.state, null, 2), 'utf-8');
    return filename;
  }

  public restoreBackup(filename: string): boolean {
    const backupPath = path.join(process.cwd(), 'backups', filename);
    if (!fs.existsSync(backupPath)) {
      return false;
    }
    try {
      const data = fs.readFileSync(backupPath, 'utf-8');
      const restored = JSON.parse(data);
      // Validate structural schema briefly
      if (restored.users && restored.students && restored.departments) {
        this.state = restored;
        this.save();
        return true;
      }
    } catch (err) {
      console.error('Failed to restore backup:', err);
    }
    return false;
  }

  // Users Repositories
  public getUsers(): User[] {
    return this.state.users;
  }

  public getUserById(id: number): User | undefined {
    return this.state.users.find(u => u.id === id);
  }

  public getUserByEmail(email: string): User | undefined {
    return this.state.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  public createUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): User {
    const newId = this.state.users.reduce((max, u) => u.id > max ? u.id : max, 0) + 1;
    const newUser: User = {
      ...user,
      id: newId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.state.users.push(newUser);
    this.save();
    return newUser;
  }

  public updateUser(id: number, updates: Partial<Omit<User, 'id' | 'createdAt'>>): User | null {
    const index = this.state.users.findIndex(u => u.id === id);
    if (index === -1) return null;
    this.state.users[index] = {
      ...this.state.users[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.save();
    return this.state.users[index];
  }

  public deleteUser(id: number): boolean {
    const index = this.state.users.findIndex(u => u.id === id);
    if (index === -1) return false;
    this.state.users.splice(index, 1);
    this.save();
    return true;
  }

  // Departments Repositories
  public getDepartments(): Department[] {
    return this.state.departments;
  }

  public getDepartmentById(id: number): Department | undefined {
    return this.state.departments.find(d => d.id === id);
  }

  public createDepartment(dept: Omit<Department, 'id'>): Department {
    const newId = this.state.departments.reduce((max, d) => d.id > max ? d.id : max, 0) + 1;
    const newDept: Department = {
      ...dept,
      id: newId,
    };
    this.state.departments.push(newDept);
    this.save();
    return newDept;
  }

  // Students Repositories
  public getStudents(): Student[] {
    return this.state.students.filter(s => !s.isDeleted);
  }

  public getStudentById(id: number): Student | undefined {
    const student = this.state.students.find(s => s.id === id);
    if (student?.isDeleted) return undefined;
    return student;
  }

  public getStudentByInstitutionalId(studentId: string): Student | undefined {
    const student = this.state.students.find(s => s.studentId.toUpperCase() === studentId.toUpperCase());
    if (student?.isDeleted) return undefined;
    return student;
  }

  public getStudentByEmail(email: string): Student | undefined {
    const student = this.state.students.find(s => s.email.toLowerCase() === email.toLowerCase());
    if (student?.isDeleted) return undefined;
    return student;
  }

  public createStudent(student: Omit<Student, 'id' | 'createdAt' | 'updatedAt' | 'isDeleted'>): Student {
    const newId = this.state.students.reduce((max, s) => s.id > max ? s.id : max, 0) + 1;
    const newStudent: Student = {
      ...student,
      id: newId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDeleted: false,
    };
    this.state.students.push(newStudent);
    this.save();
    return newStudent;
  }

  public updateStudent(id: number, updates: Partial<Omit<Student, 'id' | 'createdAt' | 'isDeleted'>>): Student | null {
    const index = this.state.students.findIndex(s => s.id === id);
    if (index === -1 || this.state.students[index].isDeleted) return null;
    this.state.students[index] = {
      ...this.state.students[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.save();
    return this.state.students[index];
  }

  public softDeleteStudent(id: number): boolean {
    const index = this.state.students.findIndex(s => s.id === id);
    if (index === -1) return false;
    this.state.students[index].isDeleted = true;
    this.state.students[index].updatedAt = new Date().toISOString();
    this.save();
    return true;
  }

  // Documents
  public getDocumentsByStudentId(studentId: number): Document[] {
    return this.state.documents.filter(d => d.studentId === studentId);
  }

  public addDocument(doc: Omit<Document, 'id' | 'uploadedAt'>): Document {
    const newId = this.state.documents.reduce((max, d) => d.id > max ? d.id : max, 0) + 1;
    const newDoc: Document = {
      ...doc,
      id: newId,
      uploadedAt: new Date().toISOString(),
    };
    this.state.documents.push(newDoc);
    this.save();
    return newDoc;
  }

  public removeDocument(id: number): boolean {
    const index = this.state.documents.findIndex(d => d.id === id);
    if (index === -1) return false;
    this.state.documents.splice(index, 1);
    this.save();
    return true;
  }

  // Settings
  public getSettings(): SystemSetting[] {
    return this.state.systemSettings;
  }

  public getSetting(key: string): string {
    const setting = this.state.systemSettings.find(s => s.key === key);
    return setting ? setting.value : '';
  }

  public updateSetting(key: string, value: string): boolean {
    const setting = this.state.systemSettings.find(s => s.key === key);
    if (setting) {
      setting.value = value;
      setting.updatedAt = new Date().toISOString();
      this.save();
      return true;
    } else {
      this.state.systemSettings.push({
        key,
        value,
        description: 'Dynamically added system setting',
        updatedAt: new Date().toISOString()
      });
      this.save();
      return true;
    }
  }

  // Activity Logs
  public getLogs(): ActivityLog[] {
    return this.state.activityLogs;
  }

  public logAction(userId: number, userName: string, action: ActivityLog['action'], entity: ActivityLog['entity'], entityId: number | null, changes: Record<string, any>, ipAddress = '127.0.0.1') {
    const newId = this.state.activityLogs.reduce((max, l) => l.id > max ? l.id : max, 0) + 1;
    const log: ActivityLog = {
      id: newId,
      userId,
      action,
      entity,
      entityId,
      changes: JSON.stringify(changes),
      ipAddress,
      timestamp: new Date().toISOString(),
      userName,
    };
    this.state.activityLogs.unshift(log); // Prepend so newest is first
    // Keep last 1000 logs to prevent unbounded file size
    if (this.state.activityLogs.length > 1000) {
      this.state.activityLogs.pop();
    }
    this.save();
  }
}

export const db = new Database();
