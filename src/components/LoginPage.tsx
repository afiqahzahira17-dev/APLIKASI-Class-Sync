import React, { useState, useEffect } from 'react';
import { useApp, getPortalRoleFromUrl } from '../context/AppContext';
import { UserRole } from '../types';
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
  Link2,
  BookOpen,
  Hash,
} from 'lucide-react';

const getInitialModeFromUrl = (): 'login' | 'register' => {
  if (typeof window === 'undefined') return 'login';
  const path = window.location.pathname.toLowerCase();
  const params = new URLSearchParams(window.location.search);
  const hash = window.location.hash.toLowerCase();
  if (
    path === '/register' ||
    path === '/daftar' ||
    path === '/daftar-siswa' ||
    path === '/daftar-guru' ||
    params.get('page') === 'register' ||
    params.get('page') === 'daftar' ||
    params.get('mode') === 'register' ||
    params.get('mode') === 'daftar' ||
    hash === '#register' ||
    hash === '#daftar'
  ) {
    return 'register';
  }
  return 'login';
};

const getLoginCodesFromUrl = (): string[] => {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const codeParam = params.get('code');
    if (codeParam) {
      const codes = codeParam
        .split(',')
        .map((c) => c.trim().toUpperCase())
        .filter(Boolean);
      if (codes.length > 0) return codes;
    }
  }
  return [''];
};

const getRegisterCodesFromUrl = (): string[] => {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const codeParam = params.get('code');
    if (codeParam) {
      const codes = codeParam
        .split(',')
        .map((c) => c.trim().toUpperCase())
        .filter(Boolean);
      return codes.length >= 2 ? codes : [...codes, ''];
    }
  }
  return ['', ''];
};

/* ============================================================================
 * 1. PORTAL LOGIN KHUSUS SISWA (/?portal=siswa)
 *    - Masuk & Pendaftaran Siswa cukup menggunakan NIS (tanpa email)
 *    - Kata sandi awal default "0000" saat pertama kali masuk (dapat diedit)
 *    - Langsung isi NIS + Kode Kelas pada saat masuk
 * ============================================================================ */
