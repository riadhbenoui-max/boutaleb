
export type Role = 'ADMIN' | 'TEACHER';

export interface User {
  id: string;
  name: string;
  role: Role;
  subject?: string;
}

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  gender?: string;
  birthPlace?: string;
  guardianName?: string;
  address?: string;
  classId: string;
}

export interface ClassRoom {
  id: string;
  name: string; // e.g., 1AS1, 2TM2
}

export interface Session {
  id: number;
  time: string;
  isMorning: boolean;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string; // YYYY-MM-DD
  sessionId: number;
  status: 'ABSENT' | 'PRESENT' | 'LATE';
  markedBy: string; // Teacher ID;
}

export interface ScheduleItem {
  id: string;
  classId: string;
  teacherId: string;
  day: string; // "الأحد", "الاثنين", ...
  sessionId: number;
  room: string;
}
