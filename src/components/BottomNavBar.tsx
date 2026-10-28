import React from 'react';
import { useApp } from '../context/AppContext';
import { LayoutGrid, Calendar, Megaphone, User } from 'lucide-react';

export const BottomNavBar: React.FC = () => {
  const { activeTab, setActiveTab, currentUser, assignments, submissions } = useApp();

  // Calculate task badge
  let taskBadgeCount = 0;
  if (currentUser.role === 'student') {
    const mySubmittedIds = submissions
      .filter((s) => s.studentId === currentUser.id)
      .map((s) => s.assignmentId);
    taskBadgeCount = assignments.filter((a) => !mySubmittedIds.includes(a.id)).length;
  } else {
    taskBadgeCount = submissions.filter((s) => s.grade === undefined).length;
  }

  const tabs = [
    {
      id: 'jadwal' as const,
      label: 'Jadwal',
      sublabel: 'Hari Ini & Ruang',
      icon: LayoutGrid,
    },
    {
      id: 'tugas' as const,
      label: 'Tugas',
      sublabel: currentUser.role === 'teacher' ? 'Kelola & Nilai' : 'Pengumpulan',
      icon: Calendar,
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
      icon: User,
    },
  ];

  return (
    <nav
      id="bottom-navigation-bar"
      aria-label="Navigasi Utama"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#112C36]/95 backdrop-blur-md border-t border-[#ECECE7] dark:border-[#1E4756] rounded-t-[28px] shadow-[0_-10px_34px_rgba(22,62,75,0.07)] transition-colors"
    >
      <div className="max-w-md sm:max-w-2xl mx-auto px-4 flex justify-around items-center h-[68px]">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`nav-tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex flex-col items-center justify-center min-w-[64px] min-h-[48px] py-1.5 transition-all cursor-pointer group ${
                isActive
                  ? 'text-[#163E4B] dark:text-[#F4A950] font-bold'
                  : 'text-[#B4BFC4] hover:text-[#163E4B]/70 dark:text-[#688792] dark:hover:text-[#E2EDF0] font-medium'
              }`}
            >
              <div className="relative flex items-center justify-center">
                <Icon
                  className={`w-[21px] h-[21px] transition-transform duration-150 ${
                    isActive
                      ? 'stroke-[2.5px] -translate-y-0.5 fill-[#163E4B]/10 dark:fill-[#F4A950]/15'
                      : 'stroke-[2px]'
                  }`}
                />
                {tab.badge && (
                  <span className="absolute -top-2 -right-3 px-1.5 min-w-[18px] h-[18px] rounded-full bg-[#F4A950] text-white text-[10px] font-extrabold tabular-nums flex items-center justify-center shadow-xs ring-2 ring-[#F4A950]/30">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[11px] mt-0.5 tracking-tight whitespace-nowrap">
                {tab.label}
              </span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#163E4B] dark:bg-[#F4A950] mt-0.5 transition-transform" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
