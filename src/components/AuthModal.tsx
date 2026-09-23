import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import {
  UserCheck,
  ShieldCheck,
  Mail,
  Lock,
  User,
  GraduationCap,
  Sparkles,
  ArrowRight,
  School,
  IdCard,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, allDemoUsers, loginAsUser, registerUser } = useApp();

  const [authMode, setAuthMode] = useState<'switch_demo' | 'register'>('switch_demo');

  // Register form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
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

    registerUser(name.trim(), email.trim(), role, identifierNumber.trim() || '0071239999');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Autentikasi & Akun Pengguna
            </h3>
            <p className="text-[11px] text-slate-500">
              PRD 3.1: Sistem Peran Pengguna (Siswa & Guru)
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-sm font-bold"
          >
            ✕
          </button>
        </div>

        {/* Tab switcher: Quick Demo Switch vs Register New */}
        <div className="flex rounded-xl bg-slate-100 dark:bg-slate-900 p-1 mt-3">
          <button
            onClick={() => setAuthMode('switch_demo')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              authMode === 'switch_demo'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-500'
            }`}
          >
            Pilih Akun Demo Cepat
          </button>
          <button
            onClick={() => setAuthMode('register')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              authMode === 'register'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-500'
            }`}
          >
            Daftar Akun Baru
          </button>
        </div>

        {authMode === 'switch_demo' ? (
          <div className="mt-4 space-y-2.5">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Uji pengalaman aplikasi secara instan sebagai <b>Guru Pengampu</b> atau <b>Siswa</b>:
            </p>

            <div className="space-y-2">
              {allDemoUsers.map((user) => {
                const isSelected = user.id === currentUser.id;
                return (
                  <button
                    key={user.id}
                    onClick={() => handleSelectDemo(user.id)}
                    className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/60 ring-2 ring-indigo-500/20 shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={user.avatarUrl}
                        alt={user.name}
                        className="w-10 h-10 rounded-full object-cover border"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                            {user.name}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.2 rounded capitalize ${
                              user.role === 'teacher'
                                ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                                : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                            }`}
                          >
                            {user.role === 'teacher' ? 'Guru' : 'Siswa'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {user.identifierNumber} • {user.email}
                        </p>
                      </div>
                    </div>

                    {isSelected && (
                      <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-full border shadow-2xs">
                        Aktif
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <form onSubmit={handleRegisterSubmit} className="mt-4 space-y-3.5">
            {/* Role selector (PRD 3.1: Role selection Siswa atau Guru) */}
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Pilih Peran Pengguna (Role Selection) *
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('student')}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    role === 'student'
                      ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold ring-2 ring-emerald-500/20'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <GraduationCap className="w-5 h-5 mx-auto mb-1 text-emerald-600" />
                  <span className="text-xs block">Siswa (Student)</span>
                  <span className="text-[10px] opacity-70 block">Pantau jadwal & kumpul tugas</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('teacher')}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    role === 'teacher'
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 font-bold ring-2 ring-indigo-500/20'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <ShieldCheck className="w-5 h-5 mx-auto mb-1 text-indigo-600" />
                  <span className="text-xs block">Guru (Teacher)</span>
                  <span className="text-[10px] opacity-70 block">Atur jadwal, tugas & nilai</span>
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Nama Lengkap & Gelar *
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Afiqah Zahira atau Drs. Sutrisno, M.Pd"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-transparent text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Alamat Email *
              </label>
              <input
                type="email"
                required
                placeholder="user@sekolah.sch.id"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-transparent text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                {role === 'teacher' ? 'Nomor Induk Pegawai (NIP)' : 'Nomor Induk Siswa Nasional (NISN)'}
              </label>
              <input
                type="text"
                placeholder={role === 'teacher' ? '198205142008012014' : '0071239841'}
                value={identifierNumber}
                onChange={(e) => setIdentifierNumber(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-300 dark:border-slate-600 bg-transparent text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20"
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
