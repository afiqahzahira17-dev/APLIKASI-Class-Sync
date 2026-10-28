import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { AVATAR_STUDENT_SVG, AVATAR_TEACHER_SVG } from '../data/mockData';
import {
  GraduationCap,
  ShieldCheck,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Plus,
  X,
  Check,
  Clock,
  Layers,
  UserPlus,
  LogIn,
  KeyRound,
  Moon,
  Sun,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const {
    loginWithCredentials,
    quickLoginAccount,
    registerAccount,
    registeredUsers,
    allClasses,
    witaTimeInfo,
    isDarkMode,
    setIsDarkMode,
  } = useApp();

  // Auth mode: 'login' | 'register'
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [role, setRole] = useState<UserRole>('student');

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regIdNumber, setRegIdNumber] = useState('');
  const [regSchoolName, setRegSchoolName] = useState('MTs');
  const [regAttendanceNumber, setRegAttendanceNumber] = useState<number>(1);
  const [regPhone, setRegPhone] = useState('');

  // Multi-class inputs during registration (supports 2 or more classes right away!)
  const [studentClassCodes, setStudentClassCodes] = useState<string[]>(['', '']);
  const [teacherInitialClasses, setTeacherInitialClasses] = useState<
    { name: string; gradeLevel: string }[]
  >([
    { name: '', gradeLevel: 'Kelas 7' },
    { name: '', gradeLevel: 'Kelas 8' },
  ]);

  const roleFilteredAccounts = registeredUsers.filter((u) => u.role === role);

  const handleSwitchMode = (nextMode: 'login' | 'register') => {
    setMode(nextMode);
    setErrorMessage(null);
  };

  const handleSwitchRole = (nextRole: UserRole) => {
    setRole(nextRole);
    setErrorMessage(null);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    const res = loginWithCredentials(loginIdentifier, loginPassword, role);
    if (!res.success) {
      setErrorMessage(res.message);
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const validCodes = studentClassCodes.map((c) => c.trim()).filter(Boolean);
    const validTeacherClasses = teacherInitialClasses.filter((c) => c.name.trim().length > 0);

    const res = registerAccount({
      name: regName,
      email: regEmail,
      password: regPassword,
      role,
      identifierNumber: regIdNumber,
      schoolName: regSchoolName,
      attendanceNumber: role === 'student' ? regAttendanceNumber : undefined,
      phone: role === 'teacher' ? regPhone : undefined,
      classCodesToJoin: validCodes,
      initialClassesToCreate: role === 'teacher' ? validTeacherClasses : undefined,
    });

    if (!res.success) {
      setErrorMessage(res.message);
    }
  };

  const toggleQuickCodeSelect = (code: string) => {
    const upper = code.toUpperCase();
    setStudentClassCodes((prev) => {
      const exists = prev.some((c) => c.trim().toUpperCase() === upper);
      if (exists) {
        const filtered = prev.filter((c) => c.trim().toUpperCase() !== upper);
        return filtered.length < 2 ? [...filtered, ...Array(2 - filtered.length).fill('')] : filtered;
      }
      const emptyIdx = prev.findIndex((c) => !c.trim());
      if (emptyIdx >= 0) {
        const copy = [...prev];
        copy[emptyIdx] = upper;
        return copy;
      }
      return [...prev, upper];
    });
  };

  return (
    <div className="min-h-screen w-full bg-[#FAF9F5] dark:bg-[#0B1E25] text-[#163E4B] dark:text-[#F2F6F7] grid grid-cols-1 lg:grid-cols-12 items-stretch transition-colors">
      {/* LEFT PANEL: Architectural Deep Petrol Portal Showcase (Distinct from In-App Dashboard) */}
      <aside className="lg:col-span-7 bg-[#123541] dark:bg-[#091A20] text-white relative overflow-hidden flex flex-col justify-between p-6 sm:p-10 lg:p-14 xl:p-16 border-b lg:border-b-0 lg:border-r border-white/10">
        {/* Custom Architectural Geometric SVG Artwork (No cheesy AI slop, clean academic precision) */}
        <svg
          className="pointer-events-none absolute right-0 top-0 w-[440px] h-[440px] opacity-25"
          viewBox="0 0 440 440"
          fill="none"
          aria-hidden="true"
        >
          <circle cx="360" cy="80" r="140" stroke="#FCEADE" strokeWidth="1.5" />
          <circle cx="360" cy="80" r="210" stroke="#F4A950" strokeWidth="1.5" strokeDasharray="6 8" />
          <circle cx="360" cy="80" r="285" stroke="#FFFFFF" strokeOpacity="0.35" strokeWidth="1" />
          <line x1="120" y1="80" x2="440" y2="80" stroke="#F4A950" strokeOpacity="0.4" strokeWidth="1" />
          <line x1="360" y1="0" x2="360" y2="320" stroke="#FCEADE" strokeOpacity="0.3" strokeWidth="1" />
        </svg>

        <div className="pointer-events-none absolute -left-24 -bottom-24 w-80 h-80 rounded-full bg-[#F4A950]/10 blur-3xl" />

        {/* Top Institutional Bar */}
        <div className="relative z-10 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#F4A950] text-[#123541] flex items-center justify-center shadow-lg">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-white block leading-none">
                Classy<span className="text-[#F4A950]">Work</span>
              </span>
              <span className="text-xs text-[#B6CFD7] font-medium mt-1 block">
                Portal Akademik Terpadu Guru & Siswa
              </span>
            </div>
          </div>

          {/* Live WITA Clock Strip */}
          <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-white/[0.07] border border-white/10 text-xs">
            <Clock className="w-4 h-4 text-[#F4A950] shrink-0" />
            <div className="leading-tight">
              <span className="font-mono tabular-nums font-bold text-white block">
                {witaTimeInfo.formattedTimeWithSeconds} WITA
              </span>
              <span className="text-[11px] text-[#B6CFD7] block">
                {witaTimeInfo.formattedDate}
              </span>
            </div>
          </div>
        </div>

        {/* Center Hero Editorial Copy & Architectural Preview */}
        <div className="relative z-10 my-8 lg:my-12 max-w-xl space-y-6">
          <div className="space-y-3">
            <p className="text-xs font-semibold text-[#F4A950] tracking-wide">
              Sistem Manajemen Jadwal, Multi-Kelas & Penilaian Tugas
            </p>
            <h1 className="text-2xl sm:text-4xl xl:text-[42px] font-extrabold tracking-tight text-white leading-[1.15] [text-wrap:balance]">
              Kelola Kegiatan Belajar Mengajar Lebih Terstruktur dalam Satu Akses.
            </h1>
            <p className="text-sm sm:text-base text-[#C4DAE1] leading-relaxed">
              Masuk sebagai <strong className="text-white font-semibold">Guru Pengampu</strong> atau{' '}
              <strong className="text-white font-semibold">Siswa</strong> untuk mengakses jadwal KBM
              Senin–Sabtu secara real-time, tergabung di dua kelas atau lebih sekaligus, serta
              mengelola pengumpulan tugas sesuai urutan absen.
            </p>
          </div>

          {/* Clean Numbered Editorial Pillars (Hidden on very small screens to keep Login form quick to reach, shown sm+) */}
          <div className="hidden sm:grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-white/12">
            <div className="space-y-1">
              <span className="font-mono text-xs font-bold text-[#F4A950] tabular-nums">01.</span>
              <h2 className="text-sm font-bold text-white">Multi-Kelas Fleksibel</h2>
              <p className="text-xs text-[#B2CCD4] leading-relaxed">
                Siswa & guru dapat membuat atau bergabung ke 2 kelas atau lebih sekaligus dalam satu akun.
              </p>
            </div>

            <div className="space-y-1">
              <span className="font-mono text-xs font-bold text-[#F4A950] tabular-nums">02.</span>
              <h2 className="text-sm font-bold text-white">Sinkron Waktu WITA</h2>
              <p className="text-xs text-[#B2CCD4] leading-relaxed">
                Indikator progres mata pelajaran berlangsung otomatis mengikuti jam nyata WITA (UTC+8).
              </p>
            </div>

            <div className="space-y-1">
              <span className="font-mono text-xs font-bold text-[#F4A950] tabular-nums">03.</span>
              <h2 className="text-sm font-bold text-white">Urut Absen & Skor XP</h2>
              <p className="text-xs text-[#B2CCD4] leading-relaxed">
                Rekap pengumpulan tugas terurut rapi berdasarkan nomor absen beserta nilai & poin XP.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Portal Summary Metrics (Clean unboxed typography with separators) */}
        <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between gap-4 flex-wrap text-xs text-[#B6CFD7]">
          <div className="flex items-center gap-2.5 flex-wrap tabular-nums">
            <span>
              <strong className="text-white font-bold">{allClasses.length}</strong> Kelas Terdaftar
            </span>
            <span aria-hidden="true">·</span>
            <span>
              <strong className="text-white font-bold">
                {registeredUsers.filter((u) => u.role === 'teacher').length}
              </strong>{' '}
              Akun Guru
            </span>
            <span aria-hidden="true">·</span>
            <span>
              <strong className="text-white font-bold">
                {registeredUsers.filter((u) => u.role === 'student').length}
              </strong>{' '}
              Akun Siswa
            </span>
          </div>

          <span className="text-[#FCEADE]/80 font-medium">Senin – Sabtu · Zona WITA</span>
        </div>
      </aside>

      {/* RIGHT PANEL: Dedicated Login & Account Creation Studio */}
      <section className="lg:col-span-5 flex flex-col justify-between p-5 sm:p-8 lg:p-10 xl:p-12 overflow-y-auto">
        {/* Top Utility Row */}
        <div className="flex items-center justify-between gap-2 mb-6">
          <span className="text-xs font-semibold text-[#6E828A] dark:text-[#96B2BC]">
            Autentikasi Akun Sekolah & Madrasah
          </span>

          <button
            type="button"
            onClick={() => setIsDarkMode((prev) => !prev)}
            className="min-h-[40px] px-3 py-1.5 rounded-xl border border-[#E4E8E9] dark:border-[#1E4654] bg-white dark:bg-[#132F3A] text-xs font-semibold text-[#163E4B] dark:text-[#E8F1F4] flex items-center gap-1.5 hover:border-[#F4A950] transition-colors cursor-pointer whitespace-nowrap shrink-0"
            title="Ubah Tema Tampilan"
          >
            {isDarkMode ? (
              <>
                <Sun className="w-3.5 h-3.5 text-[#F4A950]" />
                <span>Mode Terang</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-[#163E4B]" />
                <span>Mode Gelap</span>
              </>
            )}
          </button>
        </div>

        {/* Main Auth Container */}
        <div className="w-full max-w-md mx-auto my-auto space-y-5">
          {/* Segmented Mode Control: Masuk Akun vs Buat Akun Baru */}
          <div className="grid grid-cols-2 p-1.5 rounded-2xl bg-[#EFEee9] dark:bg-[#112A34] border border-[#E3E4DE] dark:border-[#1E4654]">
            <button
              type="button"
              onClick={() => handleSwitchMode('login')}
              className={`min-h-[44px] px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                mode === 'login'
                  ? 'bg-[#163E4B] text-white shadow-sm'
                  : 'text-[#5E747D] dark:text-[#9BBAC4] hover:text-[#163E4B] dark:hover:text-white'
              }`}
            >
              <LogIn className="w-4 h-4 text-[#F4A950]" />
              <span>Masuk Akun</span>
            </button>

            <button
              type="button"
              onClick={() => handleSwitchMode('register')}
              className={`min-h-[44px] px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                mode === 'register'
                  ? 'bg-[#163E4B] text-white shadow-sm'
                  : 'text-[#5E747D] dark:text-[#9BBAC4] hover:text-[#163E4B] dark:hover:text-white'
              }`}
            >
              <UserPlus className="w-4 h-4 text-[#F4A950]" />
              <span>Buat Akun Baru</span>
            </button>
          </div>

          {/* Heading */}
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#163E4B] dark:text-white tracking-tight">
              {mode === 'login' ? 'Selamat Datang Kembali' : 'Pendaftaran Akun Baru'}
            </h2>
            <p className="text-xs sm:text-sm text-[#6E828A] dark:text-[#96B2BC] mt-1">
              {mode === 'login'
                ? 'Pilih peran Anda (Siswa atau Guru) lalu masukkan kredensial akun untuk masuk ke portal kelas.'
                : 'Buat akun Guru atau Siswa baru dan langsung gabung atau buat dua kelas maupun lebih.'}
            </p>
          </div>

          {/* Role Selector Cards (Guru vs Siswa) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#163E4B] dark:text-[#DCEBEF] block">
              Pilih Peran Akses
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleSwitchRole('student')}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                  role === 'student'
                    ? 'bg-[#FCEADE] dark:bg-[#F4A950]/18 border-[#F4A950] ring-2 ring-[#F4A950]/25'
                    : 'bg-white dark:bg-[#132F3A] border-[#E4E7E5] dark:border-[#214B59] hover:border-[#163E4B]/40'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    role === 'student'
                      ? 'bg-[#163E4B] text-[#F4A950]'
                      : 'bg-[#F4F5F2] dark:bg-[#0E242D] text-[#6E828A]'
                  }`}
                >
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <span className="font-extrabold text-xs sm:text-sm text-[#163E4B] dark:text-white block">
                    Siswa
                  </span>
                  <span className="text-[11px] text-[#5E747D] dark:text-[#9BBAC4] block leading-snug mt-0.5">
                    Jadwal, multi-kelas & kumpul tugas
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleSwitchRole('teacher')}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                  role === 'teacher'
                    ? 'bg-[#163E4B] border-[#163E4B] text-white ring-2 ring-[#163E4B]/20 dark:ring-[#F4A950]/30'
                    : 'bg-white dark:bg-[#132F3A] border-[#E4E7E5] dark:border-[#214B59] hover:border-[#163E4B]/40'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    role === 'teacher'
                      ? 'bg-[#F4A950] text-[#163E4B]'
                      : 'bg-[#F4F5F2] dark:bg-[#0E242D] text-[#6E828A]'
                  }`}
                >
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <span
                    className={`font-extrabold text-xs sm:text-sm block ${
                      role === 'teacher' ? 'text-white' : 'text-[#163E4B] dark:text-white'
                    }`}
                  >
                    Guru
                  </span>
                  <span
                    className={`text-[11px] block leading-snug mt-0.5 ${
                      role === 'teacher' ? 'text-[#C6DCE3]' : 'text-[#5E747D] dark:text-[#9BBAC4]'
                    }`}
                  >
                    Kelola banyak kelas, jadwal & nilai
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Error Feedback Banner */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed font-medium">{errorMessage}</span>
            </div>
          )}

          {/* ==================== FORM 1: MASUK AKUN (LOGIN) ==================== */}
          {mode === 'login' ? (
            <div className="space-y-5">
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-[#163E4B] dark:text-[#DCEBEF] block mb-1.5">
                    {role === 'teacher' ? 'Email atau NIP Guru *' : 'Email atau NISN Siswa *'}
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#8A9BA2] absolute left-3.5 top-3.5 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      placeholder={
                        role === 'teacher'
                          ? 'Contoh: guru@sekolah.sch.id atau 199501012022032001'
                          : 'Contoh: afiqahzahira17@gmail.com atau 0092837410'
                      }
                      className="w-full min-h-[44px] pl-10 pr-3.5 py-2.5 text-xs sm:text-sm rounded-2xl border border-[#DCE3E6] dark:border-[#245060] bg-white dark:bg-[#132F3A] text-[#163E4B] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#F4A950]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#163E4B] dark:text-[#DCEBEF] block mb-1.5">
                    Kata Sandi *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#8A9BA2] absolute left-3.5 top-3.5 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Masukkan kata sandi akun"
                      className="w-full min-h-[44px] pl-10 pr-11 py-2.5 text-xs sm:text-sm rounded-2xl border border-[#DCE3E6] dark:border-[#245060] bg-white dark:bg-[#132F3A] text-[#163E4B] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#F4A950]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-2.5 top-1.5 min-h-[32px] min-w-[32px] flex items-center justify-center text-[#7A8E96] hover:text-[#163E4B] dark:hover:text-white rounded-lg cursor-pointer"
                      title={showPassword ? 'Sembunyikan Sandi' : 'Tampilkan Sandi'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full min-h-[48px] py-3 px-5 rounded-2xl bg-[#F4A950] hover:bg-[#E59638] text-[#163E4B] font-extrabold text-sm shadow-[0_8px_22px_rgba(244,169,80,0.3)] flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <span>Masuk sebagai {role === 'teacher' ? 'Guru' : 'Siswa'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Quick Saved Accounts Selector for effortless testing of Guru & Siswa */}
              <div className="pt-4 border-t border-[#E6E8E3] dark:border-[#1E4452] space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-[#163E4B] dark:text-[#DCEBEF]">
                    Akun {role === 'teacher' ? 'Guru' : 'Siswa'} Tersedia ({roleFilteredAccounts.length})
                  </span>
                  <button
                    type="button"
                    onClick={() => handleSwitchMode('register')}
                    className="text-xs font-bold text-[#C87A24] dark:text-[#F4A950] hover:underline cursor-pointer"
                  >
                    + Buat Akun {role === 'teacher' ? 'Guru' : 'Siswa'} Baru
                  </button>
                </div>

                <div className="space-y-2 max-h-52 overflow-y-auto pr-0.5">
                  {roleFilteredAccounts.map((acc) => {
                    const fallbackAvatar =
                      acc.role === 'teacher' ? AVATAR_TEACHER_SVG : AVATAR_STUDENT_SVG;
                    const classCount = allClasses.filter(
                      (c) =>
                        (acc.role === 'teacher' && c.teacherId === acc.id) ||
                        (acc.joinedClassIds || []).includes(c.id)
                    ).length;

                    return (
                      <div
                        key={acc.id}
                        className="p-3 rounded-2xl bg-white dark:bg-[#132F3A] border border-[#E4E7E5] dark:border-[#214B59] flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={acc.avatarUrl || fallbackAvatar}
                            alt={acc.name}
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              e.currentTarget.src = fallbackAvatar;
                            }}
                            className="w-9 h-9 rounded-full object-cover border border-[#F4A950]/60 shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-extrabold text-[#163E4B] dark:text-white truncate">
                              {acc.name}
                            </p>
                            <p className="text-[11px] text-[#6E828A] dark:text-[#96B2BC] truncate tabular-nums">
                              {acc.email} · {classCount} Kelas
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setLoginIdentifier(acc.email);
                              setLoginPassword(acc.password || '123');
                            }}
                            className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold text-[#5E747D] dark:text-[#B4CED7] hover:bg-[#F7F7F5] dark:hover:bg-[#193C49] cursor-pointer whitespace-nowrap"
                          >
                            Isi
                          </button>
                          <button
                            type="button"
                            onClick={() => quickLoginAccount(acc.id)}
                            className="px-3 py-1.5 rounded-xl text-[11px] font-extrabold bg-[#163E4B] hover:bg-[#1D4E5E] text-white cursor-pointer whitespace-nowrap"
                          >
                            Masuk
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            /* ==================== FORM 2: BUAT AKUN BARU (REGISTER GURU & SISWA + MULTI-KELAS) ==================== */
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-[#163E4B] dark:text-[#DCEBEF] block mb-1">
                    {role === 'teacher' ? 'Nama Lengkap & Gelar Guru *' : 'Nama Lengkap Siswa *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder={
                      role === 'teacher'
                        ? 'Contoh: Ibu Siti Aminah, S.Pd'
                        : 'Contoh: Nabila Putri Pratama'
                    }
                    className="w-full min-h-[42px] px-3.5 py-2 text-xs rounded-2xl border border-[#DCE3E6] dark:border-[#245060] bg-white dark:bg-[#132F3A] text-[#163E4B] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#F4A950]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#163E4B] dark:text-[#DCEBEF] block mb-1">
                    Alamat Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder={role === 'teacher' ? 'guru.baru@sekolah.sch.id' : 'siswa@sekolah.sch.id'}
                    className="w-full min-h-[42px] px-3.5 py-2 text-xs rounded-2xl border border-[#DCE3E6] dark:border-[#245060] bg-white dark:bg-[#132F3A] text-[#163E4B] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#F4A950]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#163E4B] dark:text-[#DCEBEF] block mb-1">
                    Kata Sandi Baru *
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={3}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Minimal 3 karakter"
                    className="w-full min-h-[42px] px-3.5 py-2 text-xs rounded-2xl border border-[#DCE3E6] dark:border-[#245060] bg-white dark:bg-[#132F3A] text-[#163E4B] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#F4A950]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#163E4B] dark:text-[#DCEBEF] block mb-1">
                    {role === 'teacher' ? 'NIP / ID Pendidik *' : 'NISN Siswa *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={regIdNumber}
                    onChange={(e) => setRegIdNumber(e.target.value)}
                    placeholder={role === 'teacher' ? '198804122015032004' : '0094827165'}
                    className="w-full min-h-[42px] px-3.5 py-2 text-xs font-mono tabular-nums rounded-2xl border border-[#DCE3E6] dark:border-[#245060] bg-white dark:bg-[#132F3A] text-[#163E4B] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#F4A950]"
                  />
                </div>

                {role === 'student' ? (
                  <div>
                    <label className="text-xs font-bold text-[#163E4B] dark:text-[#DCEBEF] block mb-1">
                      Nomor Urut Absen *
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={60}
                      required
                      value={regAttendanceNumber}
                      onChange={(e) =>
                        setRegAttendanceNumber(Math.max(1, parseInt(e.target.value) || 1))
                      }
                      className="w-full min-h-[42px] px-3.5 py-2 text-xs font-mono tabular-nums font-bold rounded-2xl border border-[#DCE3E6] dark:border-[#245060] bg-white dark:bg-[#132F3A] text-[#163E4B] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#F4A950]"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="text-xs font-bold text-[#163E4B] dark:text-[#DCEBEF] block mb-1">
                      No. WhatsApp Guru (Opsional)
                    </label>
                    <input
                      type="tel"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="081234567890"
                      className="w-full min-h-[42px] px-3.5 py-2 text-xs font-mono tabular-nums rounded-2xl border border-[#DCE3E6] dark:border-[#245060] bg-white dark:bg-[#132F3A] text-[#163E4B] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#F4A950]"
                    />
                  </div>
                )}

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-[#163E4B] dark:text-[#DCEBEF] block mb-1">
                    Nama Sekolah / Madrasah
                  </label>
                  <input
                    type="text"
                    value={regSchoolName}
                    onChange={(e) => setRegSchoolName(e.target.value)}
                    placeholder="Contoh: MTs Negeri 1 / SMP Negeri 2"
                    className="w-full min-h-[42px] px-3.5 py-2 text-xs rounded-2xl border border-[#DCE3E6] dark:border-[#245060] bg-white dark:bg-[#132F3A] text-[#163E4B] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#F4A950]"
                  />
                </div>
              </div>

              {/* MULTI-CLASS ONBOARDING SECTION (2+ Classes Support right from Sign-Up!) */}
              {role === 'student' ? (
                <div className="p-3.5 rounded-2xl bg-[#FCEADE]/65 dark:bg-[#132F3A] border border-[#F4D3BA] dark:border-[#245060] space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-[#E59638]" />
                      <span className="text-xs font-extrabold text-[#163E4B] dark:text-white">
                        Gabung Kelas Langsung (Bisa 2 Kelas atau Lebih)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStudentClassCodes((prev) => [...prev, ''])}
                      className="text-[11px] font-extrabold text-[#C87A24] dark:text-[#F4A950] hover:underline flex items-center gap-0.5 cursor-pointer whitespace-nowrap"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Tambah Kode</span>
                    </button>
                  </div>

                  <p className="text-[11px] text-[#5C717A] dark:text-[#A9C4CD] leading-snug">
                    Masukkan 1, 2, atau lebih kode kelas dari guru Anda (opsional, juga dapat ditambahkan nanti di dalam aplikasi).
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {studentClassCodes.map((codeVal, idx) => (
                      <div key={idx} className="relative flex items-center">
                        <KeyRound className="w-3.5 h-3.5 text-[#8A9BA2] absolute left-3 pointer-events-none" />
                        <input
                          type="text"
                          value={codeVal}
                          onChange={(e) => {
                            const val = e.target.value.toUpperCase();
                            setStudentClassCodes((prev) =>
                              prev.map((item, i) => (i === idx ? val : item))
                            );
                          }}
                          placeholder={`Kode Kelas ${idx + 1}`}
                          className="w-full pl-8 pr-7 py-2 text-xs font-mono uppercase rounded-xl border border-[#DCE3E6] dark:border-[#275668] bg-white dark:bg-[#0E242D] text-[#163E4B] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#F4A950]"
                        />
                        {studentClassCodes.length > 2 && (
                          <button
                            type="button"
                            onClick={() =>
                              setStudentClassCodes((prev) => prev.filter((_, i) => i !== idx))
                            }
                            className="absolute right-2 text-[#8A9BA2] hover:text-rose-600 cursor-pointer"
                            title="Hapus kolom"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Quick-pick from existing school classes if Guru has already created classes */}
                  {allClasses.length > 0 && (
                    <div className="pt-1.5 space-y-1.5">
                      <span className="text-[10px] font-bold text-[#6E828A] dark:text-[#96B2BC] block">
                        Kelas tersedia di sekolah (klik untuk memilih 2 kelas atau lebih):
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {allClasses.map((cls) => {
                          const isPicked = studentClassCodes.some(
                            (c) => c.trim().toUpperCase() === cls.code.toUpperCase()
                          );
                          return (
                            <button
                              key={cls.id}
                              type="button"
                              onClick={() => toggleQuickCodeSelect(cls.code)}
                              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border flex items-center gap-1 transition-all cursor-pointer ${
                                isPicked
                                  ? 'bg-[#163E4B] border-[#163E4B] text-white'
                                  : 'bg-white dark:bg-[#0E242D] border-[#DCE3E6] dark:border-[#275668] text-[#163E4B] dark:text-[#DCEBEF]'
                              }`}
                            >
                              {isPicked ? (
                                <Check className="w-3 h-3 text-[#F4A950]" />
                              ) : (
                                <Plus className="w-3 h-3 text-[#E59638]" />
                              )}
                              <span>{cls.name}</span>
                              <span className="font-mono text-[10px] opacity-75">({cls.code})</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-[#FCEADE]/65 dark:bg-[#132F3A] border border-[#F4D3BA] dark:border-[#245060] space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-[#E59638]" />
                      <span className="text-xs font-extrabold text-[#163E4B] dark:text-white">
                        Buat Kelas Awal (Bisa 2 Kelas atau Lebih)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setTeacherInitialClasses((prev) => [
                          ...prev,
                          { name: '', gradeLevel: 'Kelas 7' },
                        ])
                      }
                      className="text-[11px] font-extrabold text-[#C87A24] dark:text-[#F4A950] hover:underline flex items-center gap-0.5 cursor-pointer whitespace-nowrap"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Tambah Kelas</span>
                    </button>
                  </div>

                  <p className="text-[11px] text-[#5C717A] dark:text-[#A9C4CD] leading-snug">
                    Opsional: langsung buat 2 kelas atau lebih yang Anda ampu (misal VII-A & VIII-B), atau kosongkan untuk membuatnya nanti.
                  </p>

                  <div className="space-y-2">
                    {teacherInitialClasses.map((clsItem, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={clsItem.name}
                          onChange={(e) => {
                            const val = e.target.value;
                            setTeacherInitialClasses((prev) =>
                              prev.map((item, i) => (i === idx ? { ...item, name: val } : item))
                            );
                          }}
                          placeholder={`Nama Kelas ${idx + 1} (cth: ${
                            idx === 0 ? 'VII-A Matematika' : 'VIII-B IPA'
                          })`}
                          className="flex-1 px-3 py-2 text-xs rounded-xl border border-[#DCE3E6] dark:border-[#275668] bg-white dark:bg-[#0E242D] text-[#163E4B] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#F4A950]"
                        />
                        <select
                          value={clsItem.gradeLevel}
                          onChange={(e) => {
                            const val = e.target.value;
                            setTeacherInitialClasses((prev) =>
                              prev.map((item, i) =>
                                i === idx ? { ...item, gradeLevel: val } : item
                              )
                            );
                          }}
                          className="px-2.5 py-2 text-xs rounded-xl border border-[#DCE3E6] dark:border-[#275668] bg-white dark:bg-[#0E242D] text-[#163E4B] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#F4A950]"
                        >
                          <option value="Kelas 7">Kelas 7</option>
                          <option value="Kelas 8">Kelas 8</option>
                          <option value="Kelas 9">Kelas 9</option>
                          <option value="Kelas 10">Kelas 10</option>
                          <option value="Kelas 11">Kelas 11</option>
                          <option value="Kelas 12">Kelas 12</option>
                        </select>
                        {teacherInitialClasses.length > 2 && (
                          <button
                            type="button"
                            onClick={() =>
                              setTeacherInitialClasses((prev) => prev.filter((_, i) => i !== idx))
                            }
                            className="p-1.5 text-[#8A9BA2] hover:text-rose-600 cursor-pointer"
                            title="Hapus baris"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full min-h-[48px] py-3 px-5 rounded-2xl bg-[#163E4B] hover:bg-[#1D4E5E] text-white font-extrabold text-sm shadow-[0_10px_24px_rgba(22,62,75,0.2)] flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>Daftar & Masuk sebagai {role === 'teacher' ? 'Guru' : 'Siswa'}</span>
                <ArrowRight className="w-4 h-4 text-[#F4A950]" />
              </button>
            </form>
          )}
        </div>

        {/* Bottom Quiet Footer */}
        <div className="mt-8 pt-4 border-t border-[#EAEBE6] dark:border-[#1B3F4C] flex items-center justify-between text-[11px] text-[#7A8E96] dark:text-[#88A5AF]">
          <span>ClassyWork · Sistem Informasi Kelas</span>
          <span>Mendukung Multi-Akun & Multi-Kelas</span>
        </div>
      </section>
    </div>
  );
};
