import { User, ClassRoom, ScheduleItem, Assignment, Submission, Announcement, AppNotification } from '../types';

// Clean flat-illustrated SVG avatars matching the #163E4B Deep Petrol & #F4A950 Warm Honey palette
export const AVATAR_STUDENT_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" fill="none">
    <rect width="120" height="120" rx="60" fill="#163E4B"/>
    <circle cx="96" cy="26" r="18" stroke="#245566" stroke-width="3"/>
    <path d="M26 120C26 95 41 82 60 82C79 82 94 95 94 120" fill="#F4A950"/>
    <circle cx="60" cy="50" r="21" fill="#FCEADE"/>
    <path d="M39 48C39 34 48 25 60 25C72 25 81 34 81 48C76 42 68 39 60 39C52 39 44 42 39 48Z" fill="#0E2A33"/>
    <circle cx="53" cy="51" r="2.3" fill="#163E4B"/>
    <circle cx="67" cy="51" r="2.3" fill="#163E4B"/>
    <path d="M55 59C57 61.5 63 61.5 65 59" stroke="#163E4B" stroke-width="2.2" stroke-linecap="round"/>
  </svg>`
)}`;

export const AVATAR_TEACHER_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" fill="none">
    <rect width="120" height="120" rx="60" fill="#163E4B"/>
    <circle cx="24" cy="28" r="16" stroke="#245566" stroke-width="3"/>
    <path d="M24 120C24 94 40 81 60 81C80 81 96 94 96 120" fill="#FCEADE"/>
    <path d="M48 82L60 98L72 82" fill="#F4A950"/>
    <circle cx="60" cy="49" r="21" fill="#FCEADE"/>
    <path d="M38 46C38 31 48 23 60 23C72 23 82 31 82 46C76 40 68 37 60 37C52 37 44 40 38 46Z" fill="#F4A950"/>
    <rect x="46" y="46" width="11" height="8" rx="3" stroke="#163E4B" stroke-width="2"/>
    <rect x="63" y="46" width="11" height="8" rx="3" stroke="#163E4B" stroke-width="2"/>
    <line x1="57" y1="50" x2="63" y2="50" stroke="#163E4B" stroke-width="2"/>
    <path d="M55 60C57.5 62 62.5 62 65 60" stroke="#163E4B" stroke-width="2.2" stroke-linecap="round"/>
  </svg>`
)}`;

export const INITIAL_STUDENT: User = {
  id: 'student-1',
  name: 'Afiqah Zahira',
  email: 'afiqahzahira17@gmail.com',
  role: 'student',
  avatarUrl: AVATAR_STUDENT_SVG,
  identifierNumber: 'NISN. 0092837410',
  schoolName: 'MTs',
  phone: '081234567890',
  isPhoneVerified: false,
  attendanceNumber: 1,
};

export const INITIAL_TEACHER: User = {
  id: 'teacher-1',
  name: 'Afiqah Zahira (Guru)',
  email: 'afiqahzahira17@gmail.com',
  role: 'teacher',
  avatarUrl: AVATAR_TEACHER_SVG,
  identifierNumber: 'NIP. 199501012022032001',
  schoolName: 'MTs',
  phone: '081298765432',
  isPhoneVerified: true,
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
