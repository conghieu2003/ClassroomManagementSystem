// User types
export interface User {
  id: number;
  fullName: string;
  email: string;
  role: 'admin' | 'teacher' | 'student';
  teacherCode?: string | null;
  studentCode?: string | null;
}

export interface Student extends User {
  role: 'student';
  studentId: string;
  classId?: string;
}

export interface Teacher extends User {
  role: 'teacher';
  teacherId: string;
  department?: string;
  title?: string;
}

export interface Admin extends User {
  role: 'admin';
}

// Class types
export interface Class {
  id: string;
  name: string;
  description?: string;
  capacity: number;
  teacherId: string;
  subjectId: string;
  schedule: Schedule[];
  students: Student[];
  createdAt: Date;
  updatedAt: Date;
}

// Subject types
export interface Subject {
  id: string;
  name: string;
  code: string;
  description?: string;
  credits: number;
  createdAt: Date;
  updatedAt: Date;
}

// Schedule types
export interface Schedule {
  id: string;
  classId: string;
  roomId: string;
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  startDate: Date;
  endDate: Date;
  status?: string;
  subjectName?: string;
  roomName?: string;
  teacherName?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Room types
export interface Room {
  id: string;
  name: string;
  capacity: number;
  building: string;
  floor: number;
  roomNumber: string;
  equipment?: string[];
  isAvailable: boolean;
  type?: string;
  currentClass?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Room Request types
export interface RoomRequest {
  id: string;
  requesterId: string;
  roomId: string;
  purpose: string;
  startTime: Date;
  endTime: Date;
  status: 'pending' | 'approved' | 'rejected';
  reason?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Class Registration types
export interface ClassRegistration {
  id: string;
  studentId: string;
  classId: string;
  status: 'enrolled' | 'dropped' | 'completed';
  enrolledAt: Date;
  updatedAt: Date;
}

// Auth types
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errorCode?: string;
}

// Form types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea' | 'date' | 'time';
  required?: boolean;
  options?: { value: string; label: string }[];
  placeholder?: string;
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    custom?: (value: any) => string | null;
  };
}

// Navigation types
export interface MenuItem {
  id: string;
  title: string;
  path: string;
  icon?: string;
  children?: MenuItem[];
  roles?: string[];
}
