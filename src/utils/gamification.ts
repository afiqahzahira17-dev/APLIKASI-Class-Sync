import { UserBadge, Submission, Assignment, XpBreakdown } from '../types';

export const ALL_SYSTEM_BADGES: Omit<UserBadge, 'progress' | 'isUnlocked'>[] = [
  {
    id: 'first_submitter',
    name: 'Gerak Cepat',
    description: 'Tugas pertama Anda berhasil diverifikasi oleh guru',
    icon: 'Zap',
    category: 'submission',
    xpReward: 100,
  },
  {
    id: 'on_time_hero',
    name: 'Disiplin Waktu',
    description: 'Mengumpulkan tugas tepat waktu dan disetujui guru',
    icon: 'Clock',
    category: 'submission',
    xpReward: 75,
  },
  {
    id: 'star_student',
    name: 'Bintang Prestasi',
    description: 'Mendapatkan nilai tugas memuaskan (85 - 100) dari guru',
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
    description: 'Bergabung di kelas aktif & terhubung dengan guru',
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
  assignments: Assignment[],
  currentUserId: string,
  classCount: number,
  simulatedTimeStr?: string
): {
  badges: UserBadge[];
  totalXp: number;
  breakdown: XpBreakdown;
  expiredUnsubmittedAssignments: Assignment[];
} => {
  const userSubmissions = submissions.filter((s) => s.studentId === currentUserId);
  const verifiedSubmissions = userSubmissions.filter((s) => s.status === 'verified');
  const onTimeCount = verifiedSubmissions.filter((s) => !s.isLate).length;
  const highGrades = verifiedSubmissions.filter(
    (s) => typeof s.grade === 'number' && s.grade >= 85
  ).length;

  const now = new Date();

  // Find assignments in user's classes that are overdue/expired and NOT submitted by this student
  const submittedAssignmentIds = new Set(userSubmissions.map((s) => s.assignmentId));
  const expiredUnsubmittedAssignments = assignments.filter((a) => {
    const isPastDue = now > new Date(a.dueDate);
    return isPastDue && !submittedAssignmentIds.has(a.id);
  });

  const baseXp = 50; // Modal awal siswa

  // Calculate XP bonus from verified submissions (menyala saat diverifikasi guru)
  let verifiedBonusXp = 0;
  verifiedSubmissions.forEach((sub) => {
    // Base verified reward
    verifiedBonusXp += sub.xpAwarded || 75;
    // On-time bonus
    if (!sub.isLate) {
      verifiedBonusXp += 25;
    }
    // High grade bonus
    if (typeof sub.grade === 'number' && sub.grade >= 85) {
      verifiedBonusXp += 50;
    }
  });

  // Calculate XP penalty from expired unsubmitted assignments (pengurangan XP karena tugas kadaluwarsa)
  let expiredPenaltyXp = 0;
  expiredUnsubmittedAssignments.forEach((a) => {
    expiredPenaltyXp += a.xpPenaltyOverdue || 30;
  });

  // Calculate unlocked badges XP
  let badgesXp = 0;
  const badges: UserBadge[] = ALL_SYSTEM_BADGES.map((b) => {
    let isUnlocked = false;
    let progress = 0;

    if (b.id === 'first_submitter') {
      progress = verifiedSubmissions.length > 0 ? 100 : 0;
      isUnlocked = verifiedSubmissions.length > 0;
    } else if (b.id === 'on_time_hero') {
      progress = onTimeCount > 0 ? 100 : 0;
      isUnlocked = onTimeCount > 0;
    } else if (b.id === 'star_student') {
      progress = highGrades > 0 ? 100 : 0;
      isUnlocked = highGrades > 0;
    } else if (b.id === 'schedule_master') {
      progress = 100;
      isUnlocked = true;
    } else if (b.id === 'active_collaborator') {
      progress = classCount > 0 ? 100 : 0;
      isUnlocked = classCount > 0;
    }

    if (isUnlocked) {
      badgesXp += b.xpReward;
    }

    return {
      ...b,
      progress,
      isUnlocked,
    };
  });

  const rawTotal = baseXp + badgesXp + verifiedBonusXp - expiredPenaltyXp;
  const totalXp = Math.max(0, rawTotal);

  return {
    badges,
    totalXp,
    breakdown: {
      baseXp,
      badgesXp,
      verifiedBonusXp,
      expiredPenaltyXp,
      totalXp,
    },
    expiredUnsubmittedAssignments,
  };
};
