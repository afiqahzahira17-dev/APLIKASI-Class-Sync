export type UserRole = 'student' | 'teacher';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  hasChangedPassword?: boolean;
  role: UserRole;
  avatarUrl: string;
  identifierNumber: string; // NIS for student, NIP for teacher
  className?: string; // e.g. "IX A"
  joinedClassIds?: string[]; // Mendukung gabung ke 2 kelas atau lebih
  schoolName: string;
  phone?: string; // WhatsApp number
  isPhoneVerified?: boolean; // Verifikasi nomor WhatsApp guru agar tidak disalahgunakan
  attendanceNumber?: number; // Nomor urut absen siswa (1, 2, 3...)
  xp?: number;
  level?: number;
}

export interface UserBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'submission' | 'attendance' | 'study' | 'collaborator';
  xpReward: number;
  unlockedAt?: string;
  progress: number; // 0 to 100
  isUnlocked: boolean;
}

export interface XpBreakdown {
  baseXp: number;
  badgesXp: number;
  verifiedBonusXp: number;
  expiredPenaltyXp: number;
  totalXp: number;
}

export interface PrivacySettings {
  hideSpecificLocations: boolean; // sembunyikan nama ruangan spesifik dari publik
  membersOnlySchedule: boolean; // jadwal hanya terlihat oleh anggota kelas
  showStudyStats: boolean; // tampilkan badge dan level prestasi
  dataEncryptionEnabled: boolean; // enkripsi penyimpanan lokal
}

export interface ClassRoom {
  id: string;
  name: string;
  gradeLevel: string; // e.g. "Kelas 10", "Kelas 11"
  code: string; // e.g. "X-MIPA1-2026"
  teacherId: string;
  teacherName: string;
  teacherPhone?: string; // Kontak WhatsApp resmi guru
  isTeacherVerified?: boolean; // Status verifikasi nomor guru
  subjectDefault?: string;
  academicYear: string;
  studentCount: number;
  memberIds?: string[]; // Daftar ID pengguna yang tergabung di kelas ini
  description: string;
  bannerColor: string; // Tailwind color theme identifier
}

export interface ScheduleItem {
  id: string;
  classId: string;
  subjectName: string;
  teacherName: string;
  teacherPhone?: string; // Kontak WhatsApp guru pengampu
  isTeacherVerified?: boolean; // Status verifikasi nomor guru
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
  xpPenaltyOverdue?: number; // Pengurangan XP jika tidak mengumpulkan sampai tenggat (default 30)
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  studentAvatar: string;
  attendanceNumber?: number; // Nomor urut absen siswa saat mengumpulkan
  fileName: string;
  fileSize: string;
  fileType: string;
  fileUrl?: string;
  studentNote?: string;
  submittedAt: string; // ISO string
  isLate: boolean;
  status?: 'pending_verification' | 'verified' | 'rejected'; // Verifikasi guru
  verifiedAt?: string;
  verifiedBy?: string;
  xpAwarded?: number; // XP bertambah saat diverifikasi oleh guru
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
  isNonKbmAgenda: boolean; // non-KBM agenda like UTS, Kegiatan Peringatan, dll.
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

export interface WitaTimeInfo {
  date: Date;
  dayOfWeek: number; // 1 = Senin, 2 = Selasa, 3 = Rabu, 4 = Kamis, 5 = Jumat, 6 = Sabtu, 7 = Minggu
  dayName: string;
  formattedDate: string; // "Rabu, 14 Oktober 2026"
  formattedTime: string; // "08:15"
  formattedTimeWithSeconds: string; // "08:15:30"
  hours: number;
  minutes: number;
  seconds: number;
  totalMinutes: number; // hours * 60 + minutes
  timezoneLabel: string; // "WITA (UTC+8)"
}
