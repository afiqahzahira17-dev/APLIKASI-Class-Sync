import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AVATAR_STUDENT_SVG } from '../data/mockData';
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
  Layers,
  LogOut,
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
    activeClass,
    classes,
    setActiveClass,
    isAllClassesView,
    setIsAllClassesView,
    logout,
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
  } = useApp();

  const [showTimeModal, setShowTimeModal] = useState(false);
  const [showGamificationModal, setShowGamificationModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  const unreadNotifsCount = notifications.filter((n) => !n.isRead).length;

  return (
    <>
      <header className="sticky top-0 z-30 bg-[#F7F7F5]/95 dark:bg-[#0E262F]/95 backdrop-blur-md border-b border-[#EAEAE4] dark:border-[#1B4250] transition-colors">
        <div className="max-w-5xl mx-auto px-3 sm:px-4 py-2.5 flex items-center justify-between gap-1.5 sm:gap-2">
          {/* Brand & Active Class Info */}
          <div className="flex items-center gap-2.5 min-w-0 shrink">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-[#163E4B] text-white flex items-center justify-center font-bold shadow-[0_6px_16px_rgba(22,62,75,0.2)] shrink-0 relative">
              <GraduationCap className="w-4 h-4" />
              <span className="w-2 h-2 rounded-full bg-[#F4A950] absolute -top-0.5 -right-0.5 ring-2 ring-[#F7F7F5] dark:ring-[#0E262F]" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1 whitespace-nowrap">
                <span className="font-extrabold text-sm sm:text-base tracking-tight text-[#163E4B] dark:text-white">
                  Classy<span className="text-[#E69D45]">Work</span>
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-[#6E828A] dark:text-[#98B4BE] font-medium truncate max-w-[90px] xs:max-w-[130px] sm:max-w-[210px]">
                {isAllClassesView && classes.length >= 2
                  ? `Semua Kelas (${classes.length})`
                  : activeClass
                  ? activeClass.name
                  : 'Belum Ada Kelas'}
              </p>
            </div>
          </div>

          {/* Right Actions: Role toggle, WITA Clock, XP Info, Theme, Bell, Profile */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {/* Active Role Profile Trigger (Opens User's Own Session Info) */}
            <button
              id="switch-role-header-btn"
              onClick={onOpenAuth}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11px] font-bold transition-all border shrink-0 cursor-pointer whitespace-nowrap ${
                currentUser.role === 'teacher'
                  ? 'bg-[#163E4B] border-[#163E4B] text-white hover:bg-[#10303B] shadow-2xs'
                  : 'bg-[#FCEADE] border-[#F2CFAF] text-[#163E4B] hover:bg-[#F9DFCD] dark:bg-[#1A3F4C] dark:border-[#2C5B6C] dark:text-[#FCEADE]'
              }`}
              title="Informasi Akun Aktif"
            >
              <ShieldCheck className="w-3 h-3 text-[#F4A950]" />
              <span>{currentUser.role === 'teacher' ? 'Guru' : 'Siswa'}</span>
            </button>

            {/* Live WITA Clock Badge */}
            <button
              id="time-sim-btn"
              onClick={() => setShowTimeModal(true)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11px] font-bold transition-all border shrink-0 cursor-pointer whitespace-nowrap ${
                isRealTimeWita
                  ? 'bg-white border-[#E4E7E5] text-[#163E4B] dark:bg-[#143541] dark:border-[#245263] dark:text-[#E8F1F4] hover:border-[#F4A950] shadow-2xs'
                  : 'bg-[#FCEADE] border-[#F4A950] text-[#163E4B] dark:bg-[#2E261B] dark:border-[#F4A950]/60 dark:text-[#F4A950]'
              }`}
              title="Waktu Indonesia Tengah (WITA, UTC+8)"
            >
              <Clock className="w-3 h-3 text-[#F4A950]" />
              <span className="font-mono tabular-nums text-[10px] sm:text-[11px]">
                {witaTimeInfo.formattedTime}
              </span>
              <span className="text-[9px] font-extrabold text-[#E69D45] hidden xs:inline">
                WITA
              </span>
            </button>

            {/* XP Gamification Pill - opens Penjelasan XP Modal */}
            <button
              id="xp-info-header-btn"
              onClick={() => setShowGamificationModal(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11px] font-bold transition-all border border-[#F3D1B4] dark:border-[#F4A950]/40 bg-[#FCEADE] dark:bg-[#243B44] text-[#163E4B] dark:text-[#F4A950] hover:bg-[#F9DFCD] shadow-2xs shrink-0 cursor-pointer whitespace-nowrap"
              title="Klik untuk melihat Penjelasan Sistem XP & Prestasi Belajar"
            >
              <Trophy className="w-3 h-3 text-[#E6983A]" />
              <span className="tabular-nums">{userXp} XP</span>
            </button>

            {/* Privacy Modal trigger */}
            <button
              onClick={() => setShowPrivacyModal(true)}
              className="hidden md:inline-flex p-1.5 rounded-xl text-[#6E828A] hover:text-[#163E4B] dark:text-[#98B4BE] dark:hover:text-white hover:bg-white dark:hover:bg-[#173A47] transition-colors cursor-pointer"
              title="Privasi & Keamanan"
            >
              <Shield className="w-4 h-4 text-[#163E4B] dark:text-[#F4A950]" />
            </button>

            {/* Dark mode toggle */}
            <button
              id="darkmode-toggle-btn"
              onClick={() => setIsDarkMode((prev) => !prev)}
              className="p-1.5 rounded-xl text-[#6E828A] hover:text-[#163E4B] dark:text-[#98B4BE] dark:hover:text-white hover:bg-white dark:hover:bg-[#173A47] transition-colors cursor-pointer"
              title="Ganti Tema Gelap / Terang"
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4 text-[#F4A950]" />
              ) : (
                <Moon className="w-4 h-4 text-[#163E4B]" />
              )}
            </button>

            {/* Notification Bell styled exactly like reference image bell + warm amber dot */}
            <button
              id="notification-bell-btn"
              onClick={onOpenNotifications}
              className="relative p-1.5 rounded-xl text-[#163E4B] dark:text-white hover:bg-white dark:hover:bg-[#173A47] transition-colors cursor-pointer"
              title="Notifikasi"
            >
              <Bell className="w-[18px] h-[18px] fill-[#163E4B] dark:fill-white" />
              {unreadNotifsCount > 0 ? (
                <span className="absolute top-0.5 right-0.5 min-w-[15px] h-[15px] px-0.5 rounded-full bg-[#F4A950] text-white text-[9px] font-extrabold tabular-nums flex items-center justify-center ring-2 ring-[#F7F7F5] dark:ring-[#0E262F]">
                  {unreadNotifsCount}
                </span>
              ) : (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-[#F4A950] ring-2 ring-[#F7F7F5] dark:ring-[#0E262F]" />
              )}
            </button>

            {/* Profile Avatar */}
            <button
              id="header-user-avatar-btn"
              onClick={onOpenAuth}
              className="flex items-center pl-0.5 rounded-full hover:ring-2 hover:ring-[#F4A950] transition-all shrink-0 cursor-pointer"
              title="Akun & Ganti Pengguna"
            >
              <img
                src={currentUser.avatarUrl || AVATAR_STUDENT_SVG}
                alt={currentUser.name}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.src = AVATAR_STUDENT_SVG;
                }}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border-2 border-white dark:border-[#245566] shadow-2xs"
              />
            </button>

            {/* Quick Logout to Dedicated Login Page */}
            <button
              id="header-logout-btn"
              onClick={logout}
              className="p-1.5 rounded-xl text-[#6E828A] hover:text-rose-600 dark:text-[#98B4BE] dark:hover:text-rose-400 hover:bg-white dark:hover:bg-[#173A47] transition-colors cursor-pointer"
              title="Keluar ke Halaman Login"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Multi-Class Quick Switcher Strip (Supports 2+ Classes + Combined Semua Kelas View) */}
        <div className="bg-white/75 dark:bg-[#112C36]/75 border-t border-[#ECECE6] dark:border-[#1B4250] px-3 sm:px-4 py-1.5">
          <div className="max-w-5xl mx-auto flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 flex-1">
              <span className="text-[11px] font-bold text-[#7B8D93] dark:text-[#89A8B2] shrink-0 mr-1 hidden xs:inline">
                Kelas ({classes.length}):
              </span>
              {classes.length === 0 ? (
                <span className="text-xs text-[#7B8D93] dark:text-[#89A8B2] py-0.5">
                  Belum ada kelas terdaftar. Klik tombol di kanan untuk memulai.
                </span>
              ) : (
                <>
                  {classes.length >= 2 && (
                    <button
                      id="quick-class-tab-all"
                      onClick={() => setIsAllClassesView(true)}
                      className={`px-3.5 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                        isAllClassesView
                          ? 'bg-[#163E4B] text-white shadow-[0_4px_12px_rgba(22,62,75,0.2)]'
                          : 'bg-[#FCEADE] dark:bg-[#193D4A] text-[#163E4B] dark:text-[#FCEADE] border border-[#F2CFAF] dark:border-[#2C5B6C] hover:border-[#F4A950]'
                      }`}
                      title="Tampilkan jadwal, tugas, dan agenda gabungan dari semua kelas Anda"
                    >
                      <Layers className="w-3 h-3 text-[#F4A950]" />
                      <span className="tabular-nums">Semua Kelas ({classes.length})</span>
                      {isAllClassesView && <Check className="w-3 h-3 text-[#F4A950]" />}
                    </button>
                  )}

                  {classes.map((cls) => {
                    const isActive = !isAllClassesView && activeClass && cls.id === activeClass.id;
                    return (
                      <button
                        key={cls.id}
                        id={`quick-class-tab-${cls.id}`}
                        onClick={() => setActiveClass(cls)}
                        className={`px-3.5 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                          isActive
                            ? 'bg-[#163E4B] text-white shadow-[0_4px_12px_rgba(22,62,75,0.2)]'
                            : 'bg-white dark:bg-[#163A47] text-[#5C737B] dark:text-[#C5D8DF] border border-[#E6E8E5] dark:border-[#265464] hover:border-[#163E4B]/40'
                        }`}
                      >
                        <span>{cls.name}</span>
                        {isActive && <Check className="w-3 h-3 text-[#F4A950]" />}
                      </button>
                    );
                  })}
                </>
              )}
            </div>

            {/* Quick Add (Teacher) / Join (Student) Button in Warm Honey #F4A950 */}
            <button
              id="quick-add-class-btn"
              onClick={onOpenClassModal}
              className="px-3 py-1 text-xs font-bold text-white bg-[#F4A950] hover:bg-[#E59638] rounded-full shadow-[0_4px_12px_rgba(244,169,80,0.35)] shrink-0 flex items-center gap-1 transition-all cursor-pointer whitespace-nowrap"
              title={
                currentUser.role === 'teacher'
                  ? 'Buat atau Gabung Kelas Baru (Bisa 2+ Kelas)'
                  : 'Gabung ke Kelas Menggunakan Kode (Bisa 2+ Kelas)'
              }
            >
              {currentUser.role === 'teacher' ? (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Kelas</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-3 h-3" />
                  <span>+ Gabung Kelas</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Time & WITA Realtime Modal */}
      {showTimeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0D242C]/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#13313C] rounded-[28px] max-w-md w-full p-5 shadow-2xl border border-[#EAEAE4] dark:border-[#245363] animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0F0EC] dark:border-[#214B59]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-[#FCEADE] text-[#163E4B] flex items-center justify-center">
                  <Clock className="w-4 h-4 text-[#E59638]" />
                </div>
                <div>
                  <h3 className="font-extrabold text-[#163E4B] dark:text-white text-base">
                    Waktu Indonesia Tengah (WITA)
                  </h3>
                  <span className="text-[11px] text-[#7B8D93] dark:text-[#9AB5BE]">
                    Zona Waktu Sekolah (UTC+8)
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowTimeModal(false)}
                className="text-[#7B8D93] hover:text-[#163E4B] dark:hover:text-white text-sm font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Live WITA Clock Display Card in Deep Petrol #163E4B */}
            <div className="mt-4 p-5 rounded-[24px] bg-[#163E4B] text-white shadow-[0_12px_28px_rgba(22,62,75,0.22)] space-y-1.5 relative overflow-hidden">
              <div className="w-28 h-28 rounded-full border-[6px] border-white/[0.06] absolute -right-8 -bottom-8 pointer-events-none" />
              <div className="flex items-center justify-between relative z-10">
                <span className="text-[11px] font-bold text-[#F4A950] flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-[#F4A950]" />
                  Waktu Nyata Resmi
                </span>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white/15 text-white">
                  {witaTimeInfo.timezoneLabel}
                </span>
              </div>

              <div className="text-2xl sm:text-3xl font-extrabold font-mono tabular-nums tracking-tight text-white relative z-10">
                {witaTimeInfo.formattedTimeWithSeconds}
              </div>

              <p className="text-xs font-medium text-[#FCEADE]/90 relative z-10">
                {witaTimeInfo.formattedDate}
              </p>
            </div>

            {/* Real-time vs Manual Mode Toggle */}
            <div className="mt-4 p-3.5 rounded-2xl bg-[#F7F7F5] dark:bg-[#0E262F] border border-[#EAEAE4] dark:border-[#214B59] space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h5 className="font-bold text-xs text-[#163E4B] dark:text-white flex items-center gap-1.5">
                    <span>Sinkronisasi Otomatis Jam WITA</span>
                    {isRealTimeWita && (
                      <span className="text-[10px] text-[#E59638] font-bold">(Aktif)</span>
                    )}
                  </h5>
                  <p className="text-[11px] text-[#7B8D93] dark:text-[#98B4BE] mt-0.5">
                    Mata pelajaran yang sedang berlangsung otomatis mengikuti jam nyata WITA.
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
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 flex items-center gap-1 cursor-pointer ${
                    isRealTimeWita
                      ? 'bg-[#163E4B] text-white shadow-xs'
                      : 'bg-[#E6EAEB] dark:bg-[#1B4250] text-[#163E4B] dark:text-white'
                  }`}
                >
                  {isRealTimeWita ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#F4A950]" />
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
                  className="w-full py-2 px-3 bg-[#FCEADE] text-[#163E4B] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-[#F8DEC9] transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-[#E59638]" />
                  <span>Kembalikan ke Waktu Nyata WITA Sekarang</span>
                </button>
              )}
            </div>

            {/* Manual Simulation Controls */}
            <div className={`mt-3 space-y-3 ${isRealTimeWita ? 'opacity-60 pointer-events-none' : ''}`}>
              <label className="text-xs font-bold text-[#163E4B] dark:text-white block">
                Simulasi Hari KBM Khusus {!isRealTimeWita && '(Mode Manual)'}
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
                    onClick={() => {
                      setIsRealTimeWita(false);
                      setSimulatedDay(d.id);
                    }}
                    className={`py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                      simulatedDay === d.id
                        ? 'bg-[#163E4B] border-[#163E4B] text-white shadow-xs font-bold'
                        : 'border-[#E5E8E6] dark:border-[#245363] text-[#163E4B] dark:text-[#D2E3E8] hover:bg-[#FCEADE]/40'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>

              <div>
                <label className="text-xs font-bold text-[#163E4B] dark:text-white block mb-1.5">
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
                      className={`py-2 px-1 text-[11px] font-semibold rounded-xl border truncate transition-all cursor-pointer tabular-nums ${
                        simulatedTime === t.time
                          ? 'bg-[#F4A950] border-[#F4A950] text-white shadow-xs font-bold'
                          : 'border-[#E5E8E6] dark:border-[#245363] text-[#163E4B] dark:text-[#D2E3E8] hover:bg-[#FCEADE]/40'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-[#F0F0EC] dark:border-[#214B59] flex justify-end">
              <button
                onClick={() => setShowTimeModal(false)}
                className="w-full py-2.5 bg-[#F4A950] hover:bg-[#E59638] text-white rounded-full text-xs font-bold shadow-[0_6px_18px_rgba(244,169,80,0.35)] transition-colors cursor-pointer"
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
