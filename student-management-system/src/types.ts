export interface User {
  id: number;
  username: string;
  email: string;
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
  studentId: string;
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
}

export interface Document {
  id: number;
  studentId: number;
  docType: string;
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
  changes: string;
  ipAddress: string;
  timestamp: string;
  userName?: string;
}

export interface SystemSetting {
  key: string;
  value: string;
  description: string;
  updatedAt: string;
}

export interface Backup {
  filename: string;
  size: number;
  createdAt: string;
}
