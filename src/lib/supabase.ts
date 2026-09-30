import { createClient } from '@supabase/supabase-js';
import {
  ClassRoom,
  ScheduleItem,
  Assignment,
  Submission,
  Announcement,
  User,
} from '../types';

export const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || 'https://bcrsqzmantitndqtnecs.supabase.co';
export const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjcnNxem1hbnRpdG5kcXRuZWNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAxMDQ4ODIsImV4cCI6MjEwNTY4MDg4Mn0.N4CG9_H680Ux32ZfmFb1TOTRq6zVHhqIKKFW2idI0SA';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export const safeSupabaseCall = async <T>(promiseLike: PromiseLike<T>): Promise<T | null> => {
  try {
    return await Promise.resolve(promiseLike);
  } catch (err) {
    console.warn('Supabase call error:', err);
    return null;
  }
};

/**
 * SQL Schema for Supabase SQL Editor
 * Users can copy and run this in Supabase Dashboard -> SQL Editor to initialize all tables
 */
export const SUPABASE_SQL_SCHEMA = `-- ClassyWork Madrasah: Skrip Pembuatan Tabel Database Supabase
-- Jalankan skrip ini di: Supabase Dashboard -> SQL Editor -> New query -> Run

-- 1. Tabel Kelas (classes)
CREATE TABLE IF NOT EXISTS public.classes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  grade_level TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  teacher_id TEXT NOT NULL,
  teacher_name TEXT NOT NULL,
  academic_year TEXT NOT NULL,
  student_count INT DEFAULT 0,
  description TEXT DEFAULT '',
  banner_color TEXT DEFAULT 'indigo',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabel Jadwal Pelajaran (schedules)
CREATE TABLE IF NOT EXISTS public.schedules (
  id TEXT PRIMARY KEY,
  class_id TEXT NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  subject_name TEXT NOT NULL,
  teacher_name TEXT NOT NULL,
  day_of_week INT NOT NULL, -- 1=Senin, 2=Selasa, dst.
  start_time TEXT NOT NULL, -- "07:30"
  end_time TEXT NOT NULL,   -- "09:00"
  room_location TEXT DEFAULT '',
  color_theme TEXT DEFAULT 'indigo',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabel Tugas (assignments)
CREATE TABLE IF NOT EXISTS public.assignments (
  id TEXT PRIMARY KEY,
  class_id TEXT NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  subject_name TEXT NOT NULL,
  description TEXT DEFAULT '',
  due_date TEXT NOT NULL,
  attachments JSONB DEFAULT '[]'::jsonb,
  created_by TEXT NOT NULL,
  created_by_name TEXT NOT NULL,
  max_score INT DEFAULT 100,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabel Pengumpulan Tugas (submissions)
CREATE TABLE IF NOT EXISTS public.submissions (
  id TEXT PRIMARY KEY,
  assignment_id TEXT NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
  student_id TEXT NOT NULL,
  student_name TEXT NOT NULL,
  student_avatar TEXT DEFAULT '',
  file_name TEXT NOT NULL,
  file_size TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_url TEXT DEFAULT '',
  student_note TEXT DEFAULT '',
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  is_late BOOLEAN DEFAULT FALSE,
  grade INT,
  feedback TEXT DEFAULT '',
  graded_at TIMESTAMPTZ
);

-- 5. Tabel Pengumuman & Agenda (announcements)
CREATE TABLE IF NOT EXISTS public.announcements (
  id TEXT PRIMARY KEY,
  class_id TEXT NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT DEFAULT 'info',
  is_non_kbm_agenda BOOLEAN DEFAULT FALSE,
  event_date TEXT,
  event_time TEXT,
  location TEXT,
  created_by TEXT NOT NULL,
  created_by_name TEXT NOT NULL,
  likes_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Tabel Profil Pengguna (profiles)
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL, -- 'teacher' / 'student'
  avatar_url TEXT DEFAULT '',
  identifier_number TEXT DEFAULT '',
  class_name TEXT DEFAULT '',
  school_name TEXT DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mengaktifkan Row Level Security (RLS) dan mengizinkan akses publik anon
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Kebijakan Anon Full Access untuk aplikasi client
DROP POLICY IF EXISTS "Allow public read-write on classes" ON public.classes;
CREATE POLICY "Allow public read-write on classes" ON public.classes FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read-write on schedules" ON public.schedules;
CREATE POLICY "Allow public read-write on schedules" ON public.schedules FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read-write on assignments" ON public.assignments;
CREATE POLICY "Allow public read-write on assignments" ON public.assignments FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read-write on submissions" ON public.submissions;
CREATE POLICY "Allow public read-write on submissions" ON public.submissions FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read-write on announcements" ON public.announcements;
CREATE POLICY "Allow public read-write on announcements" ON public.announcements FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read-write on profiles" ON public.profiles;
CREATE POLICY "Allow public read-write on profiles" ON public.profiles FOR ALL TO anon USING (true) WITH CHECK (true);

-- 7. Izin Akses Tabel (GRANT) ke role anon dan authenticated (Wajib agar API Supabase bisa membaca & menulis)
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO anon, authenticated;

-- Aktifkan Realtime Replication untuk tabel
ALTER PUBLICATION supabase_realtime ADD TABLE public.classes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.schedules;
ALTER PUBLICATION supabase_realtime ADD TABLE public.assignments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.submissions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.announcements;
`;

