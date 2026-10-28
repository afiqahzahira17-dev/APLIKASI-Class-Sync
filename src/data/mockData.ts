import {
  User,
  ClassRoom,
  ScheduleItem,
  Assignment,
  Submission,
  Announcement,
  AppNotification,
} from '../types';

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

// Daftar Resmi 32 Siswa Terdaftar (Sesuai Presensi Siswa Kelas IX A)
// Kata sandi awal seluruh siswa: "0000" (dapat diubah oleh masing-masing siswa setelah masuk)
const PRESENSI_IX_A_ROSTER: { no: number; nis: string; name: string }[] = [
  { no: 1, nis: '0123866438', name: 'ABID RAZA AQILLA HASFIAN' },
  { no: 2, nis: '0123925482', name: 'AFIQAH ZAHIRA ASTKA' },
  { no: 3, nis: '3120165052', name: 'AHMAD FIRNAZ DZAL AIDI' },
  { no: 4, nis: '0124439278', name: 'ALEN RAMADANI EKDIR' },
  { no: 5, nis: '0126668350', name: 'ANA ALTHOFU NISA' },
  { no: 6, nis: '3124652885', name: 'ANDI MAITALIDIYANI M.' },
  { no: 7, nis: '0126338680', name: 'ANNISA ININNAWA NABI' },
  { no: 8, nis: '0123473724', name: 'ASIFA NUR FAIZAH' },
  { no: 9, nis: '0118980009', name: 'ASYIFA MUTMAINNAH' },
  { no: 10, nis: '0121894153', name: 'AVISCHA DWI ULANDARY' },
  { no: 11, nis: '0116268914', name: 'DHEAN SUWARDHANI KUDUS' },
  { no: 12, nis: '0129361551', name: 'DWI NUR ANGGRAENI' },
  { no: 13, nis: '0125990352', name: 'FADHILAH KHAERUNNISA' },
  { no: 14, nis: '0115445503', name: 'FILZAH RIZKIA RAMADHANI' },
  { no: 15, nis: '0123428941', name: 'FIOREN KHANZA FAISAL' },
  { no: 16, nis: '0114079763', name: 'IKRAM AL MUGHNI' },
  { no: 17, nis: '0125843587', name: 'INAYAH PUTRI' },
  { no: 18, nis: '0115397895', name: 'IZAN AFIF ADITYA' },
  { no: 19, nis: '0127851612', name: 'LA ODE MUHAMMAD AMIRUL HAMZAH' },
  { no: 20, nis: '0118377604', name: 'MUH. AKBAR PRATAMA' },
  { no: 21, nis: '0127211672', name: 'MUH. FAJRUL JANUARD' },
  { no: 22, nis: '0125915904', name: 'MUH. IRSYAD PRATAMA IRMAN' },
  { no: 23, nis: '3126061986', name: 'MUHAMMAD ALFIAN FADHILAN IRWAN' },
  { no: 24, nis: '0124346278', name: 'MUHAMMAD FAQIH TARIMANU AL-AHMAD' },
  { no: 25, nis: '0126426068', name: 'MUHAMMAD RAFFA SEHEREZAD' },
  { no: 26, nis: '3129770130', name: 'NASYA NURUL AQHILLA' },
  { no: 27, nis: '0124205302', name: 'NAYLA AZZAHRA' },
  { no: 28, nis: '0121524080', name: 'NAYLHA ALYA SYAHIRA AGUSTIN' },
  { no: 29, nis: '3114395697', name: 'RAFAH FURQON' },
  { no: 30, nis: '0127059514', name: 'SITI MAYMUN' },
  { no: 31, nis: '0129046702', name: 'UFAIRA SABILA MUTMAINNAH' },
  { no: 32, nis: '0127198270', name: 'YUSKHALIFAH ZAHWA AL HADI' },
];

export const REGISTERED_STUDENTS_SEED: User[] = PRESENSI_IX_A_ROSTER.map((item) => ({
  id: `student-ixa-${String(item.no).padStart(2, '0')}`,
  name: item.name,
  email: `${item.nis}@siswa.classywork.local`,
  password: '0000',
  hasChangedPassword: false,
  role: 'student',
  avatarUrl: AVATAR_STUDENT_SVG,
  identifierNumber: `NIS. ${item.nis}`,
  schoolName: 'MTs / SMP',
  isPhoneVerified: false,
  attendanceNumber: item.no,
}));

export const INITIAL_STUDENT: User = REGISTERED_STUDENTS_SEED[1];

export const INITIAL_TEACHER: User = {
  id: 'teacher-1',
  name: 'Guru Pengampu',
  email: 'guru@sekolah.sch.id',
  password: '123',
  role: 'teacher',
  avatarUrl: AVATAR_TEACHER_SVG,
  identifierNumber: 'NIP. 199501012022032001',
  schoolName: 'MTs / SMP',
  phone: '081298765432',
  isPhoneVerified: true,
};

export const DEMO_STUDENTS: User[] = REGISTERED_STUDENTS_SEED;

// Empty list of classes by default so teachers create custom classes and share codes
export const INITIAL_CLASSES: ClassRoom[] = [];
export const INITIAL_SCHEDULES: ScheduleItem[] = [];
export const INITIAL_ASSIGNMENTS: Assignment[] = [];
export const INITIAL_SUBMISSIONS: Submission[] = [];
export const INITIAL_ANNOUNCEMENTS: Announcement[] = [];
export const INITIAL_NOTIFICATIONS: AppNotification[] = [];
