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
  Trophy,
  Shield,
  KeyRound,
  Radio,
  RotateCcw,
  CheckCircle2,
  Info,
  Sparkles,
} from 'lucide-react';
import { GamificationModal } from './GamificationModal';
import { PrivacySettingsModal } from './PrivacySettingsModal';

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
    userXp,
    witaTimeInfo,
    isRealTimeWita,
    setIsRealTimeWita,
    syncToCurrentWitaTime,
    activeLiveClass,
    setActiveTab,
  } = useApp();

  const [showTimeModal, setShowTimeModal] = useState(false);
  const [showGamificationModal, setShowGamificationModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  const unreadNotifsCount = notifications.filter((n) => !n.isRead).length;

  const dayNames = ['', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
        <div className="max-w-5xl mx-auto px-2.5 sm:px-4 py-2 flex items-center justify-between gap-1.5 sm:gap-2">
          {/* Brand & Active Class Info */}
          <div className="flex items-center gap-2 min-w-0 shrink">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
              <GraduationCap className="w-4 h-4" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <span className="font-extrabold text-xs sm:text-sm tracking-tight text-slate-900 dark:text-white">
                  ClassyWork
                </span>
                <span className="text-[9px] font-semibold px-1 py-0.2 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hidden xs:inline">
                  Madrasah
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[85px] xs:max-w-[120px] sm:max-w-[200px]">
                {activeClass ? `${activeClass.name}` : 'Belum Ada Kelas'}
              </p>
            </div>
          </div>

          {/* Right Actions: Role toggle, WITA Clock, XP Info, Theme, Bell, Profile */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {/* Quick Switch Role Pill */}
            <button
              id="switch-role-header-btn"
              onClick={switchRole}
              className={`flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-bold transition-all border shrink-0 cursor-pointer ${
                currentUser.role === 'teacher'
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-950/50 dark:border-indigo-800 dark:text-indigo-300 hover:bg-indigo-100'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/50 dark:border-emerald-800 dark:text-emerald-300 hover:bg-emerald-100'
              }`}
              title="Ganti peran antara Guru dan Siswa"
            >
              <ShieldCheck className="w-3 h-3" />
              <span>{currentUser.role === 'teacher' ? 'Guru' : 'Siswa'}</span>
            </button>

            {/* Live WITA Clock Badge */}
            <button
              id="time-sim-btn"
              onClick={() => setShowTimeModal(true)}
              className={`flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-bold transition-all border shrink-0 cursor-pointer ${
                isRealTimeWita
                  ? 'bg-sky-50 border-sky-200 text-sky-700 dark:bg-sky-950/50 dark:border-sky-800 dark:text-sky-300 hover:bg-sky-100 shadow-2xs'
                  : 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/50 dark:border-amber-800 dark:text-amber-300 hover:bg-amber-100'
              }`}
              title="Waktu Indonesia Tengah (WITA, UTC+8)"
            >
              <Radio
                className={`w-2.5 h-2.5 ${isRealTimeWita ? 'text-sky-600 animate-pulse' : 'text-amber-600'}`}
              />
              <span className="font-mono text-[10px] sm:text-[11px]">
                {witaTimeInfo.formattedTime}
              </span>
              <span className="text-[9px] uppercase tracking-wider text-sky-600 dark:text-sky-400 font-extrabold hidden xs:inline">
                WITA
              </span>
            </button>

            {/* XP Gamification Pill - opens Penjelasan XP Modal */}
            <button
              id="xp-info-header-btn"
              onClick={() => setShowGamificationModal(true)}
              className="flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-bold transition-all border border-amber-200 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/40 shadow-2xs shrink-0 cursor-pointer"
              title="Klik untuk melihat Penjelasan Sistem XP & Prestasi Belajar"
            >
              <Trophy className="w-3 h-3 text-amber-500" />
              <span>{userXp} XP</span>
            </button>

            {/* Privacy Modal trigger (Hidden on tiny screens to avoid crowding) */}
            <button
              onClick={() => setShowPrivacyModal(true)}
              className="hidden md:inline-flex p-1.5 rounded-xl text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Privasi & Keamanan"
            >
              <Shield className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            </button>

            {/* Dark mode toggle */}
            <button
              id="darkmode-toggle-btn"
              onClick={() => setIsDarkMode((prev) => !prev)}
              className="p-1 sm:p-1.5 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Ganti Tema Gelap / Terang"
            >
              {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5" />}
            </button>

            {/* Notification Bell */}
            <button
              id="notification-bell-btn"
              onClick={onOpenNotifications}
              className="relative p-1 sm:p-1.5 rounded-xl text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Notifikasi"
            >
              <Bell className="w-3.5 h-3.5" />
              {unreadNotifsCount > 0 && (
                <span className="absolute top-0 right-0 min-w-[14px] h-[14px] px-0.5 rounded-full bg-rose-500 text-white text-[8px] font-bold flex items-center justify-center">
                  {unreadNotifsCount}
                </span>
              )}
            </button>

            {/* Profile Avatar */}
            <button
              id="header-user-avatar-btn"
              onClick={onOpenAuth}
              className="flex items-center pl-0.5 rounded-full hover:ring-2 hover:ring-indigo-400 transition-all shrink-0 cursor-pointer"
              title="Akun & Profil"
            >
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                className="w-6 h-6 sm:w-7 sm:h-7 rounded-full object-cover border border-slate-300 dark:border-slate-600"
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

            {/* Quick Add (Teacher) / Join (Student) Button */}
            <button
              id="quick-add-class-btn"
              onClick={onOpenClassModal}
              className="px-2.5 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 rounded-full border border-indigo-200/80 dark:border-indigo-800 shrink-0 flex items-center gap-1 transition-colors"
              title={currentUser.role === 'teacher' ? 'Buat Kelas Baru' : 'Gabung ke Kelas Menggunakan Kode'}
            >
              {currentUser.role === 'teacher' ? (
                <>
                  <Plus className="w-3 h-3" />
                  <span>+ Buat</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-3 h-3" />
                  <span>+ Gabung</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Time & WITA Realtime Modal */}
      {showTimeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-sky-600" />
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    Waktu Indonesia Tengah (WITA)
                  </h3>
                  <span className="text-[10px] text-slate-400">Zona Waktu Sekolah (UTC+8)</span>
                </div>
              </div>
              <button
                onClick={() => setShowTimeModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Live WITA Clock Display Card */}
            <div className="mt-4 p-4 rounded-xl bg-gradient-to-br from-sky-600 to-indigo-700 text-white shadow-md space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-sky-200 flex items-center gap-1">
                  <Radio className="w-3 h-3 text-emerald-300 animate-pulse" />
                  WAKTU NYATA RESMI
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20">
                  {witaTimeInfo.timezoneLabel}
                </span>
              </div>

              <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-white drop-shadow-xs">
                {witaTimeInfo.formattedTimeWithSeconds}
              </div>

              <p className="text-xs font-semibold text-sky-100">
                {witaTimeInfo.formattedDate}
              </p>
            </div>

            {/* Real-time vs Manual Mode Toggle */}
            <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>Sinkronisasi Otomatis Jam WITA</span>
                    {isRealTimeWita && (
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                        (Aktif ✅)
                      </span>
                    )}
                  </h5>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Mata pelajaran yang sedang berlangsung akan otomatis menyala mengikuti jam dinding nyata WITA.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (!isRealTimeWita) {
                      syncToCurrentWitaTime();
                    } else {
                      setIsRealTimeWita(false);
                    }
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1 cursor-pointer ${
                    isRealTimeWita
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {isRealTimeWita ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Aktif</span>
                    </>
                  ) : (
                    <span>Manual</span>
                  )}
                </button>
              </div>

              {!isRealTimeWita && (
                <button
                  onClick={syncToCurrentWitaTime}
                  className="w-full py-1.5 px-3 bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-sky-200 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Kembalikan ke Waktu Nyata WITA Sekarang</span>
                </button>
              )}
            </div>

            {/* Manual Simulation Controls (if user wants to test other hours) */}
            <div className={`mt-3 space-y-3 ${isRealTimeWita ? 'opacity-60 pointer-events-none' : ''}`}>
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                  Simulasi Hari KBM Khusus {!isRealTimeWita && '(Mode Manual)'}
                </label>
              </div>

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
                    onClick={() => {
                      setIsRealTimeWita(false);
                      setSimulatedDay(d.id);
                    }}
                    className={`py-1.5 text-xs font-medium rounded-lg border transition-all ${
                      simulatedDay === d.id
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm font-bold'
                        : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Pilih Jam Uji KBM (WITA)
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { time: '07:15', label: '07:15 (Pagi)' },
                    { time: '08:15', label: '08:15 (Mapel 1)' },
                    { time: '10:00', label: '10:00 (Mapel 2)' },
                    { time: '11:45', label: '11:45 (Siang)' },
                    { time: '13:45', label: '13:45 (Mapel 3)' },
                    { time: '15:30', label: '15:30 (Selesai)' },
                  ].map((t) => (
                    <button
                      key={t.time}
                      onClick={() => {
                        setIsRealTimeWita(false);
                        setSimulatedTime(t.time);
                      }}
                      className={`py-1.5 px-1 text-[11px] font-medium rounded-lg border truncate transition-all ${
                        simulatedTime === t.time
                          ? 'bg-sky-600 border-sky-600 text-white shadow-sm font-bold'
                          : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-2">
              <button
                onClick={() => setShowTimeModal(false)}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors"
              >
                Selesai & Tutup
              </button>
            </div>
          </div>
        </div>
      )}



      {/* Gamification & Badges Modal */}
      <GamificationModal
        isOpen={showGamificationModal}
        onClose={() => setShowGamificationModal(false)}
      />

      {/* Transparent Privacy & Security Settings Modal */}
      <PrivacySettingsModal
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
      />
    </>
  );
};