const StudentLoginPortal: React.FC = () => {
  const { loginWithCredentials, registerAccount, witaTimeInfo, isDarkMode, setIsDarkMode } =
    useApp();

  const [mode, setMode] = useState<'login' | 'register'>(getInitialModeFromUrl);
  const [copiedLink, setCopiedLink] = useState(false);

  // Login form state (NIS + Kata Sandi default "0000" editable + Kode Kelas)
  const [nisInput, setNisInput] = useState('');
  const [loginPassword, setLoginPassword] = useState('0000');
  const [showPassword, setShowPassword] = useState(false);
  const [loginClassCodes, setLoginClassCodes] = useState<string[]>(getLoginCodesFromUrl);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Register form state (Hanya menggunakan NIS, tanpa Email, sandi default "0000" editable)
  const [regNis, setRegNis] = useState('');
  const [regName, setRegName] = useState('');
  const [regAttendanceNumber, setRegAttendanceNumber] = useState<number>(33);
  const [regPassword, setRegPassword] = useState('0000');
  const [studentClassCodes, setStudentClassCodes] = useState<string[]>(getRegisterCodesFromUrl);

  const handleCopyStudentLink = () => {
    const url = `${window.location.origin}/?portal=siswa`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    const validCodes = loginClassCodes.map((c) => c.trim()).filter(Boolean);
    const res = loginWithCredentials(nisInput, loginPassword, 'student', validCodes);
    if (!res.success) {
      setErrorMessage(res.message);
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    const validCodes = studentClassCodes.map((c) => c.trim()).filter(Boolean);
    const res = registerAccount({
      name: regName,
      password: regPassword,
      role: 'student',
      identifierNumber: regNis,
      attendanceNumber: regAttendanceNumber,
      classCodesToJoin: validCodes,
    });
    if (!res.success) {
      setErrorMessage(res.message);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#FAF7F2] dark:bg-[#0B1D24] text-[#163E4B] dark:text-[#F2F6F7] flex flex-col justify-between px-4 py-6 sm:px-6 sm:py-10 relative overflow-x-hidden transition-colors">
      {/* Subtle Warm Sunrise Ambient Glow */}
      <div className="pointer-events-none fixed -top-28 left-1/2 -translate-x-1/2 w-[520px] h-[260px] rounded-full bg-[#FCEADE]/80 dark:bg-[#F4A950]/10 blur-3xl" />

      {/* Top Compact Bar */}
      <header className="relative z-10 w-full max-w-[500px] mx-auto flex items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-2xl bg-[#F4A950] text-[#163E4B] flex items-center justify-center shrink-0">
            <GraduationCap className="w-5 h-5" />
          </div>
          <span className="text-base sm:text-lg font-extrabold tracking-tight text-[#163E4B] dark:text-white whitespace-nowrap">
            Classy<span className="text-[#E59638]">Work</span>
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleCopyStudentLink}
            className="min-h-[40px] px-3 py-1.5 rounded-xl border border-[#E8DEC8] dark:border-[#1F4654] bg-white dark:bg-[#122D37] text-xs font-semibold text-[#163E4B] dark:text-[#E8F1F4] flex items-center gap-1.5 hover:border-[#F4A950] transition-colors cursor-pointer whitespace-nowrap"
            title="Salin tautan khusus halaman login siswa"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Tersalin</span>
              </>
            ) : (
              <>
                <Link2 className="w-3.5 h-3.5 text-[#E59638]" />
                <span>Link Siswa</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setIsDarkMode((prev) => !prev)}
            className="min-h-[40px] min-w-[40px] px-2.5 py-1.5 rounded-xl border border-[#E8DEC8] dark:border-[#1F4654] bg-white dark:bg-[#122D37] text-xs font-semibold text-[#163E4B] dark:text-[#E8F1F4] flex items-center justify-center hover:border-[#F4A950] transition-colors cursor-pointer"
            title="Ubah Tema Tampilan"
          >
            {isDarkMode ? (
              <Sun className="w-4 h-4 text-[#F4A950]" />
            ) : (
              <Moon className="w-4 h-4 text-[#163E4B]" />
            )}
          </button>
        </div>
      </header>

      {/* Centered Student Card */}
      <main className="relative z-10 w-full max-w-[500px] mx-auto my-auto">
        <div className="rounded-[28px] bg-white dark:bg-[#122D37] border border-[#EDE3D5] dark:border-[#1F4654] shadow-[0_14px_38px_rgba(22,62,75,0.07)] overflow-hidden">
          {/* Warm Peach Student Header */}
          <div className="bg-[#FCEADE] dark:bg-[#183B48] px-6 py-5 sm:px-7 sm:py-6 border-b border-[#F3D8C1] dark:border-[#245060] relative overflow-hidden">
            <svg
              className="pointer-events-none absolute -right-8 -top-8 w-36 h-36 opacity-35"
              viewBox="0 0 160 160"
              fill="none"
              aria-hidden="true"
            >
              <circle cx="110" cy="50" r="52" stroke="#F4A950" strokeWidth="2" />
              <circle
                cx="110"
                cy="50"
                r="76"
                stroke="#163E4B"
                strokeOpacity="0.18"
                strokeWidth="1.5"
                strokeDasharray="5 6"
              />
            </svg>

            <div className="relative z-10 flex items-center justify-between gap-2 text-xs text-[#7A562C] dark:text-[#F4A950] font-semibold mb-2">
              <span>Portal Belajar Siswa</span>
              <span className="font-mono tabular-nums flex items-center gap-1 text-[#163E4B] dark:text-[#FCEADE]">
                <Clock className="w-3.5 h-3.5 text-[#E59638]" />
                {witaTimeInfo.formattedTime} WITA
              </span>
            </div>

            <h1 className="relative z-10 text-xl sm:text-2xl font-extrabold tracking-tight text-[#163E4B] dark:text-white [text-wrap:balance]">
              {mode === 'login' ? 'Masuk dengan NIS & Kode Kelas' : 'Daftar Siswa Baru (NIS)'}
            </h1>
            <p className="relative z-10 text-xs sm:text-sm text-[#4F6872] dark:text-[#BDD4DC] mt-1 leading-relaxed">
              {mode === 'login'
                ? 'Cukup ketik NIS Anda dan masukkan kode kelas dari guru. Sandi awal pertama kali masuk adalah 0000 dan dapat diubah setelah masuk.'
                : 'Khusus siswa yang belum terdaftar di presensi: cukup daftar menggunakan NIS dan kata sandi pilihan Anda.'}
            </p>
          </div>

          {/* Form Body */}
          <div className="p-6 sm:p-7 space-y-5">
            {/* Segmented Mode Control */}
            <div className="grid grid-cols-2 p-1 rounded-2xl bg-[#F7F3EC] dark:bg-[#0D222A] border border-[#ECE4D8] dark:border-[#1E4452]">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMessage(null);
                }}
                className={`min-h-[42px] px-3 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                  mode === 'login'
                    ? 'bg-[#F4A950] text-[#163E4B]'
                    : 'text-[#5E747D] dark:text-[#9BBAC4] hover:text-[#163E4B] dark:hover:text-white'
                }`}
              >
                <LogIn className="w-4 h-4" />
                <span>Masuk Siswa</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setErrorMessage(null);
                }}
                className={`min-h-[42px] px-3 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                  mode === 'register'
                    ? 'bg-[#F4A950] text-[#163E4B]'
                    : 'text-[#5E747D] dark:text-[#9BBAC4] hover:text-[#163E4B] dark:hover:text-white'
                }`}
              >
                <UserPlus className="w-4 h-4" />
                <span>Daftar NIS Baru</span>
              </button>
            </div>

            {errorMessage && (
              <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed font-medium">{errorMessage}</span>
              </div>
            )}

            {mode === 'login' ? (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {/* 1. NIS Siswa */}
                <div>
                  <label className="text-xs font-bold text-[#163E4B] dark:text-[#DCEBEF] block mb-1.5">
                    Nomor Induk Siswa (NIS) *
                  </label>
                  <div className="relative">
                    <Hash className="w-4 h-4 text-[#8A9BA2] absolute left-3.5 top-3.5 pointer-events-none" />
                    <input
                      type="text"
                      inputMode="numeric"
                      required
                      value={nisInput}
                      onChange={(e) => setNisInput(e.target.value)}
                      placeholder="Masukkan NIS Anda (10 digit)"
                      className="w-full min-h-[44px] pl-10 pr-3.5 py-2.5 text-xs sm:text-sm font-mono tabular-nums rounded-2xl border border-[#E2DDD4] dark:border-[#245060] bg-[#FCFBF9] dark:bg-[#0E242D] text-[#163E4B] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#F4A950]"
                    />
                  </div>
                </div>

                {/* 2. Kata Sandi (Default 0000 saat pertama masuk, editable) */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <label className="text-xs font-bold text-[#163E4B] dark:text-[#DCEBEF]">
                      Kata Sandi *
                    </label>
                    <span className="text-[11px] font-medium text-[#7A562C] dark:text-[#F4A950]">
                      Sandi awal: <strong className="font-mono">0000</strong>
                    </span>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#8A9BA2] absolute left-3.5 top-3.5 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Default 0000 (atau sandi baru Anda)"
                      className="w-full min-h-[44px] pl-10 pr-11 py-2.5 text-xs sm:text-sm font-mono tabular-nums rounded-2xl border border-[#E2DDD4] dark:border-[#245060] bg-[#FCFBF9] dark:bg-[#0E242D] text-[#163E4B] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#F4A950]"
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
                  <p className="text-[11px] text-[#6E828A] dark:text-[#9AB5BE] mt-1">
                    Biarkan <span className="font-mono font-bold">0000</span> saat pertama kali masuk. Kata sandi dapat diubah di menu profil setelah masuk.
                  </p>
                </div>

                {/* 3. Kode Kelas langsung saat masuk (Bisa 1, 2, atau lebih kode kelas) */}
                <div className="p-3.5 rounded-2xl bg-[#FCEADE]/55 dark:bg-[#0E242D] border border-[#F2D5BB] dark:border-[#245060] space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <KeyRound className="w-4 h-4 text-[#E59638]" />
                      <span className="text-xs font-extrabold text-[#163E4B] dark:text-white">
                        Masukkan Kode Kelas
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setLoginClassCodes((prev) => [...prev, ''])}
                      className="text-[11px] font-extrabold text-[#C87A24] dark:text-[#F4A950] hover:underline flex items-center gap-0.5 cursor-pointer whitespace-nowrap"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Tambah Kode Kelas</span>
                    </button>
                  </div>

                  <p className="text-[11px] text-[#5C717A] dark:text-[#A9C4CD] leading-snug">
                    Ketik kode kelas dari guru Anda untuk langsung masuk ke kelas (kosongkan jika sebelumnya sudah tergabung).
                  </p>

                  <div className="space-y-2">
                    {loginClassCodes.map((codeVal, idx) => (
                      <div key={idx} className="relative flex items-center">
                        <KeyRound className="w-3.5 h-3.5 text-[#8A9BA2] absolute left-3 pointer-events-none" />
                        <input
                          type="text"
                          value={codeVal}
                          onChange={(e) => {
                            const val = e.target.value.toUpperCase();
                            setLoginClassCodes((prev) =>
                              prev.map((item, i) => (i === idx ? val : item))
                            );
                          }}
                          placeholder={
                            loginClassCodes.length === 1
                              ? 'Kode Kelas dari Guru (cth: IX-A-123)'
                              : `Kode Kelas ${idx + 1}`
                          }
                          className="w-full min-h-[42px] pl-9 pr-8 py-2 text-xs font-mono uppercase tracking-wider rounded-xl border border-[#E2DDD4] dark:border-[#275668] bg-white dark:bg-[#122D37] text-[#163E4B] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#F4A950]"
                        />
                        {loginClassCodes.length > 1 && (
                          <button
                            type="button"
                            onClick={() =>
                              setLoginClassCodes((prev) => prev.filter((_, i) => i !== idx))
                            }
                            className="absolute right-2.5 text-[#8A9BA2] hover:text-rose-600 cursor-pointer"
                            title="Hapus kolom kode"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full min-h-[48px] py-3 px-5 rounded-2xl bg-[#F4A950] hover:bg-[#E59638] text-[#163E4B] font-extrabold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <span>Masuk ke Ruang Siswa</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              /* Pendaftaran Siswa Baru Hanya dengan NIS (Tanpa Email) */
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-[#163E4B] dark:text-[#DCEBEF] block mb-1">
                      Nomor Induk Siswa (NIS) *
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      required
                      value={regNis}
                      onChange={(e) => setRegNis(e.target.value)}
                      placeholder="Masukkan NIS Siswa"
                      className="w-full min-h-[42px] px-3.5 py-2 text-xs font-mono tabular-nums rounded-2xl border border-[#E2DDD4] dark:border-[#245060] bg-[#FCFBF9] dark:bg-[#0E242D] text-[#163E4B] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#F4A950]"
                    />
                  </div>

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
                      className="w-full min-h-[42px] px-3.5 py-2 text-xs font-mono tabular-nums font-bold rounded-2xl border border-[#E2DDD4] dark:border-[#245060] bg-[#FCFBF9] dark:bg-[#0E242D] text-[#163E4B] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#F4A950]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold text-[#163E4B] dark:text-[#DCEBEF] block mb-1">
                      Nama Lengkap Siswa *
                    </label>
                    <input
                      type="text"
                      required
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="Masukkan nama lengkap sesuai absen"
                      className="w-full min-h-[42px] px-3.5 py-2 text-xs rounded-2xl border border-[#E2DDD4] dark:border-[#245060] bg-[#FCFBF9] dark:bg-[#0E242D] text-[#163E4B] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#F4A950]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <label className="text-xs font-bold text-[#163E4B] dark:text-[#DCEBEF]">
                        Kata Sandi Siswa (Dapat Diedit) *
                      </label>
                      <span className="text-[11px] text-[#7A562C] dark:text-[#F4A950]">
                        Default: <strong className="font-mono">0000</strong>
                      </span>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-[#8A9BA2] absolute left-3.5 top-3 pointer-events-none" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        minLength={3}
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="0000 atau ketik kata sandi pilihan Anda"
                        className="w-full min-h-[42px] pl-10 pr-11 py-2 text-xs font-mono tabular-nums rounded-2xl border border-[#E2DDD4] dark:border-[#245060] bg-[#FCFBF9] dark:bg-[#0E242D] text-[#163E4B] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#F4A950]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-2.5 top-1 min-h-[32px] min-w-[32px] flex items-center justify-center text-[#7A8E96] hover:text-[#163E4B] dark:hover:text-white rounded-lg cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Manual Multi-Class Code Input Only */}
                <div className="p-3.5 rounded-2xl bg-[#FCEADE]/55 dark:bg-[#0E242D] border border-[#F2D5BB] dark:border-[#245060] space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-[#E59638]" />
                      <span className="text-xs font-extrabold text-[#163E4B] dark:text-white">
                        Kode Kelas (Bisa 2 Kelas atau Lebih)
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
                          className="w-full pl-8 pr-7 py-2 text-xs font-mono uppercase rounded-xl border border-[#E2DDD4] dark:border-[#275668] bg-white dark:bg-[#122D37] text-[#163E4B] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#F4A950]"
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
                </div>

                <button
                  type="submit"
                  className="w-full min-h-[48px] py-3 px-5 rounded-2xl bg-[#F4A950] hover:bg-[#E59638] text-[#163E4B] font-extrabold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <span>Daftar dengan NIS & Masuk</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      {/* Quiet Footer */}
      <footer className="relative z-10 w-full max-w-[500px] mx-auto mt-6 flex items-center justify-between gap-2 text-[11px] text-[#7A8E96] dark:text-[#7E9EA9]">
        <span>ClassyWork · Portal Khusus Siswa</span>
        <span>Senin – Sabtu · WITA</span>
      </footer>
    </div>
  );
};

/* ============================================================================
 * 2. PORTAL LOGIN KHUSUS GURU (/?portal=guru)
 *    Desain: Executive Deep Petrol Educator Console (#ECF2F4 cool slate canvas,
 *    2-column console card dengan #0F2E3A educator sidebar & #163E4B executive CTA)
 * ============================================================================ */
const TeacherLoginPortal: React.FC = () => {
  const { loginWithCredentials, registerAccount, witaTimeInfo, isDarkMode, setIsDarkMode } =
    useApp();

  const [mode, setMode] = useState<'login' | 'register'>(getInitialModeFromUrl);
  const [copiedLink, setCopiedLink] = useState(false);

  // Login form state
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regNip, setRegNip] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regSchoolName, setRegSchoolName] = useState('');
  const [teacherInitialClasses, setTeacherInitialClasses] = useState<
    { name: string; gradeLevel: string }[]
  >([
    { name: '', gradeLevel: 'Kelas 9' },
    { name: '', gradeLevel: 'Kelas 9' },
  ]);

  const handleCopyTeacherLink = () => {
    const url = `${window.location.origin}/?portal=guru`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    const res = loginWithCredentials(identifier, password, 'teacher');
    if (!res.success) {
      setErrorMessage(res.message);
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    const validTeacherClasses = teacherInitialClasses.filter((c) => c.name.trim().length > 0);
    const res = registerAccount({
      name: regName,
      email: regEmail,
      password: regPassword,
      role: 'teacher',
      identifierNumber: regNip,
      schoolName: regSchoolName || 'MTs / SMP',
      phone: regPhone,
      initialClassesToCreate: validTeacherClasses,
    });
    if (!res.success) {
      setErrorMessage(res.message);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#ECF2F4] dark:bg-[#07151B] text-[#123541] dark:text-[#F2F6F7] flex flex-col justify-between px-4 py-6 sm:px-6 sm:py-10 transition-colors">
      {/* Top Educator Utility Bar */}
      <header className="w-full max-w-[880px] mx-auto flex items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-[#0F2E3A] text-[#F4A950] flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <span className="text-base sm:text-lg font-extrabold tracking-tight text-[#0F2E3A] dark:text-white whitespace-nowrap">
            ClassyWork{' '}
            <span className="font-semibold text-[#4B6B76] dark:text-[#96B8C4]">Pendidik</span>
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleCopyTeacherLink}
            className="min-h-[40px] px-3 py-1.5 rounded-xl border border-[#CFDCE1] dark:border-[#1E4452] bg-white dark:bg-[#0F2731] text-xs font-semibold text-[#0F2E3A] dark:text-[#E8F1F4] flex items-center gap-1.5 hover:border-[#163E4B] dark:hover:border-[#F4A950] transition-colors cursor-pointer whitespace-nowrap"
            title="Salin tautan khusus halaman login guru"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Tersalin</span>
              </>
            ) : (
              <>
                <Link2 className="w-3.5 h-3.5 text-[#163E4B] dark:text-[#F4A950]" />
                <span>Link Guru</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setIsDarkMode((prev) => !prev)}
            className="min-h-[40px] min-w-[40px] px-2.5 py-1.5 rounded-xl border border-[#CFDCE1] dark:border-[#1E4452] bg-white dark:bg-[#0F2731] text-xs font-semibold text-[#0F2E3A] dark:text-[#E8F1F4] flex items-center justify-center hover:border-[#163E4B] dark:hover:border-[#F4A950] transition-colors cursor-pointer"
            title="Ubah Tema Tampilan"
          >
            {isDarkMode ? (
              <Sun className="w-4 h-4 text-[#F4A950]" />
            ) : (
              <Moon className="w-4 h-4 text-[#0F2E3A]" />
            )}
          </button>
        </div>
      </header>

      {/* 2-Column Executive Educator Console Card */}
      <main className="w-full max-w-[880px] mx-auto my-auto">
        <div className="rounded-[28px] bg-white dark:bg-[#0F2731] border border-[#CFDCE1] dark:border-[#1E4452] shadow-[0_18px_48px_rgba(15,46,58,0.10)] grid grid-cols-1 lg:grid-cols-12 items-stretch overflow-hidden">
          {/* Left Identity Panel */}
          <div className="lg:col-span-5 bg-[#0F2E3A] dark:bg-[#091D25] text-white p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden">
            <svg
              className="pointer-events-none absolute right-0 bottom-0 w-56 h-56 opacity-20"
              viewBox="0 0 220 220"
              fill="none"
              aria-hidden="true"
            >
              <rect
                x="40"
                y="40"
                width="160"
                height="160"
                rx="24"
                stroke="#96B8C4"
                strokeWidth="1.5"
              />
              <rect
                x="76"
                y="76"
                width="124"
                height="124"
                rx="18"
                stroke="#F4A950"
                strokeWidth="1.5"
                strokeDasharray="5 6"
              />
            </svg>

            <div className="relative z-10 space-y-3">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#F4A950]">
                <BookOpen className="w-4 h-4" />
                <span>Portal Resmi Guru & Wali Kelas</span>
              </div>

              <h1 className="text-xl sm:text-2xl lg:text-[26px] font-extrabold tracking-tight text-white leading-snug [text-wrap:balance]">
                Ruang Kerja Akademik & Manajemen Multi-Kelas.
              </h1>

              <p className="text-xs sm:text-sm text-[#B8D0D8] leading-relaxed">
                Kelola jadwal pelajaran Senin–Sabtu, buat dua kelas atau lebih dalam satu akun pendidik, serta periksa dan beri nilai pengumpulan tugas siswa berdasarkan urutan absen.
              </p>
            </div>

            <div className="relative z-10 mt-6 pt-4 border-t border-white/12 flex items-center justify-between gap-2 text-xs text-[#B8D0D8]">
              <span className="flex items-center gap-1.5 font-mono tabular-nums text-white font-semibold">
                <Clock className="w-3.5 h-3.5 text-[#F4A950]" />
                {witaTimeInfo.formattedTime} WITA
              </span>
              <span>{witaTimeInfo.dayName}</span>
            </div>
          </div>

          {/* Right Educator Auth Form */}
          <div className="lg:col-span-7 p-6 sm:p-8 space-y-5 flex flex-col justify-center">
            {/* Segmented Mode Control */}
            <div className="grid grid-cols-2 p-1 rounded-2xl bg-[#EEF3F5] dark:bg-[#0A1C24] border border-[#DAE4E8] dark:border-[#1E4452]">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMessage(null);
                }}
                className={`min-h-[42px] px-3 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                  mode === 'login'
                    ? 'bg-[#0F2E3A] text-white'
                    : 'text-[#55707A] dark:text-[#96B8C4] hover:text-[#0F2E3A] dark:hover:text-white'
                }`}
              >
                <LogIn className="w-4 h-4 text-[#F4A950]" />
                <span>Masuk Portal Guru</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setErrorMessage(null);
                }}
                className={`min-h-[42px] px-3 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                  mode === 'register'
                    ? 'bg-[#0F2E3A] text-white'
                    : 'text-[#55707A] dark:text-[#96B8C4] hover:text-[#0F2E3A] dark:hover:text-white'
                }`}
              >
                <UserPlus className="w-4 h-4 text-[#F4A950]" />
                <span>Registrasi Guru</span>
              </button>
            </div>

            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-[#0F2E3A] dark:text-white tracking-tight">
                {mode === 'login' ? 'Autentikasi Akun Pendidik' : 'Buat Akun Guru Pengampu'}
              </h2>
              <p className="text-xs text-[#5E7882] dark:text-[#96B8C4] mt-0.5">
                {mode === 'login'
                  ? 'Gunakan email pendidik atau NIP Anda untuk membuka panel manajemen kelas.'
                  : 'Daftarkan akun pendidik baru dan langsung siapkan ruang kelas yang Anda ampu.'}
              </p>
            </div>

            {errorMessage && (
              <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed font-medium">{errorMessage}</span>
              </div>
            )}

            {mode === 'login' ? (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-[#0F2E3A] dark:text-[#DCEBEF] block mb-1.5">
                    Email Resmi atau NIP Guru *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#7D959E] absolute left-3.5 top-3.5 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="Contoh: nama.guru@sekolah.sch.id atau NIP"
                      className="w-full min-h-[44px] pl-10 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-[#CFDCE1] dark:border-[#245060] bg-[#F8FAFB] dark:bg-[#0B1E26] text-[#0F2E3A] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#163E4B] dark:focus:ring-[#F4A950]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#0F2E3A] dark:text-[#DCEBEF] block mb-1.5">
                    Kata Sandi *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#7D959E] absolute left-3.5 top-3.5 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Masukkan kata sandi akun pendidik"
                      className="w-full min-h-[44px] pl-10 pr-11 py-2.5 text-xs sm:text-sm rounded-xl border border-[#CFDCE1] dark:border-[#245060] bg-[#F8FAFB] dark:bg-[#0B1E26] text-[#0F2E3A] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#163E4B] dark:focus:ring-[#F4A950]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-2.5 top-1.5 min-h-[32px] min-w-[32px] flex items-center justify-center text-[#6E8790] hover:text-[#0F2E3A] dark:hover:text-white rounded-lg cursor-pointer"
                      title={showPassword ? 'Sembunyikan Sandi' : 'Tampilkan Sandi'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full min-h-[48px] py-3 px-5 rounded-xl bg-[#0F2E3A] hover:bg-[#194556] text-white font-extrabold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <span>Masuk ke Portal Guru</span>
                  <ArrowRight className="w-4 h-4 text-[#F4A950]" />
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold text-[#0F2E3A] dark:text-[#DCEBEF] block mb-1">
                      Nama Lengkap & Gelar Pendidik *
                    </label>
                    <input
                      type="text"
                      required
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="Contoh: Ibu Siti Aminah, S.Pd."
                      className="w-full min-h-[42px] px-3.5 py-2 text-xs rounded-xl border border-[#CFDCE1] dark:border-[#245060] bg-[#F8FAFB] dark:bg-[#0B1E26] text-[#0F2E3A] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#163E4B]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#0F2E3A] dark:text-[#DCEBEF] block mb-1">
                      Email Pendidik *
                    </label>
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="guru@sekolah.sch.id"
                      className="w-full min-h-[42px] px-3.5 py-2 text-xs rounded-xl border border-[#CFDCE1] dark:border-[#245060] bg-[#F8FAFB] dark:bg-[#0B1E26] text-[#0F2E3A] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#163E4B]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#0F2E3A] dark:text-[#DCEBEF] block mb-1">
                      Kata Sandi Baru *
                    </label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={3}
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Minimal 3 karakter"
                      className="w-full min-h-[42px] px-3.5 py-2 text-xs rounded-xl border border-[#CFDCE1] dark:border-[#245060] bg-[#F8FAFB] dark:bg-[#0B1E26] text-[#0F2E3A] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#163E4B]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#0F2E3A] dark:text-[#DCEBEF] block mb-1">
                      NIP / ID Pendidik *
                    </label>
                    <input
                      type="text"
                      required
                      value={regNip}
                      onChange={(e) => setRegNip(e.target.value)}
                      placeholder="Nomor Induk Pendidik"
                      className="w-full min-h-[42px] px-3.5 py-2 text-xs font-mono tabular-nums rounded-xl border border-[#CFDCE1] dark:border-[#245060] bg-[#F8FAFB] dark:bg-[#0B1E26] text-[#0F2E3A] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#163E4B]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#0F2E3A] dark:text-[#DCEBEF] block mb-1">
                      No. WhatsApp (Opsional)
                    </label>
                    <input
                      type="tel"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="0812xxxxxxxx"
                      className="w-full min-h-[42px] px-3.5 py-2 text-xs font-mono tabular-nums rounded-xl border border-[#CFDCE1] dark:border-[#245060] bg-[#F8FAFB] dark:bg-[#0B1E26] text-[#0F2E3A] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#163E4B]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold text-[#0F2E3A] dark:text-[#DCEBEF] block mb-1">
                      Instansi Sekolah / Madrasah
                    </label>
                    <input
                      type="text"
                      value={regSchoolName}
                      onChange={(e) => setRegSchoolName(e.target.value)}
                      placeholder="Contoh: MTs Negeri / SMP Negeri"
                      className="w-full min-h-[42px] px-3.5 py-2 text-xs rounded-xl border border-[#CFDCE1] dark:border-[#245060] bg-[#F8FAFB] dark:bg-[#0B1E26] text-[#0F2E3A] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#163E4B]"
                    />
                  </div>
                </div>

                {/* Create Initial Multi-Classes for Teacher */}
                <div className="p-3.5 rounded-xl bg-[#F2F6F8] dark:bg-[#0B1E26] border border-[#D4E1E6] dark:border-[#245060] space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-[#0F2E3A] dark:text-[#F4A950]" />
                      <span className="text-xs font-extrabold text-[#0F2E3A] dark:text-white">
                        Buat Kelas Ampuan (Bisa 2 Kelas atau Lebih)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setTeacherInitialClasses((prev) => [
                          ...prev,
                          { name: '', gradeLevel: 'Kelas 9' },
                        ])
                      }
                      className="text-[11px] font-extrabold text-[#0F2E3A] dark:text-[#F4A950] hover:underline flex items-center gap-0.5 cursor-pointer whitespace-nowrap"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Tambah Kelas</span>
                    </button>
                  </div>

                  <p className="text-[11px] text-[#55707A] dark:text-[#96B8C4] leading-snug">
                    Opsional: buat 2 kelas atau lebih sekaligus sekarang, atau kosongkan untuk membuatnya di dalam aplikasi.
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
                            idx === 0 ? 'IX A' : 'IX B'
                          })`}
                          className="flex-1 px-3 py-2 text-xs rounded-lg border border-[#CFDCE1] dark:border-[#275668] bg-white dark:bg-[#0F2731] text-[#0F2E3A] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#163E4B]"
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
                          className="px-2.5 py-2 text-xs rounded-lg border border-[#CFDCE1] dark:border-[#275668] bg-white dark:bg-[#0F2731] text-[#0F2E3A] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#163E4B]"
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
                            className="p-1.5 text-[#7D959E] hover:text-rose-600 cursor-pointer"
                            title="Hapus baris"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full min-h-[48px] py-3 px-5 rounded-xl bg-[#0F2E3A] hover:bg-[#194556] text-white font-extrabold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <span>Daftar & Buka Portal Guru</span>
                  <ArrowRight className="w-4 h-4 text-[#F4A950]" />
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      {/* Quiet Footer */}
      <footer className="w-full max-w-[880px] mx-auto mt-6 flex items-center justify-between gap-2 text-[11px] text-[#607B85] dark:text-[#7E9EA9]">
        <span>ClassyWork · Portal Khusus Guru & Wali Kelas</span>
        <span>Senin – Sabtu · WITA</span>
      </footer>
    </div>
  );
};

export const LoginPage: React.FC = () => {
  const [portalRole, setPortalRole] = useState<UserRole>(getPortalRoleFromUrl);

  useEffect(() => {
    const syncRoleFromUrl = () => {
      setPortalRole(getPortalRoleFromUrl());
    };
    window.addEventListener('popstate', syncRoleFromUrl);
    window.addEventListener('hashchange', syncRoleFromUrl);
    return () => {
      window.removeEventListener('popstate', syncRoleFromUrl);
      window.removeEventListener('hashchange', syncRoleFromUrl);
    };
  }, []);

  if (portalRole === 'teacher') {
    return <TeacherLoginPortal />;
  }

  return <StudentLoginPortal />;
};
