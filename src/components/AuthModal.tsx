import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { AVATAR_STUDENT_SVG, AVATAR_TEACHER_SVG } from '../data/mockData';
import {
  ShieldCheck,
  GraduationCap,
  X,
  LogOut,
  Link2,
  Check,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, classes, logout, updateUserPassword } = useApp();
  const [copiedPortal, setCopiedPortal] = useState<'siswa' | 'guru' | null>(null);

  const isTeacher = currentUser.role === 'teacher';
  const isDefaultStudentPass = !isTeacher && !currentUser.hasChangedPassword;

  const [currentPassword, setCurrentPassword] = useState(isDefaultStudentPass ? '0000' : '');
  const [newPassword, setNewPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [passwordFeedback, setPasswordFeedback] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setCurrentPassword(!isTeacher && !currentUser.hasChangedPassword ? '0000' : '');
      setNewPassword('');
      setPasswordFeedback(null);
    }
  }, [isOpen, isTeacher, currentUser.id, currentUser.hasChangedPassword]);

  if (!isOpen) return null;

  const fallbackAvatar = isTeacher ? AVATAR_TEACHER_SVG : AVATAR_STUDENT_SVG;
  const isPlaceholderStudentEmail = currentUser.email?.endsWith('@siswa.classywork.local');

  const handleCopyPortalLink = (portal: 'siswa' | 'guru') => {
    const url = `${window.location.origin}/?portal=${portal}`;
    navigator.clipboard.writeText(url);
    setCopiedPortal(portal);
    setTimeout(() => setCopiedPortal(null), 2000);
  };

  const handlePasswordChangeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordFeedback(null);
    const res = updateUserPassword(currentPassword, newPassword);
    if (res.success) {
      setPasswordFeedback({ type: 'success', text: res.message });
      setCurrentPassword('');
      setNewPassword('');
    } else {
      setPasswordFeedback({ type: 'error', text: res.message });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B1E25]/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-[#132F3A] rounded-[28px] max-w-md w-full p-5 shadow-[0_20px_50px_rgba(22,62,75,0.2)] border border-[#E8ECEE] dark:border-[#214B59] my-auto">
        <div className="flex items-center justify-between pb-3.5 border-b border-[#E8ECEE] dark:border-[#214B59]">
          <div>
            <h3 className="font-extrabold text-[#163E4B] dark:text-white text-base">
              Profil & Keamanan Akun
            </h3>
            <p className="text-[11px] text-[#6E828A] dark:text-[#96B2BC]">
              {isTeacher ? 'Portal Guru & Wali Kelas' : 'Portal Belajar Siswa'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="min-h-[36px] min-w-[36px] flex items-center justify-center text-[#8A9BA2] hover:text-[#163E4B] dark:hover:text-white rounded-full hover:bg-[#F7F7F5] dark:hover:bg-[#193B48] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          {/* Active User Profile Card */}
          <div className="p-4 rounded-[22px] bg-[#163E4B] text-white flex items-center gap-3.5">
            <img
              src={currentUser.avatarUrl || fallbackAvatar}
              alt={currentUser.name}
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.src = fallbackAvatar;
              }}
              className="w-12 h-12 rounded-full object-cover border-2 border-[#F4A950] shrink-0 bg-[#FCEADE]"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-extrabold text-sm text-white truncate">
                  {currentUser.name}
                </span>
                <span className="text-xs font-bold text-[#F4A950] inline-flex items-center gap-1 whitespace-nowrap">
                  ·{' '}
                  {isTeacher ? (
                    <ShieldCheck className="w-3.5 h-3.5" />
                  ) : (
                    <GraduationCap className="w-3.5 h-3.5" />
                  )}
                  {isTeacher ? 'Guru' : 'Siswa'}
                </span>
              </div>

              {!isPlaceholderStudentEmail && currentUser.email && (
                <p className="text-xs text-[#C6DCE3] truncate mt-0.5">{currentUser.email}</p>
              )}

              <p className="text-[11px] text-[#FCEADE]/90 font-mono tabular-nums mt-0.5">
                {!isTeacher && currentUser.attendanceNumber
                  ? `No. Absen ${currentUser.attendanceNumber} · `
                  : ''}
                {currentUser.identifierNumber} · {classes.length} Kelas Aktif
              </p>
            </div>
          </div>

          {/* Ubah Kata Sandi Section */}
          <form
            onSubmit={handlePasswordChangeSubmit}
            className="p-4 rounded-2xl bg-[#F7F7F5] dark:bg-[#0E242D] border border-[#E8ECEE] dark:border-[#214B59] space-y-3"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#E59638]" />
                <span className="text-xs font-extrabold text-[#163E4B] dark:text-white">
                  Ubah Kata Sandi Akun
                </span>
              </div>
              {isDefaultStudentPass && (
                <span className="text-[11px] font-medium text-[#7A562C] dark:text-[#F4A950] font-mono tabular-nums">
                  Sandi awal: 0000
                </span>
              )}
            </div>

            {passwordFeedback && (
              <div
                className={`p-2.5 rounded-xl border text-xs flex items-start gap-2 ${
                  passwordFeedback.type === 'success'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                    : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200'
                }`}
              >
                {passwordFeedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                )}
                <span className="font-medium leading-snug">{passwordFeedback.text}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="text-[11px] font-bold text-[#4F6872] dark:text-[#A9C4CD] block mb-1">
                  Sandi Saat Ini
                </label>
                <input
                  type={showPasswords ? 'text' : 'password'}
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder={isDefaultStudentPass ? '0000' : 'Sandi lama'}
                  className="w-full min-h-[40px] px-3 py-2 text-xs font-mono tabular-nums rounded-xl border border-[#DCE4E7] dark:border-[#245060] bg-white dark:bg-[#132F3A] text-[#163E4B] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#F4A950]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#4F6872] dark:text-[#A9C4CD] block mb-1">
                  Sandi Baru
                </label>
                <div className="relative">
                  <input
                    type={showPasswords ? 'text' : 'password'}
                    required
                    minLength={3}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min. 3 karakter"
                    className="w-full min-h-[40px] pl-3 pr-9 py-2 text-xs font-mono tabular-nums rounded-xl border border-[#DCE4E7] dark:border-[#245060] bg-white dark:bg-[#132F3A] text-[#163E4B] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#F4A950]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords((prev) => !prev)}
                    className="absolute right-2 top-1 min-h-[32px] min-w-[28px] flex items-center justify-center text-[#7A8E96] hover:text-[#163E4B] dark:hover:text-white cursor-pointer"
                    title={showPasswords ? 'Sembunyikan' : 'Tampilkan'}
                  >
                    {showPasswords ? (
                      <EyeOff className="w-3.5 h-3.5" />
                    ) : (
                      <Eye className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full min-h-[40px] py-2 px-4 rounded-xl bg-[#F4A950] hover:bg-[#E59638] text-[#163E4B] text-xs font-extrabold flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Simpan Kata Sandi Baru</span>
            </button>
          </form>

          {/* Direct Portal Links Copy Section */}
          <div className="p-3.5 rounded-2xl bg-[#F7F7F5] dark:bg-[#0E242D] border border-[#E8ECEE] dark:border-[#214B59] space-y-2.5">
            <span className="text-xs font-bold text-[#163E4B] dark:text-white block">
              Tautan Halaman Login Terpisah
            </span>
            <div className={`grid gap-2 ${isTeacher ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
              <button
                type="button"
                onClick={() => handleCopyPortalLink('siswa')}
                className="min-h-[40px] px-3 py-2 rounded-xl bg-white dark:bg-[#132F3A] border border-[#DCE4E7] dark:border-[#245060] text-xs font-bold text-[#163E4B] dark:text-[#FCEADE] hover:border-[#F4A950] flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
              >
                {copiedPortal === 'siswa' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Link Siswa Tersalin</span>
                  </>
                ) : (
                  <>
                    <Link2 className="w-3.5 h-3.5 text-[#E59638]" />
                    <span>Salin Link Login Siswa</span>
                  </>
                )}
              </button>

              {isTeacher && (
                <button
                  type="button"
                  onClick={() => handleCopyPortalLink('guru')}
                  className="min-h-[40px] px-3 py-2 rounded-xl bg-white dark:bg-[#132F3A] border border-[#DCE4E7] dark:border-[#245060] text-xs font-bold text-[#163E4B] dark:text-white hover:border-[#163E4B] dark:hover:border-[#F4A950] flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
                >
                  {copiedPortal === 'guru' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Link Guru Tersalin</span>
                    </>
                  ) : (
                    <>
                      <Link2 className="w-3.5 h-3.5 text-[#163E4B] dark:text-[#F4A950]" />
                      <span>Salin Link Guru</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Logout Button */}
          <div className="pt-2 border-t border-[#E8ECEE] dark:border-[#214B59]">
            <button
              type="button"
              onClick={() => {
                onClose();
                logout();
              }}
              className="w-full min-h-[44px] py-2.5 px-4 rounded-2xl border border-rose-200 dark:border-rose-800/70 bg-rose-50/70 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-950/70 text-rose-700 dark:text-rose-300 text-xs font-extrabold flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
            >
              <LogOut className="w-4 h-4" />
              <span>Keluar ke Halaman Login {isTeacher ? 'Guru' : 'Siswa'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
