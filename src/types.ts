export type UserRole = 'student' | 'teacher';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl: string;
  identifierNumber: string; // NISN for student, NIP for teacher
  className?: string; // e.g. "X MIPA 1"
  schoolName: string;
}

export interface ClassRoom {
  id: string;
  name: string;
  gradeLevel: string; // e.g. "Kelas 10", "Kelas 11"
  code: string; // e.g. "X-MIPA1-2026"
  teacherId: string;
  teacherName: string;
  subjectDefault?: string;
  academicYear: string;
  studentCount: number;
  description: string;
  bannerColor: string; // Tailwind color theme identifier
}

export interface ScheduleItem {
  id: string;
  classId: string;
  subjectName: string;
  teacherName: string;
  dayOfWeek: number; // 1 = Senin, 2 = Selasa, 3 = Rabu, 4 = Kamis, 5 = Jumat, 6 = Sabtu
  startTime: string; // "07:30"
  endTime: string; // "09:00"
  roomLocation: string; // e.g. "Ruang 203", "Lab Komputer 1", "Lapangan Utama"
  colorTheme: string;
  notes?: string;
}

export interface AssignmentAttachment {
  name: string;
  size: string;
  type: string;
  url?: string;
}

export interface Assignment {
  id: string;
  classId: string;
  title: string;
  subjectName: string;
  description: string;
  dueDate: string; // ISO date string or "YYYY-MM-DDTHH:mm"
  attachments: AssignmentAttachment[];
  createdBy: string;
  createdByName: string;
  createdAt: string;
  maxScore: number;
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  studentAvatar: string;
  fileName: string;
  fileSize: string;
  fileType: string;
  fileUrl?: string;
  studentNote?: string;
  submittedAt: string; // ISO string
  isLate: boolean;
  grade?: number; // 0 - 100
  feedback?: string;
  gradedAt?: string;
}

export interface Announcement {
  id: string;
  classId: string;
  title: string;
  content: string;
  type: 'urgent' | 'info' | 'agenda';
  isNonKbmAgenda: boolean; // non-KBM agenda like Upacara, UTS, etc.
  eventDate?: string;
  eventTime?: string;
  location?: string;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  likesCount?: number;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'class_reminder' | 'assignment_reminder' | 'new_assignment' | 'announcement' | 'grade_posted';
  timestamp: string;
  isRead: boolean;
  relatedId?: string; // classId, assignmentId, etc.
  roomLocation?: string;
  dueTimeText?: string;
}
