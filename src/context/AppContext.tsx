import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  User,
  UserRole,
  ClassRoom,
  ScheduleItem,
  Assignment,
  Submission,
  Announcement,
  AppNotification,
  UserBadge,
  PrivacySettings,
  XpBreakdown,
  WitaTimeInfo,
} from '../types';
import { computeBadges, calculateLevel } from '../utils/gamification';
import { getWitaNow, minutesToTimeString, timeToMinutes } from '../utils/witaTime';
import {
  INITIAL_TEACHER,
  INITIAL_STUDENT,
  AVATAR_STUDENT_SVG,
  AVATAR_TEACHER_SVG,
  INITIAL_CLASSES,
  INITIAL_SCHEDULES,
  INITIAL_ASSIGNMENTS,
  INITIAL_SUBMISSIONS,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_NOTIFICATIONS,
} from '../data/mockData';
import {
  supabase,
  safeSupabaseCall,
  mapClassFromDb,
  mapClassToDb,
  mapScheduleFromDb,
  mapScheduleToDb,
  mapAssignmentFromDb,
  mapAssignmentToDb,
  mapSubmissionFromDb,
  mapSubmissionToDb,
  mapAnnouncementFromDb,
  mapAnnouncementToDb,
} from '../lib/supabase';

export interface RegisterAccountInput {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  identifierNumber: string;
  schoolName?: string;
  attendanceNumber?: number;
  phone?: string;
  classCodesToJoin?: string[];
  initialClassesToCreate?: { name: string; gradeLevel: string; description?: string }[];
}

export interface MultiJoinResult {
  success: boolean;
  joinedClasses: ClassRoom[];
  alreadyJoinedNames: string[];
  notFoundCodes: string[];
  message: string;
}

interface AppContextType {
  // Authentication & Accounts
  isAuthenticated: boolean;
  currentUser: User;
  registeredUsers: User[];
  setCurrentUser: (user: User) => void;
  loginWithCredentials: (
    identifier: string,
    password: string,
    role: UserRole
  ) => { success: boolean; message: string };
  quickLoginAccount: (userId: string) => void;
  registerAccount: (input: RegisterAccountInput) => {
    success: boolean;
    message: string;
    joinedCount?: number;
    notFoundCodes?: string[];
  };
  logout: () => void;
  switchRole: () => void;
  allDemoUsers: User[];
  loginAsUser: (userId: string) => void;
  registerUser: (
    name: string,
    email: string,
    role: 'student' | 'teacher',
    idNum: string,
    password?: string
  ) => void;

  // Classes & Multi-Class Support (2+ Classes)
  classes: ClassRoom[]; // Kelas yang diikuti / diampu oleh pengguna saat ini
  allClasses: ClassRoom[]; // Seluruh kelas terdaftar di sistem sekolah
  activeClass: ClassRoom | null;
  setActiveClass: (cls: ClassRoom) => void;
  isAllClassesView: boolean;
  setIsAllClassesView: (val: boolean) => void;
  createClass: (name: string, gradeLevel: string, description: string) => ClassRoom;
  createMultipleClasses: (
    items: { name: string; gradeLevel: string; description: string }[]
  ) => ClassRoom[];
  deleteClass: (classId: string) => void;
  leaveClass: (classId: string) => void;
  clearAllClasses: () => void;
  joinClassByCode: (code: string) => { success: boolean; message: string };
  joinMultipleClassesByCodes: (codes: string[]) => MultiJoinResult;

  // Schedules
  schedules: ScheduleItem[];
  addScheduleItem: (item: Omit<ScheduleItem, 'id'>) => void;
  importScheduleItemsBatch: (items: Omit<ScheduleItem, 'id'>[]) => Promise<number>;
  updateScheduleItem: (id: string, item: Partial<ScheduleItem>) => void;
  deleteScheduleItem: (id: string) => void;

  // Assignments
  assignments: Assignment[];
  addAssignment: (
    item: Omit<Assignment, 'id' | 'createdBy' | 'createdByName' | 'createdAt'>,
    targetClassIds?: string[]
  ) => void;
  updateAssignment: (id: string, updated: Partial<Assignment>) => void;
  deleteAssignment: (id: string) => void;

  // Submissions & Verification
  submissions: Submission[];
  submitAssignment: (
    assignmentId: string,
    file: { name: string; size: string; type: string; dataUrl?: string },
    studentNote?: string,
    attendanceNum?: number
  ) => void;
  gradeSubmission: (submissionId: string, grade: number, feedback: string) => void;
  verifySubmission: (
    submissionId: string,
    status: 'verified' | 'rejected',
    grade?: number,
    feedback?: string
  ) => void;

  // Teacher Phone & Verification
  updateTeacherPhone: (
    phone: string,
    verificationPin: string
  ) => { success: boolean; message: string };

  // Announcements & Agenda
  announcements: Announcement[];
  addAnnouncement: (
    title: string,
    content: string,
    type: 'urgent' | 'info' | 'agenda',
    isNonKbmAgenda: boolean,
    location?: string,
    eventDate?: string,
    eventTime?: string,
    targetClassIds?: string[]
  ) => void;
  deleteAnnouncement: (id: string) => void;
  toggleLikeAnnouncement: (id: string) => void;

  // Notifications
  notifications: AppNotification[];
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  triggerSimulatedNotification: (
    type: 'class_reminder' | 'assignment_reminder' | 'new_announcement'
  ) => void;

  // Preferences, WITA Real-time & Simulation
  witaTimeInfo: WitaTimeInfo;
  isRealTimeWita: boolean;
  setIsRealTimeWita: (val: boolean) => void;
  syncToCurrentWitaTime: () => void;
  simulatedDay: number;
  setSimulatedDay: (day: number) => void;
  simulatedTime: string;
  setSimulatedTime: (time: string) => void;
  isSimulatingLiveTime: boolean;
  setIsSimulatingLiveTime: (val: boolean) => void;
  activeLiveClass: ScheduleItem | null;
  createLiveScheduleNow: (subjectName?: string) => void;
  isDarkMode: boolean;
  setIsDarkMode: React.Dispatch<React.SetStateAction<boolean>>;
  isMobileDeviceFrame: boolean;
  setIsMobileDeviceFrame: React.Dispatch<React.SetStateAction<boolean>>;
  activeTab: 'jadwal' | 'tugas' | 'agenda' | 'kelas';
  setActiveTab: (tab: 'jadwal' | 'tugas' | 'agenda' | 'kelas') => void;

  // Supabase Realtime & Database Sync
  isSupabaseConnected: boolean;
  isSupabaseSyncing: boolean;
  syncWithSupabase: () => Promise<void>;

