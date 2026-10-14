import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  User,
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
  DEMO_STUDENTS,
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

interface AppContextType {
  // Auth & User
  currentUser: User;
  setCurrentUser: (user: User) => void;
  switchRole: () => void;
  allDemoUsers: User[];
  loginAsUser: (userId: string) => void;
  registerUser: (name: string, email: string, role: 'student' | 'teacher', idNum: string) => void;

  // Classes
  classes: ClassRoom[];
  activeClass: ClassRoom | null;
  setActiveClass: (cls: ClassRoom) => void;
  createClass: (name: string, gradeLevel: string, description: string) => ClassRoom;
  deleteClass: (classId: string) => void;
  clearAllClasses: () => void;
  joinClassByCode: (code: string) => { success: boolean; message: string };

  // Schedules
  schedules: ScheduleItem[];
  addScheduleItem: (item: Omit<ScheduleItem, 'id'>) => void;
  importScheduleItemsBatch: (items: Omit<ScheduleItem, 'id'>[]) => Promise<number>;
  updateScheduleItem: (id: string, item: Partial<ScheduleItem>) => void;
  deleteScheduleItem: (id: string) => void;

  // Assignments
  assignments: Assignment[];
  addAssignment: (item: Omit<Assignment, 'id' | 'createdBy' | 'createdByName' | 'createdAt'>) => void;
  deleteAssignment: (id: string) => void;

  // Submissions & Verification
  submissions: Submission[];
  submitAssignment: (
    assignmentId: string,
    file: { name: string; size: string; type: string; dataUrl?: string },
    studentNote?: string
  ) => void;
  gradeSubmission: (submissionId: string, grade: number, feedback: string) => void;
  verifySubmission: (
    submissionId: string,
    status: 'verified' | 'rejected',
    grade?: number,
    feedback?: string
  ) => void;

  // Teacher Phone & Verification
  updateTeacherPhone: (phone: string, verificationPin: string) => { success: boolean; message: string };

  // Announcements & Agenda
  announcements: Announcement[];
  addAnnouncement: (
    title: string,
    content: string,
    type: 'urgent' | 'info' | 'agenda',
    isNonKbmAgenda: boolean,
    location?: string,
    eventDate?: string,
    eventTime?: string
  ) => void;
  deleteAnnouncement: (id: string) => void;
  toggleLikeAnnouncement: (id: string) => void;

  // Notifications
  notifications: AppNotification[];
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  triggerSimulatedNotification: (type: 'class_reminder' | 'assignment_reminder' | 'new_announcement') => void;

  // Preferences, WITA Real-time & Simulation
  witaTimeInfo: WitaTimeInfo;
  isRealTimeWita: boolean;
  setIsRealTimeWita: (val: boolean) => void;
  syncToCurrentWitaTime: () => void;
  simulatedDay: number; // 1 = Senin, 2 = Selasa, ...
  setSimulatedDay: (day: number) => void;
  simulatedTime: string; // "HH:mm"
  setSimulatedTime: (time: string) => void;
  isSimulatingLiveTime: boolean;
  setIsSimulatingLiveTime: (val: boolean) => void;
  activeLiveClass: ScheduleItem | null;
  createLiveScheduleNow: (subjectName?: string) => void;

