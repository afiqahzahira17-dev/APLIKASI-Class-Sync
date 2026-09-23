import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Bell,
  GraduationCap,
  Moon,
  Sun,
  Check,
  Plus,
  ShieldCheck,
  Clock,
} from 'lucide-react';

interface HeaderNavProps {
  onOpenNotifications: () => void;
  onOpenAuth: () => void;
  onOpenClassModal: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  onOpenNotifications,
  onOpenAuth,
  onOpenClassModal,
}) => {
  const {
    currentUser,
    switchRole,
    activeClass,
    classes,
    setActiveClass,
    notifications,
    isDarkMode,
    setIsDarkMode,
    simulatedTime,
    simulatedDay,
    setSimulatedDay,
    setSimulatedTime,
  } = useApp();

  const [showTimeModal, setShowTimeModal] = useState(false);

  const unreadNotifsCount = notifications.filter((n) => !n.isRead).length;

  const dayNames = ['', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-2 flex items-center justify-between gap-2">
          {/* Brand & Active Class Info */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
              <GraduationCap className="w-4 h-4" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm sm:text-base tracking-tight text-slate-900 dark:text-white">
                  ClassSync
                </span>
                <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  InfoKelas
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {activeClass ? `${activeClass.gradeLevel} • ${activeClass.name}` : 'Belum Ada Kelas'}
              </p>
            </div>
          </div>

          {/* Right Actions: Role toggle, Notification, Dark mode, Profile */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Quick Switch Role Pill */}
            <button
              id="switch-role-header-btn"
              onClick={switchRole}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all border ${
                currentUser.role === 'teacher'
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-950/50 dark:border-indigo-800 dark:text-indigo-300 hover:bg-indigo-100'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/50 dark:border-emerald-800 dark:text-emerald-300 hover:bg-emerald-100'
              }`}
              title="Ganti peran antara Guru dan Siswa"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{currentUser.role === 'teacher' ? 'Guru' : 'Siswa'}</span>
            </button>

            {/* Time Simulation quick modal trigger */}
            <button
              id="time-sim-btn"
              onClick={() => setShowTimeModal(true)}
              className="p-1.5 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Atur Jam & Hari Simulasi KBM"
            >
              <Clock className="w-4 h-4" />
            </button>

            {/* Dark mode toggle */}
            <button
              id="darkmode-toggle-btn"
              onClick={() => setIsDarkMode((prev) => !prev)}
              className="p-1.5 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Ganti Tema Gelap / Terang"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Notification Bell */}
            <button
              id="notification-bell-btn"
              onClick={onOpenNotifications}
              className="relative p-1.5 rounded-xl text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Notifikasi"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifsCount > 0 && (
                <span className="absolute top-0.5 right-0.5 min-w-[15px] h-[15px] px-1 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
                  {unreadNotifsCount}
                </span>
              )}
            </button>

            {/* Profile Avatar / Auth modal */}
            <button
              id="header-user-avatar-btn"
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 pl-0.5 pr-1 py-0.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Akun & Profil"
            >
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                className="w-7 h-7 rounded-full object-cover border border-slate-300 dark:border-slate-600"
              />
            </button>
          </div>
        </div>

        {/* Multi-Class Quick Switcher Strip */}
        <div className="bg-slate-50/90 dark:bg-slate-900/60 border-t border-slate-200/60 dark:border-slate-800/80 px-3 sm:px-4 py-1.5">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 flex-1">
              <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider shrink-0 mr-1 hidden xs:inline">
                Kelas:
              </span>
              {classes.length === 0 ? (
                <span className="text-xs text-slate-400 dark:text-slate-500 italic py-0.5">
                  Belum ada kelas terdaftar. Klik tombol di samping untuk membuat kelas.
                </span>
              ) : (
                classes.map((cls) => {
                  const isActive = activeClass && cls.id === activeClass.id;
                  return (
                    <button
                      key={cls.id}
                      id={`quick-class-tab-${cls.id}`}
                      onClick={() => setActiveClass(cls)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/60'
                      }`}
                    >
                      <span>{cls.name}</span>
                      {isActive && <Check className="w-3 h-3 text-white" />}
                    </button>
                  );
                })
              )}
            </div>

            {/* Quick Add / Join Class Button */}
            <button
              id="quick-add-class-btn"
              onClick={onOpenClassModal}
              className="px-2.5 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 rounded-full border border-indigo-200/80 dark:border-indigo-800 shrink-0 flex items-center gap-1 transition-colors"
              title="Gabung atau Buat Kelas Baru"
            >
              <Plus className="w-3 h-3" />
              <span>{currentUser.role === 'teacher' ? '+ Buat' : '+ Gabung'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Time Simulation Modal */}
      {showTimeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Simulasi Jam KBM
                </h3>
              </div>
              <button
                onClick={() => setShowTimeModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">
              Ubah waktu simulasi untuk menguji status mata pelajaran <b>"Sedang Berlangsung (Live)"</b>, pengingat kelas 15 menit, dan tenggat tugas.
            </p>

            <div className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Hari Sekolah
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 1, label: 'Senin' },
                    { id: 2, label: 'Selasa' },
                    { id: 3, label: 'Rabu' },
                    { id: 4, label: 'Kamis' },
                    { id: 5, label: 'Jumat' },
                    { id: 6, label: 'Sabtu' },
                  ].map((d) => (
                    <button
                      key={d.id}
                      onClick={() => setSimulatedDay(d.id)}
                      className={`py-1.5 text-xs font-medium rounded-lg border transition-all ${
                        simulatedDay === d.id
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                          : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Jam KBM (Pagi s.d Siang)
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { time: '07:15', label: '07:15 (Upacara)' },
                    { time: '08:15', label: '08:15 (Jam Ke-1)' },
                    { time: '10:00', label: '10:00 (Jam Ke-2)' },
                    { time: '11:45', label: '11:45 (Jam Ke-3)' },
                    { time: '13:45', label: '13:45 (Jam Siang)' },
                    { time: '16:00', label: '16:00 (Selesai KBM)' },
                  ].map((t) => (
                    <button
                      key={t.time}
                      onClick={() => setSimulatedTime(t.time)}
                      className={`py-1.5 px-1 text-[11px] font-medium rounded-lg border truncate transition-all ${
                        simulatedTime === t.time
                          ? 'bg-sky-600 border-sky-600 text-white shadow-sm'
                          : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs text-slate-500">Ketik Jam:</span>
                  <input
                    type="time"
                    value={simulatedTime}
                    onChange={(e) => setSimulatedTime(e.target.value)}
                    className="text-xs px-2 py-1 rounded border border-slate-300 dark:border-slate-600 bg-transparent text-slate-800 dark:text-slate-200 font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-700">
              <button
                onClick={() => setShowTimeModal(false)}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md transition-colors"
              >
                Terapkan Waktu Simulasi
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