export const SUPABASE_GRANT_SQL = `-- Skrip Cepat Perbaikan Izin (GRANT Privileges) di Supabase SQL Editor:
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO anon, authenticated;

DROP POLICY IF EXISTS "Allow public read-write on classes" ON public.classes;
CREATE POLICY "Allow public read-write on classes" ON public.classes FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read-write on schedules" ON public.schedules;
CREATE POLICY "Allow public read-write on schedules" ON public.schedules FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read-write on assignments" ON public.assignments;
CREATE POLICY "Allow public read-write on assignments" ON public.assignments FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read-write on submissions" ON public.submissions;
CREATE POLICY "Allow public read-write on submissions" ON public.submissions FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read-write on announcements" ON public.announcements;
CREATE POLICY "Allow public read-write on announcements" ON public.announcements FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read-write on profiles" ON public.profiles;
CREATE POLICY "Allow public read-write on profiles" ON public.profiles FOR ALL TO anon USING (true) WITH CHECK (true);
`;

// Helper converters between camelCase application types and snake_case Supabase records
export const mapClassFromDb = (row: any): ClassRoom => ({
  id: row.id,
  name: row.name,
  gradeLevel: row.grade_level,
  code: row.code,
  teacherId: row.teacher_id,
  teacherName: row.teacher_name,
  academicYear: row.academic_year,
  studentCount: row.student_count || 0,
  description: row.description || '',
  bannerColor: row.banner_color || 'indigo',
});

export const mapClassToDb = (cls: ClassRoom) => ({
  id: cls.id,
  name: cls.name,
  grade_level: cls.gradeLevel,
  code: cls.code,
  teacher_id: cls.teacherId,
  teacher_name: cls.teacherName,
  academic_year: cls.academicYear,
  student_count: cls.studentCount,
  description: cls.description,
  banner_color: cls.bannerColor,
});

export const mapScheduleFromDb = (row: any): ScheduleItem => ({
  id: row.id,
  classId: row.class_id,
  subjectName: row.subject_name,
  teacherName: row.teacher_name,
  dayOfWeek: row.day_of_week,
  startTime: row.start_time,
  endTime: row.end_time,
  roomLocation: row.room_location || '',
  colorTheme: row.color_theme || 'indigo',
  notes: row.notes || '',
});

export const mapScheduleToDb = (item: ScheduleItem) => ({
  id: item.id,
  class_id: item.classId,
  subject_name: item.subjectName,
  teacher_name: item.teacherName,
  day_of_week: item.dayOfWeek,
  start_time: item.startTime,
  end_time: item.endTime,
  room_location: item.roomLocation,
  color_theme: item.colorTheme,
  notes: item.notes || '',
});

export const mapAssignmentFromDb = (row: any): Assignment => ({
  id: row.id,
  classId: row.class_id,
  title: row.title,
  subjectName: row.subject_name,
  description: row.description || '',
  dueDate: row.due_date,
  attachments: Array.isArray(row.attachments) ? row.attachments : [],
  createdBy: row.created_by,
  createdByName: row.created_by_name,
  createdAt: row.created_at || new Date().toISOString(),
  maxScore: row.max_score || 100,
});

export const mapAssignmentToDb = (item: Assignment) => ({
  id: item.id,
  class_id: item.classId,
  title: item.title,
  subject_name: item.subjectName,
  description: item.description,
  due_date: item.dueDate,
  attachments: item.attachments,
  created_by: item.createdBy,
  created_by_name: item.createdByName,
  max_score: item.maxScore,
});

export const mapSubmissionFromDb = (row: any): Submission => ({
  id: row.id,
  assignmentId: row.assignment_id,
  studentId: row.student_id,
  studentName: row.student_name,
  studentAvatar: row.student_avatar || '',
  fileName: row.file_name,
  fileSize: row.file_size,
  fileType: row.file_type,
  fileUrl: row.file_url || '',
  studentNote: row.student_note || '',
  submittedAt: row.submitted_at,
  isLate: Boolean(row.is_late),
  grade: row.grade !== null && row.grade !== undefined ? Number(row.grade) : undefined,
  feedback: row.feedback || '',
  gradedAt: row.graded_at,
});

export const mapSubmissionToDb = (item: Submission) => ({
  id: item.id,
  assignment_id: item.assignmentId,
  student_id: item.studentId,
  student_name: item.studentName,
  student_avatar: item.studentAvatar,
  file_name: item.fileName,
  file_size: item.fileSize,
  file_type: item.fileType,
  file_url: item.fileUrl || '',
  student_note: item.studentNote || '',
  submitted_at: item.submittedAt,
  is_late: item.isLate,
  grade: item.grade ?? null,
  feedback: item.feedback || '',
  graded_at: item.gradedAt ?? null,
});

export const mapAnnouncementFromDb = (row: any): Announcement => ({
  id: row.id,
  classId: row.class_id,
  title: row.title,
  content: row.content,
  type: row.type || 'info',
  isNonKbmAgenda: Boolean(row.is_non_kbm_agenda),
  eventDate: row.event_date || undefined,
  eventTime: row.event_time || undefined,
  location: row.location || undefined,
  createdBy: row.created_by,
  createdByName: row.created_by_name,
  createdAt: row.created_at || new Date().toISOString(),
  likesCount: row.likes_count || 0,
});

export const mapAnnouncementToDb = (item: Announcement) => ({
  id: item.id,
  class_id: item.classId,
  title: item.title,
  content: item.content,
  type: item.type,
  is_non_kbm_agenda: item.isNonKbmAgenda,
  event_date: item.eventDate || null,
  event_time: item.eventTime || null,
  location: item.location || null,
  created_by: item.createdBy,
  created_by_name: item.createdByName,
  likes_count: item.likesCount || 0,
});
