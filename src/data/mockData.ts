import { User, ClassRoom, ScheduleItem, Assignment, Submission, Announcement, AppNotification } from '../types';

export const INITIAL_STUDENT: User = {
  id: 'student-1',
  name: 'Afiqah Zahira',
  email: 'afiqahzahira17@gmail.com',
  role: 'student',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  identifierNumber: 'NISN. 0092837410',
  schoolName: 'MTs',
};

export const INITIAL_TEACHER: User = {
  id: 'teacher-1',
  name: 'Afiqah Zahira (Guru)',
  email: 'afiqahzahira17@gmail.com',
  role: 'teacher',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  identifierNumber: 'NIP. 199501012022032001',
  schoolName: 'MTs',
};

// Clean real users only - no sample/fake students
export const DEMO_STUDENTS: User[] = [INITIAL_STUDENT];

// Empty list of classes so the user can create their own custom classes
export const INITIAL_CLASSES: ClassRoom[] = [];

// Schedules, assignments, submissions, announcements will be created dynamically under user-created classes
export const INITIAL_SCHEDULES: ScheduleItem[] = [];
export const INITIAL_ASSIGNMENTS: Assignment[] = [];
export const INITIAL_SUBMISSIONS: Submission[] = [];
export const INITIAL_ANNOUNCEMENTS: Announcement[] = [];
export const INITIAL_NOTIFICATIONS: AppNotification[] = [];
