import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ShieldCheck,
  Phone,
  MessageCircle,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Lock,
  ExternalLink,
  X,
} from 'lucide-react';

interface TeacherPhoneVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TeacherPhoneVerificationModal: React.FC<TeacherPhoneVerificationModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { currentUser, activeClass, updateTeacherPhone } = useApp();

  const [phoneInput, setPhoneInput] = useState(currentUser.phone || '081234567890');
  const [pinInput, setPinInput] = useState('1985');
  const [resultMsg, setResultMsg] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const isTeacher = currentUser.role === 'teacher';

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    const res = updateTeacherPhone(phoneInput, pinInput);
    setResultMsg(res);
    if (res.success) {
      setTimeout(() => {
        onClose();
        setResultMsg(null);
      }, 1500);
    }
  };

  const getWaLink = () => {
    const raw = (currentUser.phone || phoneInput).replace(/[^0-9]/g, '');
    let formatted = raw;
    if (formatted.startsWith('0')) formatted = '62' + formatted.slice(1);
    const text = encodeURIComponent(
      `Assalamu'alaikum Bapak/Ibu Guru ${currentUser.name}, saya siswa di kelas ${activeClass?.name || 'ClassyWork'}.`
    );
    return `https://wa.me/${formatted}?text=${text}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl p-5 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <span>Nomor WhatsApp Guru</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                  Verifikasi Resmi
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pencegahan penyalahgunaan nomor kontak sekolah
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Security Warning Notice */}
        <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200 text-xs space-y-1">
          <div className="flex items-center gap-1.5 font-bold">
            <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>Sistem Keamanan & Verifikasi Pendidik</span>
          </div>
          <p className="text-[11px] leading-relaxed text-amber-800 dark:text-amber-300">
            Agar nomor WhatsApp tidak disalahgunakan oleh pihak yang tidak berwenang, nomor WhatsApp guru
            harus diverifikasi menggunakan <b>PIN Keamanan Pendidik</b> (default resmi: <code>1985</code>, <code>1234</code>, atau 4 digit NIP). Siswa hanya dapat terhubung ke nomor yang telah berstatus terverifikasi.
          </p>
        </div>

        {/* Current Status */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              Status Verifikasi Kontak:
            </span>
            {currentUser.isPhoneVerified ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Terverifikasi Resmi ✅
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                <AlertCircle className="w-3.5 h-3.5" />
                Belum Terverifikasi
              </span>
            )}
          </div>

          {currentUser.phone && (
            <div className="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                  +{currentUser.phone}
                </span>
              </div>
              {currentUser.isPhoneVerified && (
                <a
                  href={getWaLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 hover:underline"
                >
                  <ExternalLink className="w-3 h-3" />
                  Uji Chat WA
                </a>
              )}
            </div>
          )}
        </div>

        {/* Form for Teacher */}
        {isTeacher ? (
          <form onSubmit={handleVerify} className="space-y-3.5">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Nomor WhatsApp Aktif Guru *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  required
                  placeholder="Contoh: 081234567890"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-transparent text-slate-800 dark:text-slate-100 font-mono focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Nomor ini akan tampil pada jadwal & tugas untuk siswa berkonsultasi pelajaran.
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                PIN Keamanan Verifikasi Guru *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  placeholder="Masukkan PIN (misal: 1985)"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-transparent text-slate-800 dark:text-slate-100 font-mono focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Gunakan PIN resmi guru: <code>1985</code> atau 4 digit NIP Anda.
              </p>
            </div>

            {resultMsg && (
              <div
                className={`p-3 rounded-xl text-xs font-medium flex items-start gap-2 ${
                  resultMsg.success
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : 'bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-300'
                }`}
              >
                {resultMsg.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <span>{resultMsg.message}</span>
              </div>
            )}

            <div className="pt-2 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Tutup
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md flex items-center gap-1.5 transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verifikasi Sekarang</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="text-center py-4 space-y-3">
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Anda sedang login sebagai <b>Siswa</b>. Fitur pengaturan nomor WhatsApp hanya dapat diubah oleh Bapak/Ibu Guru pengampu.
            </p>
            {currentUser.phone && currentUser.isPhoneVerified ? (
              <a
                href={getWaLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat Guru via WhatsApp Sekarang</span>
              </a>
            ) : (
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-500">
                Nomor guru pengampu belum diverifikasi oleh pihak sekolah.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
