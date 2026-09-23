import { User, ClassRoom, ScheduleItem, Assignment, Submission, Announcement, AppNotification } from '../types';

export const INITIAL_TEACHER: User = {
  id: 'teacher-1',
  name: 'Ustadz Ahmad Fauzi, S.Pd.I',
  email: 'ahmad.fauzi@mtsn1nusantara.sch.id',
  role: 'teacher',
  avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  identifierNumber: 'NIP. 198504122010011018',
  schoolName: 'MTs Negeri 1 Model Nusantara',
};

export const INITIAL_STUDENT: User = {
  id: 'student-1',
  name: 'Afiqah Zahira',
  email: 'afiqahzahira17@gmail.com',
  role: 'student',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  identifierNumber: 'NISN. 0092837410',
  schoolName: 'MTs Negeri 1 Model Nusantara',
};

export const DEMO_STUDENTS: User[] = [
  INITIAL_STUDENT,
  {
    id: 'student-2',
    name: 'Muhammad Fathir Rabbani',
    email: 'fathir.rabbani@student.mtsn1.sch.id',
    role: 'student',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    identifierNumber: 'NISN. 0092837411',
    schoolName: 'MTs Negeri 1 Model Nusantara',
  },
  {
    id: 'student-3',
    name: 'Fatimah Az-Zahra',
    email: 'fatimah.zahra@student.mtsn1.sch.id',
    role: 'student',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    identifierNumber: 'NISN. 0092837412',
    schoolName: 'MTs Negeri 1 Model Nusantara',
  },
  {
    id: 'student-4',
    name: 'Rayhan Pratama Al-Ghifari',
    email: 'rayhan.pratama@student.mtsn1.sch.id',
    role: 'student',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    identifierNumber: 'NISN. 0092837413',
    schoolName: 'MTs Negeri 1 Model Nusantara',
  }
];

// Empty list of classes so the user can create their own custom classes
export const INITIAL_CLASSES: ClassRoom[] = [];

// Schedules, assignments, submissions, announcements will be created dynamically under user-created classes
export const INITIAL_SCHEDULES: ScheduleItem[] = [];
export const INITIAL_ASSIGNMENTS: Assignment[] = [];
export const INITIAL_SUBMISSIONS: Submission[] = [];
export const INITIAL_ANNOUNCEMENTS: Announcement[] = [];
export const INITIAL_NOTIFICATIONS: AppNotification[] = [];
