import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { AVATAR_STUDENT_SVG, AVATAR_TEACHER_SVG } from '../data/mockData';
import {
  ShieldCheck,
  GraduationCap,
  X,
  LogOut,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, allDemoUsers, allClasses, loginAsUser, registerUser, logout } = useApp();

  const [authMode, setAuthMode] = useState<'switch_demo' | 'register'>('switch_demo');

  // Register form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('123');
  const [role, setRole] = useState<UserRole>('student');
  const [identifierNumber, setIdentifierNumber] = useState('');

  if (!isOpen) return null;

  const handleSelectDemo = (userId: string) => {
    loginAsUser(userId);
    onClose();
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    registerUser(
      name.trim(),
      email.trim(),
      role,
      identifierNumber.trim() || '0071239999',
      password.trim() || '123'
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B1E25]/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-[#132F3A] rounded-[28px] max-w-md w-full p-5 shadow-[0_20px_50px_rgba(22,62,75,0.2)] border border-[#E8ECEE] dark:border-[#214B59] animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3.5 border-b border-[#E8ECEE] dark:border-[#214B59]">
          <div>
            <h3 className="font-extrabold text-[#163E4B] dark:text-white text-base">
              Autentikasi & Akun Pengguna
            </h3>
            <p className="text-[11px] text-[#6E828A] dark:text-[#96B2BC]">
              Sistem Peran Pengguna (Siswa & Guru)
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[#8A9BA2] hover:text-[#163E4B] dark:hover:text-white p-1.5 rounded-full hover:bg-[#F7F7F5] dark:hover:bg-[#193B48] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switcher: Quick Demo Switch vs Register New */}
        <div className="flex rounded-full bg-[#F7F7F5] dark:bg-[#0E242D] p-1 mt-3.5 border border-[#E8ECEE] dark:border-[#214B59]">
          <button
            onClick={() => setAuthMode('switch_demo')}
            className={`flex-1 py-2 text-xs font-bold rounded-full transition-all cursor-pointer ${
              authMode === 'switch_demo'
                ? 'bg-[#163E4B] text-white shadow-xs'
                : 'text-[#6E828A] hover:text-[#163E4B] dark:text-[#96B2BC]'
            }`}
          >
            Pilih Akun Demo Cepat
          </button>
          <button
            onClick={() => setAuthMode('register')}
            className={`flex-1 py-2 text-xs font-bold rounded-full transition-all cursor-pointer ${
              authMode === 'register'
                ? 'bg-[#163E4B] text-white shadow-xs'
                : 'text-[#6E828A] hover:text-[#163E4B] dark:text-[#96B2BC]'
            }`}
          >
            Daftar Akun Baru
          </button>
        </div>

        {authMode === 'switch_demo' ? (
          <div className="mt-4 space-y-2.5">
            <p className="text-xs text-[#6E828A] dark:text-[#96B2BC]">
              Uji pengalaman aplikasi secara instan sebagai <b className="text-[#163E4B] dark:text-white">Guru Pengampu</b> atau <b className="text-[#163E4B] dark:text-white">Siswa</b>:
            </p>

            <div className="space-y-2">
              {allDemoUsers.map((user) => {
                const isSelected = user.id === currentUser.id;
                const fallbackAvatar =
                  user.role === 'teacher' ? AVATAR_TEACHER_SVG : AVATAR_STUDENT_SVG;
                const userClassCount = allClasses.filter(
                  (c) =>
                    (user.role === 'teacher' && c.teacherId === user.id) ||
                    (user.joinedClassIds || []).includes(c.id)
                ).length;
                return (
                  <button
                    key={user.id}
                    onClick={() => handleSelectDemo(user.id)}
                    className={`w-full p-3.5 rounded-[22px] border text-left flex items-center justify-between transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#163E4B] bg-[#163E4B] text-white shadow-[0_8px_20px_rgba(22,62,75,0.18)]'
                        : 'border-[#E8ECEE] dark:border-[#214B59] bg-[#F7F7F5] dark:bg-[#0E242D] hover:bg-[#FCEADE]/50 dark:hover:bg-[#193B48]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={user.avatarUrl || fallbackAvatar}
                        alt={user.name}
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          e.currentTarget.src = fallbackAvatar;
                        }}
                        className="w-10 h-10 rounded-full object-cover border-2 border-[#F4A950]/70 shrink-0 bg-[#FCEADE]"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`font-extrabold text-xs sm:text-sm truncate ${
                              isSelected ? 'text-white' : 'text-[#163E4B] dark:text-white'
                            }`}
                          >
                            {user.name}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isSelected
                                ? 'bg-[#F4A950] text-[#163E4B]'
                                : user.role === 'teacher'
                                ? 'bg-[#163E4B] text-white'
                                : 'bg-[#FCEADE] text-[#8A4F14]'
                            }`}
                          >
                            {user.role === 'teacher' ? 'Guru' : 'Siswa'}
                          </span>
                        </div>
                        <p
                          className={`text-[11px] truncate tabular-nums mt-0.5 ${
                            isSelected ? 'text-[#B8D0D8]' : 'text-[#6E828A] dark:text-[#96B2BC]'
                          }`}
                        >
                          {user.identifierNumber} · {userClassCount} Kelas
                        </p>
                      </div>
                    </div>

                    {isSelected && (
                      <span className="text-[10px] font-extrabold text-[#163E4B] bg-[#F4A950] px-2.5 py-0.5 rounded-full shrink-0 ml-2">
                        Aktif
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="pt-3 border-t border-[#E8ECEE] dark:border-[#214B59]">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  logout();
                }}
                className="w-full py-2.5 px-4 rounded-2xl border border-rose-200 dark:border-rose-800/70 bg-rose-50/70 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-950/70 text-rose-700 dark:text-rose-300 text-xs font-extrabold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Keluar ke Halaman Login Utama</span>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleRegisterSubmit} className="mt-4 space-y-3.5">
            {/* Role selector */}
            <div>
              <label className="text-xs font-bold text-[#163E4B] dark:text-[#E2EEF2] block mb-1.5">
                Pilih Peran Pengguna *
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setRole('student')}
                  className={`p-3 rounded-[20px] border text-center transition-all cursor-pointer ${
                    role === 'student'
                      ? 'border-[#F4A950] bg-[#FCEADE] text-[#163E4B] font-bold ring-2 ring-[#F4A950]/30'
                      : 'border-[#E8ECEE] dark:border-[#214B59] text-[#6E828A] dark:text-[#96B2BC]'
                  }`}
                >
                  <GraduationCap className="w-5 h-5 mx-auto mb-1 text-[#E59638]" />
                  <span className="text-xs block font-bold">Siswa (Student)</span>
                  <span className="text-[10px] opacity-75 block">Pantau jadwal & kumpul tugas</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('teacher')}
                  className={`p-3 rounded-[20px] border text-center transition-all cursor-pointer ${
                    role === 'teacher'
                      ? 'border-[#163E4B] bg-[#163E4B] text-white font-bold ring-2 ring-[#163E4B]/20'
                      : 'border-[#E8ECEE] dark:border-[#214B59] text-[#6E828A] dark:text-[#96B2BC]'
                  }`}
                >
                  <ShieldCheck
                    className={`w-5 h-5 mx-auto mb-1 ${
                      role === 'teacher' ? 'text-[#F4A950]' : 'text-[#163E4B] dark:text-[#9BBAC4]'
                    }`}
                  />
                  <span className="text-xs block font-bold">Guru (Teacher)</span>
                  <span className="text-[10px] opacity-75 block">Atur jadwal, tugas & nilai</span>
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#163E4B] dark:text-[#E2EEF2] block mb-1">
                Nama Lengkap & Gelar *
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Afiqah Zahira atau Drs. Sutrisno, M.Pd"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-2xl border border-[#DCE4E7] dark:border-[#214B59] bg-[#F7F7F5] dark:bg-[#0E242D] text-[#163E4B] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#F4A950]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#163E4B] dark:text-[#E2EEF2] block mb-1">
                Alamat Email *
              </label>
              <input
                type="email"
                required
                placeholder="user@sekolah.sch.id"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-2xl border border-[#DCE4E7] dark:border-[#214B59] bg-[#F7F7F5] dark:bg-[#0E242D] text-[#163E4B] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#F4A950]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#163E4B] dark:text-[#E2EEF2] block mb-1">
                Kata Sandi Akun *
              </label>
              <input
                type="password"
                required
                minLength={3}
                placeholder="Minimal 3 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-2xl border border-[#DCE4E7] dark:border-[#214B59] bg-[#F7F7F5] dark:bg-[#0E242D] text-[#163E4B] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#F4A950]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#163E4B] dark:text-[#E2EEF2] block mb-1">
                {role === 'teacher' ? 'Nomor Induk Pegawai (NIP)' : 'Nomor Induk Siswa Nasional (NISN)'}
              </label>
              <input
                type="text"
                placeholder={role === 'teacher' ? '198205142008012014' : '0071239841'}
                value={identifierNumber}
                onChange={(e) => setIdentifierNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs font-mono tabular-nums rounded-2xl border border-[#DCE4E7] dark:border-[#214B59] bg-[#F7F7F5] dark:bg-[#0E242D] text-[#163E4B] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#F4A950]"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold rounded-full text-[#6E828A] dark:text-[#96B2BC] hover:bg-[#F7F7F5] dark:hover:bg-[#193B48] cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-extrabold rounded-full bg-[#F4A950] hover:bg-[#E59638] text-[#163E4B] shadow-sm cursor-pointer transition-colors"
              >
                Simpan & Masuk
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
