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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B1E25]/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#132F3A] border border-[#E8ECEE] dark:border-[#214B59] rounded-[28px] w-full max-w-md max-h-[90vh] overflow-y-auto shadow-[0_20px_50px_rgba(22,62,75,0.2)] p-5 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between pb-3.5 border-b border-[#E8ECEE] dark:border-[#214B59]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#163E4B] text-[#F4A950] flex items-center justify-center font-bold">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[#163E4B] dark:text-white flex items-center gap-2 flex-wrap">
                <span>Nomor WhatsApp Guru</span>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#FCEADE] text-[#8A4F14] dark:bg-[#F4A950]/20 dark:text-[#F4A950]">
                  Verifikasi Resmi
                </span>
              </h3>
              <p className="text-xs text-[#6E828A] dark:text-[#96B2BC]">
                Pencegahan penyalahgunaan nomor kontak sekolah
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#8A9BA2] hover:text-[#163E4B] dark:hover:text-white rounded-full hover:bg-[#F7F7F5] dark:hover:bg-[#193B48] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Security Warning Notice */}
        <div className="p-4 rounded-[22px] bg-[#FCEADE] dark:bg-[#F4A950]/15 border border-[#F4D3BA] dark:border-[#F4A950]/30 text-[#163E4B] dark:text-[#FCEADE] text-xs space-y-1">
          <div className="flex items-center gap-1.5 font-extrabold">
            <Lock className="w-4 h-4 text-[#E59638] shrink-0" />
            <span>Sistem Keamanan & Verifikasi Pendidik</span>
          </div>
          <p className="text-[11px] leading-relaxed text-[#4B636D] dark:text-[#D2E2E8]">
            Agar nomor WhatsApp tidak disalahgunakan oleh pihak yang tidak berwenang, nomor WhatsApp guru
            harus diverifikasi menggunakan <b>PIN Keamanan Pendidik</b> (default resmi: <code className="font-mono font-bold">1985</code>, <code className="font-mono font-bold">1234</code>, atau 4 digit NIP). Siswa hanya dapat terhubung ke nomor yang telah berstatus terverifikasi.
          </p>
        </div>

        {/* Current Status */}
        <div className="p-3.5 rounded-[22px] bg-[#F7F7F5] dark:bg-[#0E242D] border border-[#E8ECEE] dark:border-[#214B59] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#6E828A] dark:text-[#96B2BC]">
              Status Verifikasi Kontak:
            </span>
            {currentUser.isPhoneVerified ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Terverifikasi Resmi
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                <AlertCircle className="w-3.5 h-3.5" />
                Belum Terverifikasi
              </span>
            )}
          </div>

          {currentUser.phone && (
            <div className="flex items-center justify-between pt-2 border-t border-[#E8ECEE] dark:border-[#214B59]">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#8A9BA2]" />
                <span className="text-xs font-mono font-bold text-[#163E4B] dark:text-white tabular-nums">
                  +{currentUser.phone}
                </span>
              </div>
              {currentUser.isPhoneVerified && (
                <a
                  href={getWaLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] font-bold text-[#163E4B] dark:text-[#F4A950] flex items-center gap-1 hover:underline"
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
              <label className="text-xs font-bold text-[#163E4B] dark:text-[#E2EEF2] block mb-1">
                Nomor WhatsApp Aktif Guru *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8A9BA2]">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  required
                  placeholder="Contoh: 081234567890"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-2xl border border-[#DCE4E7] dark:border-[#214B59] bg-[#F7F7F5] dark:bg-[#0E242D] text-[#163E4B] dark:text-white font-mono tabular-nums focus:outline-hidden focus:ring-2 focus:ring-[#F4A950]"
                />
              </div>
              <p className="text-[10px] text-[#7A8E96] mt-1">
                Nomor ini akan tampil pada jadwal & tugas untuk siswa berkonsultasi pelajaran.
              </p>
            </div>

            <div>
              <label className="text-xs font-bold text-[#163E4B] dark:text-[#E2EEF2] block mb-1">
                PIN Keamanan Verifikasi Guru *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8A9BA2]">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  placeholder="Masukkan PIN (misal: 1985)"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-2xl border border-[#DCE4E7] dark:border-[#214B59] bg-[#F7F7F5] dark:bg-[#0E242D] text-[#163E4B] dark:text-white font-mono tabular-nums focus:outline-hidden focus:ring-2 focus:ring-[#F4A950]"
                />
              </div>
              <p className="text-[10px] text-[#7A8E96] mt-1">
                Gunakan PIN resmi guru: <code className="font-mono font-bold">1985</code> atau 4 digit NIP Anda.
              </p>
            </div>

            {resultMsg && (
              <div
                className={`p-3 rounded-2xl text-xs font-medium flex items-start gap-2 ${
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

            <div className="pt-2 flex justify-end gap-2 border-t border-[#E8ECEE] dark:border-[#214B59]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold rounded-full text-[#6E828A] dark:text-[#96B2BC] hover:bg-[#F7F7F5] dark:hover:bg-[#193B48] cursor-pointer"
              >
                Tutup
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-extrabold rounded-full bg-[#F4A950] hover:bg-[#E59638] text-[#163E4B] shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verifikasi Sekarang</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="text-center py-4 space-y-3">
            <p className="text-xs text-[#6E828A] dark:text-[#96B2BC]">
              Anda sedang login sebagai <b className="text-[#163E4B] dark:text-white">Siswa</b>. Fitur pengaturan nomor WhatsApp hanya dapat diubah oleh Bapak/Ibu Guru pengampu.
            </p>
            {currentUser.phone && currentUser.isPhoneVerified ? (
              <a
                href={getWaLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#163E4B] hover:bg-[#1D4E5E] text-white rounded-full text-xs font-extrabold shadow-sm transition-all"
              >
                <MessageCircle className="w-4 h-4 text-[#F4A950]" />
                <span>Chat Guru via WhatsApp Sekarang</span>
              </a>
            ) : (
              <div className="p-3 rounded-2xl bg-[#F7F7F5] dark:bg-[#0E242D] text-xs text-[#6E828A] dark:text-[#96B2BC]">
                Nomor guru pengampu belum diverifikasi oleh pihak sekolah.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