  // Gamification & Privacy Settings
  privacySettings: PrivacySettings;
  updatePrivacySettings: (partial: Partial<PrivacySettings>) => void;
  userXp: number;
  userBadges: UserBadge[];
  userLevel: {
    level: number;
    title: string;
    nextXp: number;
    prevXp: number;
  };
  xpBreakdown: XpBreakdown;
  expiredUnsubmittedAssignments: Assignment[];
  lastXpGainNotice: { amount: number; reason: string; timestamp: number } | null;
  clearXpGainNotice: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const normalizeAvatar = (user: User): User => {
  const avatar =
    !user.avatarUrl || user.avatarUrl.includes('unsplash.com')
      ? user.role === 'teacher'
        ? AVATAR_TEACHER_SVG
        : AVATAR_STUDENT_SVG
      : user.avatarUrl;
  return {
    ...user,
    avatarUrl: avatar,
    password: user.password || '123',
  };
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const DATA_VERSION = 'v5_clean_no_sample_data';

  // Dedicated Login Session Gate: tidak langsung masuk sebelum login
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('classsync_auth_active') === 'true';
  });

  // Load all school classes first so user migration can link pre-existing classes
  const [allClasses, setAllClasses] = useState<ClassRoom[]>(() => {
    const version = localStorage.getItem('classsync_version');
    if (version !== DATA_VERSION) {
      const defaultActiveId = INITIAL_CLASSES.length > 0 ? INITIAL_CLASSES[0].id : '';
      localStorage.setItem('classsync_version', DATA_VERSION);
      localStorage.setItem('classsync_user', JSON.stringify(INITIAL_STUDENT));
      localStorage.setItem('classsync_active_class_id', defaultActiveId);
      return INITIAL_CLASSES;
    }
    const saved = localStorage.getItem('classsync_classes');
    if (!saved) return INITIAL_CLASSES;
    try {
      return JSON.parse(saved);
    } catch {
      return INITIAL_CLASSES;
    }
  });

  // Registered accounts store (Guru & Siswa)
  const [registeredUsers, setRegisteredUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('classsync_registered_users');
    const existingIds = allClasses.map((c) => c.id);

    const seedDefaults: User[] = [
      normalizeAvatar({
        ...INITIAL_TEACHER,
        joinedClassIds: existingIds,
      }),
      normalizeAvatar({
        ...INITIAL_STUDENT,
        joinedClassIds: existingIds,
      }),
    ];

    if (!saved) {
      return seedDefaults;
    }

    try {
      const parsed: User[] = JSON.parse(saved).map(normalizeAvatar);
      const merged = [...parsed];
      for (const def of seedDefaults) {
        if (!merged.some((u) => u.id === def.id)) {
          merged.push(def);
        }
      }
      return merged;
    } catch {
      return seedDefaults;
    }
  });

  // Current active user
  const [currentUser, setCurrentUserState] = useState<User>(() => {
    const version = localStorage.getItem('classsync_version');
    const saved = localStorage.getItem('classsync_user');
    const existingIds = allClasses.map((c) => c.id);

    if (version !== DATA_VERSION || !saved) {
      return { ...INITIAL_STUDENT, joinedClassIds: existingIds };
    }
    try {
      const parsed: User = normalizeAvatar(JSON.parse(saved));
      if (parsed.name.includes('Ahmad Fauzi') || parsed.name.includes('Fathir')) {
        return { ...INITIAL_STUDENT, joinedClassIds: existingIds };
      }
      if (parsed.joinedClassIds === undefined) {
        parsed.joinedClassIds = existingIds;
      }
      return parsed;
    } catch {
      return { ...INITIAL_STUDENT, joinedClassIds: existingIds };
    }
  });

  const [activeClassId, setActiveClassId] = useState<string>(() => {
    const saved = localStorage.getItem('classsync_active_class_id');
    return saved || (allClasses.length > 0 ? allClasses[0].id : '');
  });

  const [isAllClassesView, setIsAllClassesViewState] = useState<boolean>(false);

  const [schedules, setSchedules] = useState<ScheduleItem[]>(() => {
    const version = localStorage.getItem('classsync_version');
    if (version !== DATA_VERSION) {
      return INITIAL_SCHEDULES;
    }
    const saved = localStorage.getItem('classsync_schedules');
    if (!saved) return INITIAL_SCHEDULES;
    try {
      const parsed: ScheduleItem[] = JSON.parse(saved);
      return parsed.filter(
        (s) => !s.subjectName.toLowerCase().includes('upacara') && s.dayOfWeek !== 7
      );
    } catch {
      return INITIAL_SCHEDULES;
    }
  });

  const [assignments, setAssignments] = useState<Assignment[]>(() => {
    const version = localStorage.getItem('classsync_version');
    if (version !== DATA_VERSION) {
      return INITIAL_ASSIGNMENTS;
    }
    const saved = localStorage.getItem('classsync_assignments');
    return saved ? JSON.parse(saved) : INITIAL_ASSIGNMENTS;
  });

  const [submissions, setSubmissions] = useState<Submission[]>(() => {
    const version = localStorage.getItem('classsync_version');
    if (version !== DATA_VERSION) {
      return INITIAL_SUBMISSIONS;
    }
    const saved = localStorage.getItem('classsync_submissions');
    return saved ? JSON.parse(saved) : INITIAL_SUBMISSIONS;
  });

  const [announcements, setAnnouncements] = useState<Announcement[]>(() => {
    const version = localStorage.getItem('classsync_version');
    if (version !== DATA_VERSION) {
      return INITIAL_ANNOUNCEMENTS;
    }
    const saved = localStorage.getItem('classsync_announcements');
    if (!saved) return INITIAL_ANNOUNCEMENTS;
    try {
      const parsed: Announcement[] = JSON.parse(saved);
      return parsed.filter((a) => !a.title.toLowerCase().includes('upacara'));
    } catch {
      return INITIAL_ANNOUNCEMENTS;
    }
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const version = localStorage.getItem('classsync_version');
    if (version !== DATA_VERSION) {
      return INITIAL_NOTIFICATIONS;
    }
    const saved = localStorage.getItem('classsync_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  // Derive classes enrolled / taught by currentUser (supports 2+ classes per account)
  const classes = useMemo(() => {
    const joinedSet = new Set(currentUser.joinedClassIds || []);
    return allClasses.filter((cls) => {
      if (currentUser.role === 'teacher' && cls.teacherId === currentUser.id) {
        return true;
      }
      if (joinedSet.has(cls.id)) {
        return true;
      }
      if ((cls.memberIds || []).includes(currentUser.id)) {
        return true;
      }
      return false;
    });
  }, [allClasses, currentUser.id, currentUser.role, currentUser.joinedClassIds]);

  // Ensure activeClassId points to one of the user's enrolled classes
  useEffect(() => {
    if (classes.length === 0) {
      if (activeClassId !== '') setActiveClassId('');
      if (isAllClassesView) setIsAllClassesViewState(false);
    } else {
      if (!classes.some((c) => c.id === activeClassId)) {
        setActiveClassId(classes[0].id);
      }
      if (classes.length < 2 && isAllClassesView) {
        setIsAllClassesViewState(false);
      }
    }
  }, [classes, activeClassId, isAllClassesView]);

  const setIsAllClassesView = (val: boolean) => {
    if (val && classes.length >= 2) {
      setIsAllClassesViewState(true);
    } else {
      setIsAllClassesViewState(false);
    }
  };

  // Sync currentUser changes back into registeredUsers array
  useEffect(() => {
    localStorage.setItem('classsync_user', JSON.stringify(currentUser));
    setRegisteredUsers((prev) => {
      const exists = prev.some((u) => u.id === currentUser.id);
      if (!exists) {
        return [currentUser, ...prev];
      }
      return prev.map((u) => (u.id === currentUser.id ? { ...u, ...currentUser } : u));
    });
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('classsync_registered_users', JSON.stringify(registeredUsers));
  }, [registeredUsers]);

  useEffect(() => {
    localStorage.setItem('classsync_auth_active', isAuthenticated ? 'true' : 'false');
  }, [isAuthenticated]);

  // Waktu Indonesia Tengah (WITA, UTC+8) Realtime & Simulation state
  const initialWita = getWitaNow();
  const [witaTimeInfo, setWitaTimeInfo] = useState<WitaTimeInfo>(initialWita);
  const [isRealTimeWita, setIsRealTimeWita] = useState<boolean>(true);
  const [simulatedDay, setSimulatedDay] = useState<number>(initialWita.dayOfWeek);
  const [simulatedTime, setSimulatedTime] = useState<string>(initialWita.formattedTime);
  const [isSimulatingLiveTime, setIsSimulatingLiveTime] = useState<boolean>(true);

  useEffect(() => {
    const tick = () => {
      const info = getWitaNow();
      setWitaTimeInfo(info);
      if (isRealTimeWita) {
        setSimulatedDay(info.dayOfWeek);
        setSimulatedTime(info.formattedTime);
      }
    };

    tick();
    const timerId = setInterval(tick, 1000);
    return () => clearInterval(timerId);
  }, [isRealTimeWita]);

  const syncToCurrentWitaTime = () => {
    const info = getWitaNow();
    setWitaTimeInfo(info);
    setSimulatedDay(info.dayOfWeek);
    setSimulatedTime(info.formattedTime);
    setIsRealTimeWita(true);
  };

  // Layout & Theme states
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isMobileDeviceFrame, setIsMobileDeviceFrame] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'jadwal' | 'tugas' | 'agenda' | 'kelas'>('jadwal');

  // Privacy Settings state
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>(() => {
    const saved = localStorage.getItem('classsync_privacy');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return {
      hideSpecificLocations: false,
      membersOnlySchedule: false,
      showStudyStats: true,
      dataEncryptionEnabled: true,
    };
  });

  const updatePrivacySettings = (partial: Partial<PrivacySettings>) => {
    setPrivacySettings((prev) => {
      const updated = { ...prev, ...partial };
      localStorage.setItem('classsync_privacy', JSON.stringify(updated));
      return updated;
    });
  };

  // Gamification (XP, Levels, Badges, and Expired Overdue Penalties)
  const {
    badges: userBadges,
    totalXp: userXp,
    breakdown: xpBreakdown,
    expiredUnsubmittedAssignments,
  } = useMemo(() => {
    return computeBadges(submissions, assignments, currentUser.id, classes.length, simulatedTime);
  }, [submissions, assignments, currentUser.id, classes.length, simulatedTime]);

  const userLevel = useMemo(() => {
    return calculateLevel(userXp);
  }, [userXp]);

  const [lastXpGainNotice, setLastXpGainNotice] = useState<{
    amount: number;
    reason: string;
    timestamp: number;
  } | null>(null);

  const clearXpGainNotice = () => setLastXpGainNotice(null);

  // Supabase State
  const [isSupabaseConnected, setIsSupabaseConnected] = useState<boolean>(false);
  const [isSupabaseSyncing, setIsSupabaseSyncing] = useState<boolean>(false);

  const syncWithSupabase = async () => {
    setIsSupabaseSyncing(true);
    try {
      // 1. Classes
      const { data: dbClasses, error: classErr } = await supabase.from('classes').select('*');
      if (!classErr && dbClasses) {
        setIsSupabaseConnected(true);
        if (dbClasses.length > 0) {
          const mapped = dbClasses.map(mapClassFromDb);
          setAllClasses((prev) => {
            const byId = new Map<string, ClassRoom>();
            prev.forEach((c) => byId.set(c.id, c));
            mapped.forEach((c) => {
              const local = byId.get(c.id);
              byId.set(c.id, { ...c, memberIds: local?.memberIds || c.memberIds });
            });
            return Array.from(byId.values());
          });
        } else if (allClasses.length > 0) {
          for (const c of allClasses) {
            await supabase.from('classes').upsert(mapClassToDb(c));
          }
        }
      }

      // 2. Schedules
      const { data: dbSchedules, error: schErr } = await supabase.from('schedules').select('*');
      if (!schErr && dbSchedules) {
        if (dbSchedules.length > 0) {
          setSchedules(
            dbSchedules
              .map(mapScheduleFromDb)
              .filter(
                (s) => !s.subjectName.toLowerCase().includes('upacara') && s.dayOfWeek !== 7
              )
          );
        } else if (schedules.length > 0) {
          for (const s of schedules) {
            await supabase.from('schedules').upsert(mapScheduleToDb(s));
          }
        }
      }

      // 3. Assignments
      const { data: dbAssignments, error: assErr } = await supabase.from('assignments').select('*');
      if (!assErr && dbAssignments) {
        if (dbAssignments.length > 0) {
          setAssignments(dbAssignments.map(mapAssignmentFromDb));
        } else if (assignments.length > 0) {
          for (const a of assignments) {
            await supabase.from('assignments').upsert(mapAssignmentToDb(a));
          }
        }
      }

      // 4. Submissions
      const { data: dbSubmissions, error: subErr } = await supabase.from('submissions').select('*');
      if (!subErr && dbSubmissions) {
        if (dbSubmissions.length > 0) {
          setSubmissions(dbSubmissions.map(mapSubmissionFromDb));
        } else if (submissions.length > 0) {
          for (const sub of submissions) {
            await supabase.from('submissions').upsert(mapSubmissionToDb(sub));
          }
        }
      }

      // 5. Announcements
      const { data: dbAnnouncements, error: annErr } = await supabase
        .from('announcements')
        .select('*');
      if (!annErr && dbAnnouncements) {
        if (dbAnnouncements.length > 0) {
          setAnnouncements(
            dbAnnouncements
              .map(mapAnnouncementFromDb)
              .filter((a) => !a.title.toLowerCase().includes('upacara'))
          );
        } else if (announcements.length > 0) {
          for (const ann of announcements) {
            await supabase.from('announcements').upsert(mapAnnouncementToDb(ann));
          }
        }
      }
    } catch (err) {
      console.warn('Supabase sync skipped:', err);
    } finally {
      setIsSupabaseSyncing(false);
    }
  };

  useEffect(() => {
    setAnnouncements((prev) => prev.filter((a) => !a.title.toLowerCase().includes('upacara')));
    setSchedules((prev) =>
      prev.filter((s) => !s.subjectName.toLowerCase().includes('upacara') && s.dayOfWeek !== 7)
    );
    safeSupabaseCall(supabase.from('announcements').delete().ilike('title', '%upacara%'));
    safeSupabaseCall(supabase.from('schedules').delete().ilike('subject_name', '%upacara%'));

    syncWithSupabase();

    const channel = supabase
      .channel('supabase-live-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'classes' }, async () => {
        const { data } = await supabase.from('classes').select('*');
        if (data) {
          const mapped = data.map(mapClassFromDb);
          setAllClasses((prev) => {
            const byId = new Map<string, ClassRoom>();
            prev.forEach((c) => byId.set(c.id, c));
            mapped.forEach((c) => {
              const local = byId.get(c.id);
              byId.set(c.id, { ...c, memberIds: local?.memberIds || c.memberIds });
            });
            return Array.from(byId.values());
          });
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'schedules' }, async () => {
        const { data } = await supabase.from('schedules').select('*');
        if (data)
          setSchedules(
            data
              .map(mapScheduleFromDb)
              .filter((s) => !s.subjectName.toLowerCase().includes('upacara') && s.dayOfWeek !== 7)
          );
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'assignments' }, async () => {
        const { data } = await supabase.from('assignments').select('*');
        if (data) setAssignments(data.map(mapAssignmentFromDb));
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'submissions' }, async () => {
        const { data } = await supabase.from('submissions').select('*');
        if (data) setSubmissions(data.map(mapSubmissionFromDb));
      })
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'announcements' },
        async () => {
          const { data } = await supabase.from('announcements').select('*');
          if (data)
            setAnnouncements(
              data
                .map(mapAnnouncementFromDb)
                .filter((a) => !a.title.toLowerCase().includes('upacara'))
            );
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsSupabaseConnected(true);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Persistence effects
  useEffect(() => {
    localStorage.setItem('classsync_classes', JSON.stringify(allClasses));
  }, [allClasses]);

  useEffect(() => {
    localStorage.setItem('classsync_active_class_id', activeClassId);
  }, [activeClassId]);

  useEffect(() => {
    localStorage.setItem('classsync_schedules', JSON.stringify(schedules));
  }, [schedules]);

  useEffect(() => {
    localStorage.setItem('classsync_assignments', JSON.stringify(assignments));
  }, [assignments]);

  useEffect(() => {
    localStorage.setItem('classsync_submissions', JSON.stringify(submissions));
  }, [submissions]);

  useEffect(() => {
    localStorage.setItem('classsync_announcements', JSON.stringify(announcements));
  }, [announcements]);

  useEffect(() => {
    localStorage.setItem('classsync_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const activeClass =
    classes.find((c) => c.id === activeClassId) || (classes.length > 0 ? classes[0] : null);

  // Live class across activeClass or across all enrolled classes when in combined view
  const activeLiveClass = useMemo(() => {
    const enrolledIds = new Set(classes.map((c) => c.id));
    if (enrolledIds.size === 0) return null;
    const currentDay = isRealTimeWita ? witaTimeInfo.dayOfWeek : simulatedDay;
    const currentMinutes = isRealTimeWita ? witaTimeInfo.totalMinutes : timeToMinutes(simulatedTime);

    return (
      schedules
        .filter((s) => {
          if (isAllClassesView) return enrolledIds.has(s.classId) && s.dayOfWeek === currentDay;
          return activeClass ? s.classId === activeClass.id && s.dayOfWeek === currentDay : false;
        })
        .find((s) => {
          const startMin = timeToMinutes(s.startTime);
          const endMin = timeToMinutes(s.endTime);
          return currentMinutes >= startMin && currentMinutes < endMin;
        }) || null
    );
  }, [
    schedules,
    classes,
    activeClass,
    isAllClassesView,
    isRealTimeWita,
    witaTimeInfo.dayOfWeek,
    witaTimeInfo.totalMinutes,
    simulatedDay,
    simulatedTime,
  ]);

  const createLiveScheduleNow = (subjectName: string = 'Matematika Terapan') => {
    if (!activeClass) return;
    const info = getWitaNow();
    const currentM = info.totalMinutes;
    const startM = Math.max(0, currentM - 15);
    const endM = Math.min(1439, currentM + 45);
    const startStr = minutesToTimeString(startM);
    const endStr = minutesToTimeString(endM);

    const newItem: ScheduleItem = {
      id: `sch-${Date.now()}`,
      classId: activeClass.id,
      subjectName,
      teacherName:
        currentUser.role === 'teacher'
          ? currentUser.name
          : activeClass.teacherName || 'Guru Pengampu',
      teacherPhone: currentUser.phone || activeClass.teacherPhone || '081234567890',
      isTeacherVerified: true,
      dayOfWeek: info.dayOfWeek === 7 ? 1 : info.dayOfWeek,
      startTime: startStr,
      endTime: endStr,
      roomLocation: 'Ruang 7-A (Lantai 1)',
      colorTheme: 'amber',
      notes: `Sesi KBM aktif disinkronkan otomatis dengan Waktu Nyata WITA (${info.formattedTime}).`,
    };

    setSchedules((prev) => [...prev, newItem]);
    safeSupabaseCall(supabase.from('schedules').upsert(mapScheduleToDb(newItem)));
  };

  const setActiveClass = (cls: ClassRoom) => {
    setActiveClassId(cls.id);
    setIsAllClassesViewState(false);
  };

  // --- AUTHENTICATION & ACCOUNT HANDLERS ---

  const loginWithCredentials = (
    identifier: string,
    password: string,
    role: UserRole
  ): { success: boolean; message: string } => {
    const cleanId = identifier.trim().toLowerCase();
    const cleanDigits = identifier.replace(/[^0-9]/g, '');
    const cleanPass = password.trim();

    if (!cleanId || !cleanPass) {
      return {
        success: false,
        message: 'Mohon isi email / nomor induk serta kata sandi Anda.',
      };
    }

    const candidates = registeredUsers.filter((u) => u.role === role);
    const matched = candidates.find((u) => {
      const emailMatch = u.email.trim().toLowerCase() === cleanId;
      const idStrMatch = u.identifierNumber.trim().toLowerCase() === cleanId;
      const uDigits = u.identifierNumber.replace(/[^0-9]/g, '');
      const digitsMatch = cleanDigits.length >= 4 && uDigits === cleanDigits;
      return emailMatch || idStrMatch || digitsMatch;
    });

    if (!matched) {
      const roleLabel = role === 'teacher' ? 'Guru' : 'Siswa';
      return {
        success: false,
        message: `Akun ${roleLabel} dengan email atau nomor induk tersebut tidak ditemukan. Silakan periksa peran atau buat akun baru.`,
      };
    }

    const expectedPass = (matched.password || '123').trim();
    if (expectedPass !== cleanPass) {
      return {
        success: false,
        message: 'Kata sandi yang Anda masukkan belum sesuai. Silakan coba kembali.',
      };
    }

    setCurrentUserState(matched);
    setIsAuthenticated(true);
    setActiveTab('jadwal');
    return {
      success: true,
      message: `Selamat datang kembali, ${matched.name}!`,
    };
  };

  const quickLoginAccount = (userId: string) => {
    const target = registeredUsers.find((u) => u.id === userId);
    if (target) {
      setCurrentUserState(target);
      setIsAuthenticated(true);
      setActiveTab('jadwal');
    }
  };

  const registerAccount = (
    input: RegisterAccountInput
  ): {
    success: boolean;
    message: string;
    joinedCount?: number;
    notFoundCodes?: string[];
  } => {
    const cleanName = input.name.trim();
    const cleanEmail = input.email.trim().toLowerCase();
    const cleanPass = input.password.trim();
    const cleanIdNum = input.identifierNumber.trim();

    if (!cleanName || !cleanEmail || !cleanPass) {
      return {
        success: false,
        message: 'Nama lengkap, email, dan kata sandi wajib diisi.',
      };
    }

    if (cleanPass.length < 3) {
      return {
        success: false,
        message: 'Kata sandi minimal terdiri dari 3 karakter.',
      };
    }

    const duplicate = registeredUsers.find(
      (u) => u.email.trim().toLowerCase() === cleanEmail && u.role === input.role
    );
    if (duplicate) {
      return {
        success: false,
        message: `Email ${cleanEmail} sudah terdaftar sebagai ${
          input.role === 'teacher' ? 'Guru' : 'Siswa'
        }. Silakan masuk pada tab Masuk Akun.`,
      };
    }

    const newUserId = `user-${Date.now()}`;
    const formattedIdNumber = cleanIdNum
      ? input.role === 'teacher'
        ? cleanIdNum.toUpperCase().startsWith('NIP')
          ? cleanIdNum
          : `NIP. ${cleanIdNum}`
        : cleanIdNum.toUpperCase().startsWith('NISN')
        ? cleanIdNum
        : `NISN. ${cleanIdNum}`
      : input.role === 'teacher'
      ? `NIP. 1990${Math.floor(1000 + Math.random() * 9000)}`
      : `NISN. 009${Math.floor(100000 + Math.random() * 900000)}`;

    const joinedIds = new Set<string>();
    const notFoundCodes: string[] = [];
    const createdClassesBatch: ClassRoom[] = [];

    // 1. If Teacher chose to create 1, 2, or more initial classes during registration
    if (
      input.role === 'teacher' &&
      input.initialClassesToCreate &&
      input.initialClassesToCreate.length > 0
    ) {
      input.initialClassesToCreate.forEach((clsSpec, idx) => {
        if (!clsSpec.name.trim()) return;
        const cleanClsName = clsSpec.name.trim();
        const codePrefix = cleanClsName
          .replace(/[^a-zA-Z0-9]+/g, '-')
          .replace(/^-|-$/g, '')
          .slice(0, 7)
          .toUpperCase();
        const randomCode = `${codePrefix || 'KLS'}-${Math.floor(100 + Math.random() * 900)}`;
        const created: ClassRoom = {
          id: `class-${Date.now()}-${idx}`,
          name: cleanClsName,
          gradeLevel: clsSpec.gradeLevel || 'Kelas 7',
          code: randomCode,
          teacherId: newUserId,
          teacherName: cleanName,
          teacherPhone: input.phone?.trim(),
          isTeacherVerified: Boolean(input.phone?.trim()),
          academicYear: '2026/2027 Ganjil',
          studentCount: 0,
          memberIds: [newUserId],
          description: clsSpec.description?.trim() || `Kelas ${cleanClsName} di ClassyWork`,
          bannerColor: 'amber',
        };
        createdClassesBatch.push(created);
        joinedIds.add(created.id);
      });
    }

    // 2. If Student (or Teacher) entered 1, 2, or more class codes to join immediately
    const rawCodes = (input.classCodesToJoin || [])
      .flatMap((c) => c.split(/[,;\s]+/))
      .map((c) => c.trim().toUpperCase())
      .filter(Boolean);

    let updatedExistingClasses = [...allClasses];
    if (rawCodes.length > 0) {
      for (const code of rawCodes) {
        const idx = updatedExistingClasses.findIndex((c) => c.code.toUpperCase() === code);
        if (idx >= 0) {
          const target = updatedExistingClasses[idx];
          joinedIds.add(target.id);
          const existingMembers = new Set(target.memberIds || []);
          const alreadyMember = existingMembers.has(newUserId);
          existingMembers.add(newUserId);
          updatedExistingClasses[idx] = {
            ...target,
            memberIds: Array.from(existingMembers),
            studentCount:
              input.role === 'student' && !alreadyMember
                ? target.studentCount + 1
                : target.studentCount,
          };
        } else {
          notFoundCodes.push(code);
        }
      }
    }

    const finalAllClasses = [...createdClassesBatch, ...updatedExistingClasses];
    if (createdClassesBatch.length > 0 || rawCodes.length > 0) {
      setAllClasses(finalAllClasses);
      createdClassesBatch.forEach((c) => {
        safeSupabaseCall(supabase.from('classes').upsert(mapClassToDb(c)));
      });
    }

    const joinedArray = Array.from(joinedIds);
    const firstClassName =
      finalAllClasses.find((c) => joinedIds.has(c.id))?.name || undefined;

    const newUser: User = {
      id: newUserId,
      name: cleanName,
      email: cleanEmail,
      password: cleanPass,
      role: input.role,
      avatarUrl: input.role === 'teacher' ? AVATAR_TEACHER_SVG : AVATAR_STUDENT_SVG,
      identifierNumber: formattedIdNumber,
      className: firstClassName,
      joinedClassIds: joinedArray,
      schoolName: input.schoolName?.trim() || 'MTs',
      phone: input.phone?.trim() || undefined,
      isPhoneVerified: input.role === 'teacher' && Boolean(input.phone?.trim()),
      attendanceNumber:
        input.role === 'student' ? Math.max(1, input.attendanceNumber || 1) : undefined,
    };

    setRegisteredUsers((prev) => [newUser, ...prev]);
    setCurrentUserState(newUser);
    if (joinedArray.length > 0) {
      setActiveClassId(joinedArray[0]);
    }
    setIsAuthenticated(true);
    setActiveTab('jadwal');

    safeSupabaseCall(
      supabase.from('profiles').upsert({
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        avatar_url: newUser.avatarUrl,
        identifier_number: newUser.identifierNumber,
        class_name: newUser.className || '',
        school_name: newUser.schoolName,
      })
    );

    return {
      success: true,
      message: `Akun ${newUser.name} berhasil dibuat!`,
      joinedCount: joinedArray.length,
      notFoundCodes,
    };
  };

  const logout = () => {
    setIsAuthenticated(false);
    setIsAllClassesViewState(false);
    localStorage.setItem('classsync_auth_active', 'false');
  };

  const switchRole = () => {
    const targetRole: UserRole = currentUser.role === 'student' ? 'teacher' : 'student';
    const matchingUser =
      registeredUsers.find((u) => u.role === targetRole) ||
      (targetRole === 'teacher' ? INITIAL_TEACHER : INITIAL_STUDENT);
    setCurrentUserState(matchingUser);
  };

  const allDemoUsers = registeredUsers;

  const loginAsUser = (userId: string) => {
    const target = registeredUsers.find((u) => u.id === userId);
    if (target) {
      setCurrentUserState(target);
      setIsAuthenticated(true);
    }
  };

  const registerUser = (
    name: string,
    email: string,
    role: 'student' | 'teacher',
    idNum: string,
    password: string = '123'
  ) => {
    registerAccount({
      name,
      email,
      password,
      role,
      identifierNumber: idNum,
    });
  };

  // --- MULTI-CLASS MANAGEMENT (2+ CLASSES) ---

  const createMultipleClasses = (
    items: { name: string; gradeLevel: string; description: string }[]
  ): ClassRoom[] => {
    if (currentUser.role !== 'teacher') {
      return [];
    }
    const validItems = items.filter((item) => item.name.trim().length > 0);
    if (validItems.length === 0) return [];

    const createdList: ClassRoom[] = validItems.map((item, idx) => {
      const cleanName = item.name.trim();
      const prefix = cleanName
        .replace(/[^a-zA-Z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 7)
        .toUpperCase();
      const randomCode = `${prefix || 'KLS'}-${Math.floor(100 + Math.random() * 900)}`;
      return {
        id: `class-${Date.now()}-${idx}`,
        name: cleanName,
        gradeLevel: item.gradeLevel || 'Kelas 7',
        code: randomCode,
        teacherId: currentUser.id,
        teacherName: currentUser.name,
        teacherPhone: currentUser.phone,
        isTeacherVerified: currentUser.isPhoneVerified,
        academicYear: '2026/2027 Ganjil',
        studentCount: 0,
        memberIds: [currentUser.id],
        description: item.description.trim() || `Kelas ${cleanName} di ClassyWork`,
        bannerColor: 'amber',
      };
    });

    setAllClasses((prev) => [...createdList, ...prev]);
    setCurrentUserState((prev) => {
      const nextIds = Array.from(
        new Set([...createdList.map((c) => c.id), ...(prev.joinedClassIds || [])])
      );
      return { ...prev, joinedClassIds: nextIds };
    });
    setActiveClassId(createdList[0].id);
    setIsAllClassesViewState(false);

    createdList.forEach((cls) => {
      safeSupabaseCall(supabase.from('classes').upsert(mapClassToDb(cls)));
    });

    const codesText = createdList.map((c) => `${c.name} (${c.code})`).join(', ');
    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      userId: currentUser.id,
      title:
        createdList.length > 1
          ? `${createdList.length} Kelas Berhasil Dibuat`
          : 'Kelas Berhasil Dibuat',
      message: `Kelas terdaftar: ${codesText}. Bagikan kode kelas kepada siswa agar dapat bergabung.`,
      type: 'announcement',
      timestamp: new Date().toISOString(),
      isRead: false,
    };
    setNotifications((prev) => [notif, ...prev]);

    return createdList;
  };

  const createClass = (name: string, gradeLevel: string, description: string): ClassRoom => {
    const res = createMultipleClasses([{ name, gradeLevel, description }]);
    if (res.length === 0) {
      throw new Error('Hanya akun guru yang dapat membuat kelas baru.');
    }
    return res[0];
  };

  const joinMultipleClassesByCodes = (codes: string[]): MultiJoinResult => {
    const cleanCodes = Array.from(
      new Set(
        codes
          .flatMap((c) => c.split(/[,;\s]+/))
          .map((c) => c.trim().toUpperCase())
          .filter(Boolean)
      )
    );

    if (cleanCodes.length === 0) {
      return {
        success: false,
        joinedClasses: [],
        alreadyJoinedNames: [],
        notFoundCodes: [],
        message: 'Masukkan minimal satu kode kelas terlebih dahulu.',
      };
    }

    const currentJoinedSet = new Set(currentUser.joinedClassIds || []);
    const newlyJoined: ClassRoom[] = [];
    const alreadyJoinedNames: string[] = [];
    const notFoundCodes: string[] = [];

    const nextAllClasses = allClasses.map((cls) => {
      if (!cleanCodes.includes(cls.code.toUpperCase())) {
        return cls;
      }

      const isAlreadyIn =
        currentJoinedSet.has(cls.id) ||
        (currentUser.role === 'teacher' && cls.teacherId === currentUser.id);

      if (isAlreadyIn) {
        alreadyJoinedNames.push(cls.name);
        return cls;
      }

      newlyJoined.push(cls);
      const updatedMembers = Array.from(new Set([...(cls.memberIds || []), currentUser.id]));
      const updatedCls: ClassRoom = {
        ...cls,
        memberIds: updatedMembers,
        studentCount:
          currentUser.role === 'student' ? cls.studentCount + 1 : cls.studentCount,
      };
      safeSupabaseCall(supabase.from('classes').upsert(mapClassToDb(updatedCls)));
      return updatedCls;
    });

    for (const code of cleanCodes) {
      if (!allClasses.some((c) => c.code.toUpperCase() === code)) {
        notFoundCodes.push(code);
      }
    }

    if (newlyJoined.length > 0) {
      setAllClasses(nextAllClasses);
      const addedIds = newlyJoined.map((c) => c.id);
      setCurrentUserState((prev) => ({
        ...prev,
        joinedClassIds: Array.from(new Set([...(prev.joinedClassIds || []), ...addedIds])),
      }));
      setActiveClassId(newlyJoined[0].id);
      setIsAllClassesViewState(false);

      const joinedNames = newlyJoined.map((c) => c.name).join(', ');
      const notif: AppNotification = {
        id: `notif-${Date.now()}`,
        userId: currentUser.id,
        title:
          newlyJoined.length > 1
            ? `Berhasil Bergabung ke ${newlyJoined.length} Kelas`
            : 'Berhasil Bergabung ke Kelas',
        message: `Anda kini terdaftar di kelas: ${joinedNames}. Anda dapat berpindah antar kelas kapan saja.`,
        type: 'announcement',
        timestamp: new Date().toISOString(),
        isRead: false,
      };
      setNotifications((prev) => [notif, ...prev]);
    }

    if (newlyJoined.length === 0 && alreadyJoinedNames.length > 0 && notFoundCodes.length === 0) {
      return {
        success: true,
        joinedClasses: [],
        alreadyJoinedNames,
        notFoundCodes: [],
        message: `Anda sudah terdaftar di kelas ${alreadyJoinedNames.join(', ')}.`,
      };
    }

    if (newlyJoined.length === 0 && notFoundCodes.length > 0) {
      return {
        success: false,
        joinedClasses: [],
        alreadyJoinedNames,
        notFoundCodes,
        message: `Kode kelas (${notFoundCodes.join(', ')}) tidak ditemukan. Pastikan kode sesuai dengan yang dibagikan guru.`,
      };
    }

    let summary = `Berhasil bergabung ke ${newlyJoined.map((c) => c.name).join(', ')}!`;
    if (alreadyJoinedNames.length > 0) {
      summary += ` (${alreadyJoinedNames.join(', ')} sudah terdaftar sebelumnya).`;
    }
    if (notFoundCodes.length > 0) {
      summary += ` Kode tidak ditemukan: ${notFoundCodes.join(', ')}.`;
    }

    return {
      success: true,
      joinedClasses: newlyJoined,
      alreadyJoinedNames,
      notFoundCodes,
      message: summary,
    };
  };

  const joinClassByCode = (code: string): { success: boolean; message: string } => {
    const res = joinMultipleClassesByCodes([code]);
    return { success: res.success, message: res.message };
  };

  const leaveClass = (classId: string) => {
    setCurrentUserState((prev) => ({
      ...prev,
      joinedClassIds: (prev.joinedClassIds || []).filter((id) => id !== classId),
    }));
    setAllClasses((prev) =>
      prev.map((cls) => {
        if (cls.id !== classId) return cls;
        return {
          ...cls,
          memberIds: (cls.memberIds || []).filter((id) => id !== currentUser.id),
          studentCount:
            currentUser.role === 'student' ? Math.max(0, cls.studentCount - 1) : cls.studentCount,
        };
      })
    );
  };

  const deleteClass = (classId: string) => {
    if (currentUser.role !== 'teacher') return;
    setAllClasses((prev) => prev.filter((c) => c.id !== classId));
    setCurrentUserState((prev) => ({
      ...prev,
      joinedClassIds: (prev.joinedClassIds || []).filter((id) => id !== classId),
    }));
    setSchedules((prev) => prev.filter((s) => s.classId !== classId));
    setAssignments((prev) => prev.filter((a) => a.classId !== classId));
    setAnnouncements((prev) => prev.filter((a) => a.classId !== classId));

    safeSupabaseCall(supabase.from('classes').delete().eq('id', classId));
  };

  const clearAllClasses = () => {
    if (currentUser.role !== 'teacher') return;
    const idsToDelete = new Set(classes.map((c) => c.id));
    idsToDelete.forEach((id) => {
      safeSupabaseCall(supabase.from('classes').delete().eq('id', id));
    });
    setAllClasses((prev) => prev.filter((c) => !idsToDelete.has(c.id)));
    setCurrentUserState((prev) => ({
      ...prev,
      joinedClassIds: [],
    }));
    setActiveClassId('');
    setSchedules((prev) => prev.filter((s) => !idsToDelete.has(s.classId)));
    setAssignments((prev) => prev.filter((a) => !idsToDelete.has(a.classId)));
    setAnnouncements((prev) => prev.filter((a) => !idsToDelete.has(a.classId)));
  };

  // --- SCHEDULES, ASSIGNMENTS, SUBMISSIONS, ANNOUNCEMENTS ---

  const addScheduleItem = (item: Omit<ScheduleItem, 'id'>) => {
    const safeDay = Math.min(6, Math.max(1, item.dayOfWeek === 7 ? 1 : item.dayOfWeek));
    const newItem: ScheduleItem = {
      ...item,
      dayOfWeek: safeDay,
      id: `sch-${Date.now()}`,
    };
    setSchedules((prev) => [...prev, newItem]);
    safeSupabaseCall(supabase.from('schedules').upsert(mapScheduleToDb(newItem)));
  };

  const importScheduleItemsBatch = async (items: Omit<ScheduleItem, 'id'>[]): Promise<number> => {
    const newItems: ScheduleItem[] = items.map((item, idx) => ({
      ...item,
      dayOfWeek: Math.min(6, Math.max(1, item.dayOfWeek === 7 ? 1 : item.dayOfWeek)),
      id: `sch-${Date.now()}-${idx}-${Math.floor(Math.random() * 1000)}`,
    }));

    setSchedules((prev) => [...prev, ...newItems]);
    for (const item of newItems) {
      await safeSupabaseCall(supabase.from('schedules').upsert(mapScheduleToDb(item)));
    }
    return newItems.length;
  };

  const updateScheduleItem = (id: string, updated: Partial<ScheduleItem>) => {
    setSchedules((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const merged = { ...s, ...updated };
          safeSupabaseCall(supabase.from('schedules').upsert(mapScheduleToDb(merged)));
          return merged;
        }
        return s;
      })
    );
  };

  const deleteScheduleItem = (id: string) => {
    setSchedules((prev) => prev.filter((s) => s.id !== id));
    safeSupabaseCall(supabase.from('schedules').delete().eq('id', id));
  };

  const addAssignment = (
    item: Omit<Assignment, 'id' | 'createdBy' | 'createdByName' | 'createdAt'>,
    targetClassIds?: string[]
  ) => {
    if (currentUser.role !== 'teacher') return;

    const classIdsToPublish =
      targetClassIds && targetClassIds.length > 0 ? targetClassIds : [item.classId];

    const createdBatch: Assignment[] = classIdsToPublish.map((cid, idx) => ({
      ...item,
      classId: cid,
      id: `assign-${Date.now()}-${idx}`,
      createdBy: currentUser.id,
      createdByName: currentUser.name,
      createdAt: new Date().toISOString(),
      xpPenaltyOverdue: 30,
    }));

    setAssignments((prev) => [...createdBatch, ...prev]);
    createdBatch.forEach((a) => {
      safeSupabaseCall(supabase.from('assignments').upsert(mapAssignmentToDb(a)));
    });

    const broadcastNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      userId: 'student-all',
      title: 'Tugas Baru Diterbitkan',
      message: `${currentUser.name} mempublikasikan tugas "${item.title}" (${item.subjectName})${
        classIdsToPublish.length > 1 ? ` ke ${classIdsToPublish.length} kelas` : ''
      }.`,
      type: 'new_assignment',
      timestamp: new Date().toISOString(),
      isRead: false,
      relatedId: createdBatch[0].id,
    };
    setNotifications((prev) => [broadcastNotif, ...prev]);
  };

  const updateAssignment = (id: string, updated: Partial<Assignment>) => {
    if (currentUser.role !== 'teacher') return;
    setAssignments((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          const merged = { ...a, ...updated };
          safeSupabaseCall(supabase.from('assignments').upsert(mapAssignmentToDb(merged)));
          return merged;
        }
        return a;
      })
    );
  };

  const deleteAssignment = (id: string) => {
    if (currentUser.role !== 'teacher') return;
    setAssignments((prev) => prev.filter((a) => a.id !== id));
    setSubmissions((prev) => prev.filter((s) => s.assignmentId !== id));
    safeSupabaseCall(supabase.from('assignments').delete().eq('id', id));
  };

  const submitAssignment = (
    assignmentId: string,
    file: { name: string; size: string; type: string; dataUrl?: string },
    studentNote?: string,
    attendanceNum?: number
  ) => {
    if (currentUser.role !== 'student') return;

    const targetAssignment = assignments.find((a) => a.id === assignmentId);
    const now = new Date();
    const isLate = targetAssignment ? now > new Date(targetAssignment.dueDate) : false;
    const finalAttendance =
      attendanceNum !== undefined ? attendanceNum : currentUser.attendanceNumber || 1;

    if (attendanceNum !== undefined && attendanceNum !== currentUser.attendanceNumber) {
      setCurrentUserState((prev) => ({ ...prev, attendanceNumber: attendanceNum }));
    }

    const existingIndex = submissions.findIndex(
      (s) => s.assignmentId === assignmentId && s.studentId === currentUser.id
    );

    const submissionData: Submission = {
      id: existingIndex >= 0 ? submissions[existingIndex].id : `sub-${Date.now()}`,
      assignmentId,
      studentId: currentUser.id,
      studentName: currentUser.name,
      studentAvatar: currentUser.avatarUrl,
      attendanceNumber: finalAttendance,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      fileUrl: file.dataUrl,
      studentNote,
      submittedAt: now.toISOString(),
      isLate,
      status: 'pending_verification',
      grade: existingIndex >= 0 ? submissions[existingIndex].grade : undefined,
      feedback: existingIndex >= 0 ? submissions[existingIndex].feedback : undefined,
    };

    if (existingIndex >= 0) {
      setSubmissions((prev) => {
        const copy = [...prev];
        copy[existingIndex] = submissionData;
        return copy;
      });
    } else {
      setSubmissions((prev) => [submissionData, ...prev]);
    }

    safeSupabaseCall(supabase.from('submissions').upsert(mapSubmissionToDb(submissionData)));

    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      userId: currentUser.id,
      title: 'Tugas Berhasil Dikumpulkan!',
      message: `File "${file.name}" untuk "${
        targetAssignment?.title || 'Tugas'
      }" berhasil dikirim (Absen #${finalAttendance}). Menunggu verifikasi dari guru.`,
      type: 'assignment_reminder',
      timestamp: now.toISOString(),
      isRead: false,
      relatedId: assignmentId,
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  const verifySubmission = (
    submissionId: string,
    status: 'verified' | 'rejected',
    grade?: number,
    feedback?: string
  ) => {
    if (currentUser.role !== 'teacher') return;

    const now = new Date().toISOString();
    let assignTitle = '';
    let studentTargetId = '';
    let awardedXp = 0;

    setSubmissions((prev) =>
      prev.map((s) => {
        if (s.id === submissionId) {
          studentTargetId = s.studentId;
          const relatedAssignment = assignments.find((a) => a.id === s.assignmentId);
          assignTitle = relatedAssignment?.title || 'Tugas';
          awardedXp = status === 'verified' ? (s.isLate ? 50 : 75) : 0;
          if (typeof grade === 'number' && grade >= 85) {
            awardedXp += 50;
          }

          return {
            ...s,
            status,
            verifiedAt: now,
            verifiedBy: currentUser.name,
            xpAwarded: awardedXp,
            grade: grade !== undefined ? grade : s.grade,
            feedback: feedback !== undefined ? feedback : s.feedback,
            gradedAt: grade !== undefined ? now : s.gradedAt,
          };
        }
        return s;
      })
    );

    safeSupabaseCall(
      supabase
        .from('submissions')
        .update({
          grade: grade,
          feedback: feedback,
          graded_at: now,
        })
        .eq('id', submissionId)
    );

    if (status === 'verified') {
      setLastXpGainNotice({
        amount: awardedXp,
        reason: `Tugas "${assignTitle}" diverifikasi oleh ${currentUser.name}!`,
        timestamp: Date.now(),
      });
    }

    if (studentTargetId) {
      const notif: AppNotification = {
        id: `notif-${Date.now()}`,
        userId: studentTargetId,
        title:
          status === 'verified' ? 'Tugas Diverifikasi Guru (+XP Menyala!)' : 'Tugas Perlu Diperbaiki',
        message:
          status === 'verified'
            ? `${currentUser.name} telah memverifikasi tugas "${assignTitle}". XP Anda bertambah +${awardedXp} XP!${
                grade !== undefined ? ` Nilai: ${grade}/100.` : ''
              }`
            : `${currentUser.name} meminta perbaikan pada tugas "${assignTitle}": "${
                feedback || 'Mohon lengkapi tugas Anda'
              }"`,
        type: 'grade_posted',
        timestamp: now,
        isRead: false,
      };
      setNotifications((prev) => [notif, ...prev]);
    }
  };

  const gradeSubmission = (submissionId: string, grade: number, feedback: string) => {
    verifySubmission(submissionId, 'verified', grade, feedback);
  };

  const updateTeacherPhone = (
    phone: string,
    verificationPin: string
  ): { success: boolean; message: string } => {
    if (currentUser.role !== 'teacher') {
      return { success: false, message: 'Hanya akun guru yang dapat mengatur nomor kontak resmi.' };
    }

    const validPins = ['1985', '1234', '2026', '7788'];
    const isPinValid =
      validPins.includes(verificationPin.trim()) || verificationPin.trim().length >= 4;

    if (!isPinValid) {
      return {
        success: false,
        message:
          'PIN verifikasi guru tidak valid. Masukkan PIN keamanan pendidik resmi (misal: 1985).',
      };
    }

    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 9) {
      return {
        success: false,
        message: 'Nomor WhatsApp tidak valid. Masukkan nomor HP aktif (contoh: 081234567890).',
      };
    }

    let formattedPhone = cleanPhone;
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '62' + formattedPhone.slice(1);
    }

    setCurrentUserState((prev) => ({
      ...prev,
      phone: formattedPhone,
      isPhoneVerified: true,
    }));

    const teacherClassIds = new Set(classes.map((c) => c.id));
    if (teacherClassIds.size > 0) {
      setAllClasses((prev) =>
        prev.map((c) =>
          teacherClassIds.has(c.id)
            ? { ...c, teacherPhone: formattedPhone, isTeacherVerified: true }
            : c
        )
      );
      setSchedules((prev) =>
        prev.map((s) =>
          teacherClassIds.has(s.classId)
            ? { ...s, teacherPhone: formattedPhone, isTeacherVerified: true }
            : s
        )
      );
    }

    return {
      success: true,
      message:
        'Nomor WhatsApp resmi guru berhasil diverifikasi! Siswa sekarang dapat langsung terhubung ke WhatsApp Anda.',
    };
  };

  const addAnnouncement = (
    title: string,
    content: string,
    type: 'urgent' | 'info' | 'agenda',
    isNonKbmAgenda: boolean,
    location?: string,
    eventDate?: string,
    eventTime?: string,
    targetClassIds?: string[]
  ) => {
    const classIdsToPublish =
      targetClassIds && targetClassIds.length > 0
        ? targetClassIds
        : activeClass
        ? [activeClass.id]
        : [];
    if (classIdsToPublish.length === 0) return;

    const createdList: Announcement[] = classIdsToPublish.map((cid, idx) => ({
      id: `ann-${Date.now()}-${idx}`,
      classId: cid,
      title,
      content,
      type,
      isNonKbmAgenda,
      location,
      eventDate,
      eventTime,
      createdBy: currentUser.id,
      createdByName: currentUser.name,
      createdAt: new Date().toISOString(),
      likesCount: 1,
    }));

    setAnnouncements((prev) => [...createdList, ...prev]);
    createdList.forEach((ann) => {
      safeSupabaseCall(supabase.from('announcements').upsert(mapAnnouncementToDb(ann)));
    });

    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      userId: 'all',
      title: type === 'urgent' ? 'PENGUMUMAN PENTING GURU' : 'Pengumuman & Agenda Baru',
      message: `${title}: ${content.slice(0, 100)}...`,
      type: 'announcement',
      timestamp: new Date().toISOString(),
      isRead: false,
      relatedId: createdList[0].id,
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  const deleteAnnouncement = (id: string) => {
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    safeSupabaseCall(supabase.from('announcements').delete().eq('id', id));
  };

  const toggleLikeAnnouncement = (id: string) => {
    setAnnouncements((prev) =>
      prev.map((a) => (a.id === id ? { ...a, likesCount: (a.likesCount || 0) + 1 } : a))
    );
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const triggerSimulatedNotification = (
    type: 'class_reminder' | 'assignment_reminder' | 'new_announcement'
  ) => {
    let newNotif: AppNotification;
    if (type === 'class_reminder') {
      newNotif = {
        id: `notif-${Date.now()}`,
        userId: currentUser.id,
        title: 'Pengingat Kelas (15 Menit Lagi)',
        message:
          'Fisika Dasar & Mekanika akan dimulai pukul 07:45 WITA di Lab Fisika Lt. 2. Harap membawa buku catatan!',
        type: 'class_reminder',
        timestamp: new Date().toISOString(),
        isRead: false,
        roomLocation: 'Lab Fisika Lt. 2',
        dueTimeText: '15 menit lagi (07:45 WITA)',
      };
    } else if (type === 'assignment_reminder') {
      newNotif = {
        id: `notif-${Date.now()}`,
        userId: currentUser.id,
        title: 'Pengingat Tugas (2 Jam Lagi)',
        message:
          'Tugas jatuh tempo dalam 2 jam! Segera kumpulkan file jawaban beserta nomor urut absen Anda.',
        type: 'assignment_reminder',
        timestamp: new Date().toISOString(),
        isRead: false,
        dueTimeText: '2 Jam lagi',
      };
    } else {
      newNotif = {
        id: `notif-${Date.now()}`,
        userId: currentUser.id,
        title: 'Broadcast Pengumuman Guru',
        message:
          'Wali Kelas mengumumkan persiapan simulasi Asesmen Nasional Berbasis Komputer di Lab 1.',
        type: 'announcement',
        timestamp: new Date().toISOString(),
        isRead: false,
      };
    }
    setNotifications((prev) => [newNotif, ...prev]);
  };

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        currentUser,
        registeredUsers,
        setCurrentUser: setCurrentUserState,
        loginWithCredentials,
        quickLoginAccount,
        registerAccount,
        logout,
        switchRole,
        allDemoUsers,
        loginAsUser,
        registerUser,
        classes,
        allClasses,
        activeClass,
        setActiveClass,
        isAllClassesView,
        setIsAllClassesView,
        createClass,
        createMultipleClasses,
        deleteClass,
        leaveClass,
        clearAllClasses,
        joinClassByCode,
        joinMultipleClassesByCodes,
        schedules,
        addScheduleItem,
        importScheduleItemsBatch,
        updateScheduleItem,
        deleteScheduleItem,
        assignments,
        addAssignment,
        updateAssignment,
        deleteAssignment,
        submissions,
        submitAssignment,
        gradeSubmission,
        announcements,
        addAnnouncement,
        deleteAnnouncement,
        toggleLikeAnnouncement,
        notifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        triggerSimulatedNotification,
        witaTimeInfo,
        isRealTimeWita,
        setIsRealTimeWita,
        syncToCurrentWitaTime,
        simulatedDay,
        setSimulatedDay,
        simulatedTime,
        setSimulatedTime,
        isSimulatingLiveTime,
        setIsSimulatingLiveTime,
        activeLiveClass,
        createLiveScheduleNow,
        isDarkMode,
        setIsDarkMode,
        isMobileDeviceFrame,
        setIsMobileDeviceFrame,
        activeTab,
        setActiveTab,
        isSupabaseConnected,
        isSupabaseSyncing,
        syncWithSupabase,
        privacySettings,
        updatePrivacySettings,
        userXp,
        userBadges,
        userLevel,
        verifySubmission,
        updateTeacherPhone,
        xpBreakdown,
        expiredUnsubmittedAssignments,
        lastXpGainNotice,
        clearXpGainNotice,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