  // Display Settings
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean | ((prev: boolean) => boolean)) => void;
  isMobileDeviceFrame: boolean;
  setIsMobileDeviceFrame: (val: boolean | ((prev: boolean) => boolean)) => void;
  activeTab: 'jadwal' | 'tugas' | 'agenda' | 'kelas';
  setActiveTab: (tab: 'jadwal' | 'tugas' | 'agenda' | 'kelas') => void;

  // Supabase Database Integration
  isSupabaseConnected: boolean;
  isSupabaseSyncing: boolean;
  syncWithSupabase: () => Promise<void>;

  // Privacy & Data Security
  privacySettings: PrivacySettings;
  updatePrivacySettings: (settings: Partial<PrivacySettings>) => void;

  // Gamification & Badges
  userXp: number;
  userBadges: UserBadge[];
  userLevel: { level: number; title: string; nextXp: number; prevXp: number };
  xpBreakdown: XpBreakdown;
  expiredUnsubmittedAssignments: Assignment[];
  lastXpGainNotice: { amount: number; reason: string; timestamp: number } | null;
  clearXpGainNotice: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const DATA_VERSION = 'v5_clean_no_sample_data';

  // Load or initialize state from localStorage
  const [currentUser, setCurrentUserState] = useState<User>(() => {
    const version = localStorage.getItem('classsync_version');
    const saved = localStorage.getItem('classsync_user');
    if (version !== DATA_VERSION || !saved) {
      return INITIAL_STUDENT;
    }
    try {
      const parsed: User = JSON.parse(saved);
      if (parsed.name.includes('Ahmad Fauzi') || parsed.name.includes('Fathir')) {
        return INITIAL_STUDENT;
      }
      return parsed;
    } catch {
      return INITIAL_STUDENT;
    }
  });

  const [classes, setClasses] = useState<ClassRoom[]>(() => {
    const version = localStorage.getItem('classsync_version');
    if (version !== DATA_VERSION) {
      const defaultActiveId = INITIAL_CLASSES.length > 0 ? INITIAL_CLASSES[0].id : '';
      localStorage.setItem('classsync_version', DATA_VERSION);
      localStorage.setItem('classsync_user', JSON.stringify(INITIAL_STUDENT));
      localStorage.setItem('classsync_active_class_id', defaultActiveId);
      return INITIAL_CLASSES;
    }
    const saved = localStorage.getItem('classsync_classes');
    return saved ? JSON.parse(saved) : INITIAL_CLASSES;
  });

  const [activeClassId, setActiveClassId] = useState<string>(() => {
    const version = localStorage.getItem('classsync_version');
    if (version !== DATA_VERSION) {
      return INITIAL_CLASSES.length > 0 ? INITIAL_CLASSES[0].id : '';
    }
    const saved = localStorage.getItem('classsync_active_class_id');
    return saved || (INITIAL_CLASSES.length > 0 ? INITIAL_CLASSES[0].id : '');
  });

  const [schedules, setSchedules] = useState<ScheduleItem[]>(() => {
    const version = localStorage.getItem('classsync_version');
    if (version !== DATA_VERSION) {
      return INITIAL_SCHEDULES;
    }
    const saved = localStorage.getItem('classsync_schedules');
    if (!saved) return INITIAL_SCHEDULES;
    try {
      const parsed: ScheduleItem[] = JSON.parse(saved);
      return parsed.filter((s) => !s.subjectName.toLowerCase().includes('upacara'));
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

  // Waktu Indonesia Tengah (WITA, UTC+8) Realtime & Simulation state
  const initialWita = getWitaNow();
  const [witaTimeInfo, setWitaTimeInfo] = useState<WitaTimeInfo>(initialWita);
  const [isRealTimeWita, setIsRealTimeWita] = useState<boolean>(true);
  const [simulatedDay, setSimulatedDay] = useState<number>(initialWita.dayOfWeek);
  const [simulatedTime, setSimulatedTime] = useState<string>(initialWita.formattedTime);
  const [isSimulatingLiveTime, setIsSimulatingLiveTime] = useState<boolean>(true);

  // Interval real-time sinkronisasi Waktu Indonesia Tengah (WITA)
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

  // Sync with Supabase (push and pull)
  const syncWithSupabase = async () => {
    setIsSupabaseSyncing(true);
    try {
      // 1. Classes
      const { data: dbClasses, error: classErr } = await supabase.from('classes').select('*');
      if (!classErr && dbClasses) {
        setIsSupabaseConnected(true);
        if (dbClasses.length > 0) {
          const mapped = dbClasses.map(mapClassFromDb);
          setClasses(mapped);
          setActiveClassId((prev) => (mapped.some((c) => c.id === prev) ? prev : mapped[0].id));
        } else if (classes.length > 0) {
          for (const c of classes) {
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
              .filter((s) => !s.subjectName.toLowerCase().includes('upacara'))
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
      const { data: dbAnnouncements, error: annErr } = await supabase.from('announcements').select('*');
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
      console.warn('Supabase sync skipped (waiting for table migration):', err);
    } finally {
      setIsSupabaseSyncing(false);
    }
  };

  // Initial Supabase connection check, cleanup of upacara items, & realtime sync
  useEffect(() => {
    // Purge any upacara items from state and database
    setAnnouncements((prev) => prev.filter((a) => !a.title.toLowerCase().includes('upacara')));
    setSchedules((prev) => prev.filter((s) => !s.subjectName.toLowerCase().includes('upacara')));
    safeSupabaseCall(supabase.from('announcements').delete().ilike('title', '%upacara%'));
    safeSupabaseCall(supabase.from('schedules').delete().ilike('subject_name', '%upacara%'));

    syncWithSupabase();

    const channel = supabase
      .channel('supabase-live-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'classes' }, async () => {
        const { data } = await supabase.from('classes').select('*');
        if (data) setClasses(data.map(mapClassFromDb));
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'schedules' }, async () => {
        const { data } = await supabase.from('schedules').select('*');
        if (data) setSchedules(data.map(mapScheduleFromDb).filter((s) => !s.subjectName.toLowerCase().includes('upacara')));
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'assignments' }, async () => {
        const { data } = await supabase.from('assignments').select('*');
        if (data) setAssignments(data.map(mapAssignmentFromDb));
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'submissions' }, async () => {
        const { data } = await supabase.from('submissions').select('*');
        if (data) setSubmissions(data.map(mapSubmissionFromDb));
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'announcements' }, async () => {
        const { data } = await supabase.from('announcements').select('*');
        if (data) setAnnouncements(data.map(mapAnnouncementFromDb).filter((a) => !a.title.toLowerCase().includes('upacara')));
      })
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
    localStorage.setItem('classsync_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('classsync_classes', JSON.stringify(classes));
  }, [classes]);

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

  // Handle dark mode class on document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const activeClass = classes.find((c) => c.id === activeClassId) || (classes.length > 0 ? classes[0] : null);

  // Kelas yang sedang berlangsung (Live) terhubung dengan Waktu Nyata WITA
  const activeLiveClass = useMemo(() => {
    if (!activeClass) return null;
    const currentDay = isRealTimeWita ? witaTimeInfo.dayOfWeek : simulatedDay;
    const currentMinutes = isRealTimeWita ? witaTimeInfo.totalMinutes : timeToMinutes(simulatedTime);
    return (
      schedules
        .filter((s) => s.classId === activeClass.id && s.dayOfWeek === currentDay)
        .find((s) => {
          const startMin = timeToMinutes(s.startTime);
          const endMin = timeToMinutes(s.endTime);
          return currentMinutes >= startMin && currentMinutes < endMin;
        }) || null
    );
  }, [
    schedules,
    activeClass,
    isRealTimeWita,
    witaTimeInfo.dayOfWeek,
    witaTimeInfo.totalMinutes,
    simulatedDay,
    simulatedTime,
  ]);

  const createLiveScheduleNow = (subjectName: string = 'Matematika Terapan') => {
    if (!activeClass) {
      alert('Pilih atau buat kelas terlebih dahulu.');
      return;
    }
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
          : activeClass.teacherName || 'Bpk. Hendra S.Pd',
      teacherPhone: currentUser.phone || activeClass.teacherPhone || '081234567890',
      isTeacherVerified: true,
      dayOfWeek: info.dayOfWeek,
      startTime: startStr,
      endTime: endStr,
      roomLocation: 'Ruang 7-A (Lantai 1)',
      colorTheme: 'emerald',
      notes: `Sesi KBM aktif disinkronkan otomatis dengan Waktu Nyata WITA (${info.formattedTime}).`,
    };

    setSchedules((prev) => [...prev, newItem]);
    safeSupabaseCall(supabase.from('schedules').upsert(mapScheduleToDb(newItem)));
  };

  const setActiveClass = (cls: ClassRoom) => {
    setActiveClassId(cls.id);
  };

  const deleteClass = (classId: string) => {
    if (currentUser.role !== 'teacher') {
      alert('Siswa tidak dapat menghapus kelas. Tindakan ini hanya untuk guru.');
      return;
    }
    setClasses((prev) => {
      const updated = prev.filter((c) => c.id !== classId);
      if (activeClassId === classId) {
        setActiveClassId(updated.length > 0 ? updated[0].id : '');
      }
      return updated;
    });
    setSchedules((prev) => prev.filter((s) => s.classId !== classId));
    setAssignments((prev) => prev.filter((a) => a.classId !== classId));
    setAnnouncements((prev) => prev.filter((a) => a.classId !== classId));

    safeSupabaseCall(supabase.from('classes').delete().eq('id', classId));
  };

  const clearAllClasses = () => {
    if (currentUser.role !== 'teacher') {
      alert('Siswa tidak dapat menghapus kelas.');
      return;
    }
    classes.forEach((c) => {
      safeSupabaseCall(supabase.from('classes').delete().eq('id', c.id));
    });
    setClasses([]);
    setActiveClassId('');
    setSchedules([]);
    setAssignments([]);
    setSubmissions([]);
    setAnnouncements([]);
  };

  const switchRole = () => {
    if (currentUser.role === 'student') {
      setCurrentUserState(INITIAL_TEACHER);
    } else {
      setCurrentUserState(INITIAL_STUDENT);
    }
  };

  const allDemoUsers = [INITIAL_TEACHER, ...DEMO_STUDENTS];

  const loginAsUser = (userId: string) => {
    const target = allDemoUsers.find((u) => u.id === userId);
    if (target) {
      setCurrentUserState(target);
    }
  };

  const registerUser = (name: string, email: string, role: 'student' | 'teacher', idNum: string) => {
    const newUser: User = {
      id: `user-${Date.now()}`,
      name,
      email,
      role,
      avatarUrl:
        role === 'teacher'
          ? 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      identifierNumber: role === 'teacher' ? `NIP. ${idNum}` : `NISN. ${idNum}`,
      className: role === 'student' ? activeClass?.name : undefined,
      schoolName: currentUser.schoolName || 'MTs',
    };
    setCurrentUserState(newUser);
  };

  const createClass = (name: string, gradeLevel: string, description: string): ClassRoom => {
    if (currentUser.role !== 'teacher') {
      throw new Error('Siswa tidak memiliki izin membuat kelas baru. Hanya akun guru yang dapat membuat kelas.');
    }
    const randomCode = `${name.replace(/\s+/g, '-').slice(0, 7).toUpperCase()}-${Math.floor(
      100 + Math.random() * 900
    )}`;
    const newClass: ClassRoom = {
      id: `class-${Date.now()}`,
      name,
      gradeLevel,
      code: randomCode,
      teacherId: currentUser.id,
      teacherName: currentUser.name,
      academicYear: '2026/2027 Ganjil',
      studentCount: 1,
      description: description || 'Kelas baru di ClassyWork',
      bannerColor: 'indigo',
    };

    setClasses((prev) => [newClass, ...prev]);
    setActiveClassId(newClass.id);

    // Sync to Supabase
    safeSupabaseCall(supabase.from('classes').upsert(mapClassToDb(newClass)));

    // Add notification
    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      userId: currentUser.id,
      title: '🎉 Kelas Berhasil Dibuat',
      message: `Kode kelas Anda: ${randomCode}. Bagikan kepada siswa untuk bergabung.`,
      type: 'announcement',
      timestamp: new Date().toISOString(),
      isRead: false,
    };
    setNotifications((prev) => [notif, ...prev]);

    return newClass;
  };

  const joinClassByCode = (code: string): { success: boolean; message: string } => {
    const cleanCode = code.trim().toUpperCase();
    const found = classes.find((c) => c.code.toUpperCase() === cleanCode);

    if (found) {
      setActiveClassId(found.id);
      // Increment student count
      setClasses((prev) =>
        prev.map((c) => (c.id === found.id ? { ...c, studentCount: c.studentCount + 1 } : c))
      );

      // Notification
      const notif: AppNotification = {
        id: `notif-${Date.now()}`,
        userId: currentUser.id,
        title: '✅ Berhasil Bergabung ke Kelas',
        message: `Anda telah terdaftar di kelas ${found.name}. Jadwal dan tugas telah diperbarui.`,
        type: 'announcement',
        timestamp: new Date().toISOString(),
        isRead: false,
      };
      setNotifications((prev) => [notif, ...prev]);

      return { success: true, message: `Berhasil bergabung ke ${found.name}!` };
    }

    return {
      success: false,
      message: 'Kode kelas tidak ditemukan. Mohon periksa kembali kode yang diberikan oleh guru.',
    };
  };

  const addScheduleItem = (item: Omit<ScheduleItem, 'id'>) => {
    const newItem: ScheduleItem = {
      ...item,
      id: `sch-${Date.now()}`,
    };
    setSchedules((prev) => [...prev, newItem]);
    safeSupabaseCall(supabase.from('schedules').upsert(mapScheduleToDb(newItem)));
  };

  const importScheduleItemsBatch = async (items: Omit<ScheduleItem, 'id'>[]): Promise<number> => {
    const newItems: ScheduleItem[] = items.map((item, idx) => ({
      ...item,
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
    item: Omit<Assignment, 'id' | 'createdBy' | 'createdByName' | 'createdAt'>
  ) => {
    if (currentUser.role !== 'teacher') {
      alert('Siswa tidak memiliki izin menerbitkan tugas. Hanya akun guru yang dapat membuat tugas.');
      return;
    }
    const newAssignment: Assignment = {
      ...item,
      id: `assign-${Date.now()}`,
      createdBy: currentUser.id,
      createdByName: currentUser.name,
      createdAt: new Date().toISOString(),
      xpPenaltyOverdue: 30, // Pinalti pengurangan XP jika tidak mengumpulkan
    };
    setAssignments((prev) => [newAssignment, ...prev]);
    safeSupabaseCall(supabase.from('assignments').upsert(mapAssignmentToDb(newAssignment)));

    // Broadcast push notification to students
    const broadcastNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      userId: 'student-all',
      title: '📝 Tugas Baru Diterbitkan',
      message: `${currentUser.name} mempublikasikan tugas "${item.title}" (${item.subjectName}). Tenggat: ${new Date(item.dueDate).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}.`,
      type: 'new_assignment',
      timestamp: new Date().toISOString(),
      isRead: false,
      relatedId: newAssignment.id,
    };
    setNotifications((prev) => [broadcastNotif, ...prev]);
  };

  const deleteAssignment = (id: string) => {
    if (currentUser.role !== 'teacher') {
      alert('Siswa tidak dapat menghapus tugas.');
      return;
    }
    setAssignments((prev) => prev.filter((a) => a.id !== id));
    setSubmissions((prev) => prev.filter((s) => s.assignmentId !== id));

    safeSupabaseCall(supabase.from('assignments').delete().eq('id', id));
  };

  const submitAssignment = (
    assignmentId: string,
    file: { name: string; size: string; type: string; dataUrl?: string },
    studentNote?: string
  ) => {
    if (currentUser.role !== 'student') {
      alert('Akun guru tidak dapat mengumpulkan tugas. Form pengumpulan khusus untuk siswa.');
      return;
    }

    const targetAssignment = assignments.find((a) => a.id === assignmentId);
    const now = new Date();
    const isLate = targetAssignment ? now > new Date(targetAssignment.dueDate) : false;

    // Check if already submitted, then update or create
    const existingIndex = submissions.findIndex(
      (s) => s.assignmentId === assignmentId && s.studentId === currentUser.id
    );

    const submissionData: Submission = {
      id: existingIndex >= 0 ? submissions[existingIndex].id : `sub-${Date.now()}`,
      assignmentId,
      studentId: currentUser.id,
      studentName: currentUser.name,
      studentAvatar: currentUser.avatarUrl,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      fileUrl: file.dataUrl,
      studentNote,
      submittedAt: now.toISOString(),
      isLate,
      status: 'pending_verification', // Menunggu verifikasi resmi dari guru
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

    // Sync to Supabase
    safeSupabaseCall(supabase.from('submissions').upsert(mapSubmissionToDb(submissionData)));

    // Add confirmation notification
    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      userId: currentUser.id,
      title: '🚀 Tugas Berhasil Dikumpulkan!',
      message: `File "${file.name}" untuk "${targetAssignment?.title || 'Tugas'}" berhasil dikirim. Menunggu verifikasi dari guru pengampu agar XP Anda bertambah!`,
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
    if (currentUser.role !== 'teacher') {
      alert('Hanya akun guru yang dapat memverifikasi pengumpulan tugas siswa.');
      return;
    }

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

    // Sync to Supabase
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

    // Trigger glowing XP notice
    if (status === 'verified') {
      setLastXpGainNotice({
        amount: awardedXp,
        reason: `Tugas "${assignTitle}" diverifikasi oleh ${currentUser.name}!`,
        timestamp: Date.now(),
      });
    }

    // Send notification to student
    if (studentTargetId) {
      const notif: AppNotification = {
        id: `notif-${Date.now()}`,
        userId: studentTargetId,
        title: status === 'verified' ? '🌟 Tugas Diverifikasi Guru (+XP Menyala!)' : '⚠️ Tugas Perlu Diperbaiki',
        message:
          status === 'verified'
            ? `${currentUser.name} telah memverifikasi tugas "${assignTitle}". XP Anda bertambah +${awardedXp} XP!${
                grade !== undefined ? ` Nilai: ${grade}/100.` : ''
              }`
            : `${currentUser.name} meminta perbaikan pada tugas "${assignTitle}": "${feedback || 'Mohon lengkapi tugas Anda'}"`,
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

    // PIN verifikasi sekolah resmi (1985 / 1234 / 2026 atau PIN NIP 4 digit)
    const validPins = ['1985', '1234', '2026', '7788'];
    const isPinValid = validPins.includes(verificationPin.trim()) || verificationPin.trim().length >= 4;

    if (!isPinValid) {
      return {
        success: false,
        message: 'PIN verifikasi guru tidak valid. Masukkan PIN keamanan pendidik resmi (misal: 1985).',
      };
    }

    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 9) {
      return {
        success: false,
        message: 'Nomor WhatsApp tidak valid. Masukkan nomor HP aktif (contoh: 081234567890).',
      };
    }

    // Format to Indonesian standard
    let formattedPhone = cleanPhone;
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '62' + formattedPhone.slice(1);
    }

    // Update currentUser state
    setCurrentUserState((prev) => {
      const updated = {
        ...prev,
        phone: formattedPhone,
        isPhoneVerified: true,
      };
      localStorage.setItem('classsync_user', JSON.stringify(updated));
      return updated;
    });

    // Update active class & schedule items teacherPhone
    if (activeClass) {
      setClasses((prev) =>
        prev.map((c) =>
          c.id === activeClass.id
            ? { ...c, teacherPhone: formattedPhone, isTeacherVerified: true }
            : c
        )
      );
      setSchedules((prev) =>
        prev.map((s) =>
          s.classId === activeClass.id
            ? { ...s, teacherPhone: formattedPhone, isTeacherVerified: true }
            : s
        )
      );
    }

    return {
      success: true,
      message: 'Nomor WhatsApp resmi guru berhasil diverifikasi! Siswa sekarang dapat langsung terhubung ke WhatsApp Anda.',
    };
  };

  const addAnnouncement = (
    title: string,
    content: string,
    type: 'urgent' | 'info' | 'agenda',
    isNonKbmAgenda: boolean,
    location?: string,
    eventDate?: string,
    eventTime?: string
  ) => {
    if (!activeClass) return;
    const newAnn: Announcement = {
      id: `ann-${Date.now()}`,
      classId: activeClass.id,
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
    };

    setAnnouncements((prev) => [newAnn, ...prev]);

    // Sync to Supabase
    safeSupabaseCall(supabase.from('announcements').upsert(mapAnnouncementToDb(newAnn)));

    // Broadcast push notification
    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      userId: 'all',
      title: type === 'urgent' ? '🚨 PENGUMUMAN PENTING GURU' : '📢 Pengumuman & Agenda Baru',
      message: `${title}: ${content.slice(0, 100)}...`,
      type: 'announcement',
      timestamp: new Date().toISOString(),
      isRead: false,
      relatedId: newAnn.id,
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
        title: '🔔 Pengingat Kelas (15 Menit Lagi)',
        message: 'Fisika Dasar & Mekanika akan dimulai pukul 07:45 di Lab Fisika Lt. 2. Harap membawa jas praktikum!',
        type: 'class_reminder',
        timestamp: new Date().toISOString(),
        isRead: false,
        roomLocation: 'Lab Fisika Lt. 2',
        dueTimeText: '15 menit lagi (07:45 WIB)',
      };
    } else if (type === 'assignment_reminder') {
      newNotif = {
        id: `notif-${Date.now()}`,
        userId: currentUser.id,
        title: '⏰ Pengingat Tugas (H-1 & 2 Jam)',
        message: 'Tugas "Analisis Vektor & Persamaan Garis Singgung" jatuh tempo dalam 2 jam! Segera kumpulkan file jawaban Anda.',
        type: 'assignment_reminder',
        timestamp: new Date().toISOString(),
        isRead: false,
        dueTimeText: '2 Jam lagi',
      };
    } else {
      newNotif = {
        id: `notif-${Date.now()}`,
        userId: currentUser.id,
        title: '📢 Broadcast Pengumuman Guru',
        message: 'Wali Kelas mengumumkan persiapan simulasi Asesmen Nasional Berbasis Komputer di Lab 1.',
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
        currentUser,
        setCurrentUser: setCurrentUserState,
        switchRole,
        allDemoUsers,
        loginAsUser,
        registerUser,
        classes,
        activeClass,
        setActiveClass,
        createClass,
        deleteClass,
        clearAllClasses,
        joinClassByCode,
        schedules,
        addScheduleItem,
        importScheduleItemsBatch,
        updateScheduleItem,
        deleteScheduleItem,
        assignments,
        addAssignment,
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
