import React from 'react';
import { useApp } from '../context/AppContext';
import { Calendar, CheckSquare, Megaphone, Users } from 'lucide-react';

export const BottomNavBar: React.FC = () => {
  const { activeTab, setActiveTab, currentUser, assignments, submissions } = useApp();

  // Calculate task badge
  let taskBadgeCount = 0;
  if (currentUser.role === 'student') {
    // Count assignments that the student hasn't submitted yet
    const mySubmittedIds = submissions
      .filter((s) => s.studentId === currentUser.id)
      .map((s) => s.assignmentId);
    taskBadgeCount = assignments.filter((a) => !mySubmittedIds.includes(a.id)).length;
  } else {
    // For teacher, count submissions that are waiting for grades
    taskBadgeCount = submissions.filter((s) => s.grade === undefined).length;
  }

  const tabs = [
    {
      id: 'jadwal' as const,
      label: 'Jadwal',
      sublabel: 'Hari Ini & Ruang',
      icon: Calendar,
    },
    {
      id: 'tugas' as const,
      label: 'Tugas',
      sublabel: currentUser.role === 'teacher' ? 'Kelola & Nilai' : 'Pengumpulan',
      icon: CheckSquare,
      badge: taskBadgeCount > 0 ? taskBadgeCount : null,
    },
    {
      id: 'agenda' as const,
      label: 'Agenda',
      sublabel: 'Pengumuman',
      icon: Megaphone,
    },
    {
      id: 'kelas' as const,
      label: 'Kelas',
      sublabel: 'Profil & Anggota',
      icon: Users,
    },
  ];

  return (
    <nav
      id="bottom-navigation-bar"
      aria-label="Navigasi Utama"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/90 dark:border-slate-800 transition-colors shadow-lg"
    >
      <div className="max-w-md sm:max-w-xl mx-auto px-4 flex justify-around items-center h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`nav-tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex flex-col items-center justify-center w-16 py-1 transition-all group ${
                isActive
                  ? 'text-indigo-600 dark:text-indigo-400 font-bold scale-105'
                  : 'text-slate-400 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-200 font-medium'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    isActive ? 'stroke-[2.5px] -translate-y-0.5' : 'stroke-[1.8px]'
                  }`}
                />
                {tab.badge && (
                  <span className="absolute -top-1.5 -right-2.5 px-1.5 py-0.2 min-w-[17px] h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[11px] mt-0.5 tracking-tight">{tab.label}</span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 mt-0.5 animate-in zoom-in" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
