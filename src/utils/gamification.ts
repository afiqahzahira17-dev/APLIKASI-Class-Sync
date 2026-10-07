import { UserBadge, Submission, Assignment } from '../types';

export const ALL_SYSTEM_BADGES: Omit<UserBadge, 'progress' | 'isUnlocked'>[] = [
  {
    id: 'first_submitter',
    name: 'Gerak Cepat',
    description: 'Mengumpulkan tugas di kelas untuk pertama kali',
    icon: 'Zap',
    category: 'submission',
    xpReward: 100,
  },
  {
    id: 'on_time_hero',
    name: 'Disiplin Waktu',
    description: 'Mengumpulkan tugas tepat waktu sebelum deadline',
    icon: 'Clock',
    category: 'submission',
    xpReward: 75,
  },
  {
    id: 'star_student',
    name: 'Bintang Prestasi',
    description: 'Mendapatkan nilai tugas memuaskan (85 - 100)',
    icon: 'Award',
    category: 'study',
    xpReward: 150,
  },
  {
    id: 'schedule_master',
    name: 'Pakar Jadwal',
    description: 'Memeriksa jadwal KBM harian & hadir tepat waktu',
    icon: 'CalendarCheck',
    category: 'attendance',
    xpReward: 50,
  },
  {
    id: 'active_collaborator',
    name: 'Sahabat Kelas',
    description: 'Bergabung di kelas aktif & membagikan kode kelas',
    icon: 'Users',
    category: 'collaborator',
    xpReward: 80,
  },
];

export const calculateLevel = (xp: number) => {
  if (xp >= 1000) return { level: 5, title: 'Master Prestasi', nextXp: 1500, prevXp: 1000 };
  if (xp >= 500) return { level: 4, title: 'Bintang Kelas', nextXp: 1000, prevXp: 500 };
  if (xp >= 250) return { level: 3, title: 'Siswa Berbakat', nextXp: 500, prevXp: 250 };
  if (xp >= 100) return { level: 2, title: 'Siswa Rajin', nextXp: 250, prevXp: 100 };
  return { level: 1, title: 'Siswa Pemula', nextXp: 100, prevXp: 0 };
};

export const computeBadges = (
  submissions: Submission[],
  currentUserId: string,
  classCount: number
): { badges: UserBadge[]; totalXp: number } => {
  const userSubmissions = submissions.filter((s) => s.studentId === currentUserId);
  const onTimeCount = userSubmissions.filter((s) => !s.isLate).length;
  const highGrades = userSubmissions.filter((s) => typeof s.grade === 'number' && s.grade >= 85).length;

  let totalXp = 50; // Welcome base XP

  const badges: UserBadge[] = ALL_SYSTEM_BADGES.map((b) => {
    let isUnlocked = false;
    let progress = 0;

    if (b.id === 'first_submitter') {
      progress = userSubmissions.length > 0 ? 100 : 0;
      isUnlocked = userSubmissions.length > 0;
    } else if (b.id === 'on_time_hero') {
      progress = onTimeCount > 0 ? 100 : 0;
      isUnlocked = onTimeCount > 0;
    } else if (b.id === 'star_student') {
      progress = highGrades > 0 ? 100 : 0;
      isUnlocked = highGrades > 0;
    } else if (b.id === 'schedule_master') {
      progress = 100;
      isUnlocked = true; // Unlocked when viewing schedule
    } else if (b.id === 'active_collaborator') {
      progress = classCount > 0 ? 100 : 0;
      isUnlocked = classCount > 0;
    }

    if (isUnlocked) {
      totalXp += b.xpReward;
    }

    return {
      ...b,
      progress,
      isUnlocked,
    };
  });

  return { badges, totalXp };
};
