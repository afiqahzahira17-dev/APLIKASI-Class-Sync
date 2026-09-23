import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  ClassRoom,
  ScheduleItem,
  Assignment,
  Submission,
  Announcement,
  AppNotification,
} from '../types';
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
  updateScheduleItem: (id: string, item: Partial<ScheduleItem>) => void;
  deleteScheduleItem: (id: string) => void;

  // Assignments
  assignments: Assignment[];
  addAssignment: (item: Omit<Assignment, 'id' | 'createdBy' | 'createdByName' | 'createdAt'>) => void;
  deleteAssignment: (id: string) => void;

  // Submissions
  submissions: Submission[];
  submitAssignment: (
    assignmentId: string,
    file: { name: string; size: string; type: string; dataUrl?: string },
    studentNote?: string
  ) => void;
  gradeSubmission: (submissionId: string, grade: number, feedback: string) => void;

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

  // Preferences & Simulation
  simulatedDay: number; // 1 = Senin, 2 = Selasa, ...
  setSimulatedDay: (day: number) => void;
  simulatedTime: string; // "HH:mm"
  setSimulatedTime: (time: string) => void;
  isSimulatingLiveTime: boolean;
  setIsSimulatingLiveTime: (val: boolean) => void;

  // Display Settings
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean | ((prev: boolean) => boolean)) => void;
  isMobileDeviceFrame: boolean;
  setIsMobileDeviceFrame: (val: boolean | ((prev: boolean) => boolean)) => void;
  activeTab: 'jadwal' | 'tugas' | 'agenda' | 'kelas';
  setActiveTab: (tab: 'jadwal' | 'tugas' | 'agenda' | 'kelas') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const DATA_VERSION = 'v4_empty_classes_custom';

  // Load or initialize state from localStorage
  const [currentUser, setCurrentUserState] = useState<User>(() => {
    const version = localStorage.getItem('classsync_version');
    if (version !== DATA_VERSION) {
      return INITIAL_TEACHER;
    }
    const saved = localStorage.getItem('classsync_user');
    return saved ? JSON.parse(saved) : INITIAL_TEACHER;
  });

  const [classes, setClasses] = useState<ClassRoom[]>(() => {
    const version = localStorage.getItem('classsync_version');
    if (version !== DATA_VERSION) {
      const defaultActiveId = INITIAL_CLASSES.length > 0 ? INITIAL_CLASSES[0].id : '';
      localStorage.setItem('classsync_version', DATA_VERSION);
      localStorage.setItem('classsync_user', JSON.stringify(INITIAL_TEACHER));
      localStorage.setItem('classsync_active_class_id', defaultActiveId);
      localStorage.setItem('classsync_classes', JSON.stringify(INITIAL_CLASSES));
      localStorage.setItem('classsync_schedules', JSON.stringify(INITIAL_SCHEDULES));
      localStorage.setItem('classsync_assignments', JSON.stringify(INITIAL_ASSIGNMENTS));
      localStorage.setItem('classsync_submissions', JSON.stringify(INITIAL_SUBMISSIONS));
      localStorage.setItem('classsync_announcements', JSON.stringify(INITIAL_ANNOUNCEMENTS));
      localStorage.setItem('classsync_notifications', JSON.stringify(INITIAL_NOTIFICATIONS));
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
    return saved ? JSON.parse(saved) : INITIAL_SCHEDULES;
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
    return saved ? JSON.parse(saved) : INITIAL_ANNOUNCEMENTS;
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const version = localStorage.getItem('classsync_version');
    if (version !== DATA_VERSION) {
      return INITIAL_NOTIFICATIONS;
    }
    const saved = localStorage.getItem('classsync_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  // Time simulation state - defaults to Monday (1) 08:15 AM so "Fisika Dasar & Mekanika" is LIVE
  const [simulatedDay, setSimulatedDay] = useState<number>(1);
  const [simulatedTime, setSimulatedTime] = useState<string>('08:15');
  const [isSimulatingLiveTime, setIsSimulatingLiveTime] = useState<boolean>(true);

  // Layout & Theme states
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isMobileDeviceFrame, setIsMobileDeviceFrame] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'jadwal' | 'tugas' | 'agenda' | 'kelas'>('jadwal');

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

  const setActiveClass = (cls: ClassRoom) => {
    setActiveClassId(cls.id);
  };

  const deleteClass = (classId: string) => {
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
  };

  const clearAllClasses = () => {
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
      schoolName: 'MTs Negeri 1 Model Nusantara',
    };
    setCurrentUserState(newUser);
  };

  const createClass = (name: string, gradeLevel: string, description: string): ClassRoom => {
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
      description: description || 'Kelas baru di ClassSync',
      bannerColor: 'indigo',
    };

    setClasses((prev) => [newClass, ...prev]);
    setActiveClassId(newClass.id);

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
  };

  const updateScheduleItem = (id: string, updated: Partial<ScheduleItem>) => {
    setSchedules((prev) => prev.map((s) => (s.id === id ? { ...s, ...updated } : s)));
  };

  const deleteScheduleItem = (id: string) => {
    setSchedules((prev) => prev.filter((s) => s.id !== id));
  };

  const addAssignment = (
    item: Omit<Assignment, 'id' | 'createdBy' | 'createdByName' | 'createdAt'>
  ) => {
    const newAssignment: Assignment = {
      ...item,
      id: `assign-${Date.now()}`,
      createdBy: currentUser.id,
      createdByName: currentUser.name,
      createdAt: new Date().toISOString(),
    };
    setAssignments((prev) => [newAssignment, ...prev]);

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
    setAssignments((prev) => prev.filter((a) => a.id !== id));
    setSubmissions((prev) => prev.filter((s) => s.assignmentId !== id));
  };

  const submitAssignment = (
    assignmentId: string,
    file: { name: string; size: string; type: string; dataUrl?: string },
    studentNote?: string
  ) => {
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

    // Add confirmation notification
    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      userId: currentUser.id,
      title: '🚀 Tugas Berhasil Dikumpulkan!',
      message: `File "${file.name}" untuk "${targetAssignment?.title || 'Tugas'}" berhasil diunggah${
        isLate ? ' (Status: Terlambat)' : ' tepat waktu'
      }.`,
      type: 'assignment_reminder',
      timestamp: now.toISOString(),
      isRead: false,
      relatedId: assignmentId,
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  const gradeSubmission = (submissionId: string, grade: number, feedback: string) => {
    const now = new Date().toISOString();
    let studentTargetId = '';
    let assignTitle = '';

    setSubmissions((prev) =>
      prev.map((s) => {
        if (s.id === submissionId) {
          studentTargetId = s.studentId;
          const relatedAssignment = assignments.find((a) => a.id === s.assignmentId);
          assignTitle = relatedAssignment?.title || 'Tugas';
          return {
            ...s,
            grade,
            feedback,
            gradedAt: now,
          };
        }
        return s;
      })
    );

    // Send notification to student
    if (studentTargetId) {
      const gradeNotif: AppNotification = {
        id: `notif-${Date.now()}`,
        userId: studentTargetId,
        title: '⭐ Tugas Telah Dinilai',
        message: `${currentUser.name} telah memberi nilai ${grade}/100 untuk "${assignTitle}". Masukan: "${feedback.slice(0, 80)}${feedback.length > 80 ? '...' : ''}"`,
        type: 'grade_posted',
        timestamp: now,
        isRead: false,
      };
      setNotifications((prev) => [gradeNotif, ...prev]);
    }
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
        simulatedDay,
        setSimulatedDay,
        simulatedTime,
        setSimulatedTime,
        isSimulatingLiveTime,
        setIsSimulatingLiveTime,
        isDarkMode,
        setIsDarkMode,
        isMobileDeviceFrame,
        setIsMobileDeviceFrame,
        activeTab,
        setActiveTab,
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
