import React from 'react';
import { useApp } from '../context/AppContext';
import {
  ShieldCheck,
  Eye,
  EyeOff,
  Lock,
  Download,
  CheckCircle2,
  X,
  FileCheck,
  KeyRound,
} from 'lucide-react';

interface PrivacySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacySettingsModal: React.FC<PrivacySettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    privacySettings,
    updatePrivacySettings,
    classes,
    schedules,
    assignments,
    submissions,
    announcements,
  } = useApp();

  if (!isOpen) return null;

  const handleExportBackup = () => {
    const backupData = {
      exportDate: new Date().toISOString(),
      classes,
      schedules,
      assignments,
      submissions,
      announcements,
    };
    const jsonStr = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Backup_Data_Sekolah_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 bg-[#0B1E25]/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#132F3A] border border-[#E8ECEE] dark:border-[#214B59] rounded-[28px] w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-[0_20px_50px_rgba(22,62,75,0.2)] p-5 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#163E4B] text-[#F4A950] flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[#163E4B] dark:text-white flex items-center gap-2 flex-wrap">
                <span>Pengaturan Privasi & Keamanan</span>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#FCEADE] text-[#8A4F14] dark:bg-[#F4A950]/20 dark:text-[#F4A950]">
                  Transparan
                </span>
              </h3>
              <p className="text-xs text-[#6E828A] dark:text-[#96B2BC]">
                Kontrol hak akses data jadwal sensitif dan keamanan akun
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

        {/* Privacy Toggles */}
        <div className="space-y-3">
          <h4 className="font-bold text-xs text-[#163E4B] dark:text-white flex items-center gap-1.5">
            <Eye className="w-4 h-4 text-[#E59638]" />
            <span>Preferensi Visibilitas Jadwal & Lokasi</span>
          </h4>

          {/* Toggle 1: Hide specific location */}
          <div className="p-3.5 rounded-[22px] border border-[#E8ECEE] dark:border-[#214B59] bg-[#F7F7F5] dark:bg-[#0E242D] flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <p className="font-bold text-xs text-[#163E4B] dark:text-white flex items-center gap-1.5">
                {privacySettings.hideSpecificLocations ? (
                  <EyeOff className="w-3.5 h-3.5 text-[#E59638]" />
                ) : (
                  <Eye className="w-3.5 h-3.5 text-[#8A9BA2]" />
                )}
                <span>Sembunyikan Lokasi Ruangan Spesifik</span>
              </p>
              <p className="text-[11px] text-[#6E828A] dark:text-[#96B2BC] leading-tight">
                Lokasi ruang kelas/lab hanya akan ditampilkan sebagai "Ruang Kelas" untuk menjaga privasi pergerakan siswa.
              </p>
            </div>

            <button
              onClick={() =>
                updatePrivacySettings({
                  hideSpecificLocations: !privacySettings.hideSpecificLocations,
                })
              }
              className={`w-11 h-6 rounded-full transition-colors relative shrink-0 cursor-pointer ${
                privacySettings.hideSpecificLocations
                  ? 'bg-[#163E4B] dark:bg-[#F4A950]'
                  : 'bg-[#D5DFE3] dark:bg-[#193B48]'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full bg-white dark:bg-[#0B1E25] block transition-transform shadow-xs absolute top-0.5 ${
                  privacySettings.hideSpecificLocations ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {/* Toggle 2: Members Only Schedule */}
          <div className="p-3.5 rounded-[22px] border border-[#E8ECEE] dark:border-[#214B59] bg-[#F7F7F5] dark:bg-[#0E242D] flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <p className="font-bold text-xs text-[#163E4B] dark:text-white flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-[#8A9BA2]" />
                <span>Hanya Tampilkan Jadwal ke Anggota Terdaftar</span>
              </p>
              <p className="text-[11px] text-[#6E828A] dark:text-[#96B2BC] leading-tight">
                Mencegah orang luar yang tidak memiliki kode kelas resmi melihat rincian mata pelajaran harian.
              </p>
            </div>

            <button
              onClick={() =>
                updatePrivacySettings({
                  membersOnlySchedule: !privacySettings.membersOnlySchedule,
                })
              }
              className={`w-11 h-6 rounded-full transition-colors relative shrink-0 cursor-pointer ${
                privacySettings.membersOnlySchedule
                  ? 'bg-[#163E4B] dark:bg-[#F4A950]'
                  : 'bg-[#D5DFE3] dark:bg-[#193B48]'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full bg-white dark:bg-[#0B1E25] block transition-transform shadow-xs absolute top-0.5 ${
                  privacySettings.membersOnlySchedule ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {/* Toggle 3: Gamification Stats */}
          <div className="p-3.5 rounded-[22px] border border-[#E8ECEE] dark:border-[#214B59] bg-[#F7F7F5] dark:bg-[#0E242D] flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <p className="font-bold text-xs text-[#163E4B] dark:text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#8A9BA2]" />
                <span>Tampilkan Badge & Skor Prestasi</span>
              </p>
              <p className="text-[11px] text-[#6E828A] dark:text-[#96B2BC] leading-tight">
                Tampilkan lencana tugas tepat waktu dan level kemahiran belajar di profil Anda.
              </p>
            </div>

            <button
              onClick={() =>
                updatePrivacySettings({
                  showStudyStats: !privacySettings.showStudyStats,
                })
              }
              className={`w-11 h-6 rounded-full transition-colors relative shrink-0 cursor-pointer ${
                privacySettings.showStudyStats
                  ? 'bg-[#163E4B] dark:bg-[#F4A950]'
                  : 'bg-[#D5DFE3] dark:bg-[#193B48]'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full bg-white dark:bg-[#0B1E25] block transition-transform shadow-xs absolute top-0.5 ${
                  privacySettings.showStudyStats ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Security & Access Transparency */}
        <div className="p-4 rounded-[24px] bg-[#FCEADE] dark:bg-[#F4A950]/15 border border-[#F4D3BA] dark:border-[#F4A950]/30 space-y-2">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#E59638]" />
            <h5 className="font-extrabold text-xs text-[#163E4B] dark:text-[#FCEADE]">
              Perlindungan Data Kelas & Privasi Akademik
            </h5>
          </div>
          <p className="text-[11px] text-[#4B636D] dark:text-[#D2E2E8] leading-relaxed">
            Data jadwal dan nilai pengumpulan tugas terlindungi secara terisolasi. Hanya pengguna yang terotentikasi dan anggota kelas resmi yang diizinkan memodifikasi tugas dan nilai absen.
          </p>
          <div className="grid grid-cols-2 gap-2 pt-1 text-[10px] font-mono text-[#163E4B] dark:text-[#F4A950]">
            <span className="flex items-center gap-1 font-bold">
              <CheckCircle2 className="w-3 h-3 text-[#E59638]" />
              Penyimpanan Terisolasi
            </span>
            <span className="flex items-center gap-1 font-bold">
              <CheckCircle2 className="w-3 h-3 text-[#E59638]" />
              Akses Anggota Terbatas
            </span>
          </div>
        </div>

        {/* Data Portability: Backup JSON */}
        <div className="p-4 rounded-[24px] bg-[#F7F7F5] dark:bg-[#0E242D] border border-[#E8ECEE] dark:border-[#214B59] flex items-center justify-between gap-3">
          <div>
            <h5 className="font-bold text-xs text-[#163E4B] dark:text-white flex items-center gap-1.5">
              <FileCheck className="w-4 h-4 text-[#E59638]" />
              <span>Salinan Cadangan Data (Backup)</span>
            </h5>
            <p className="text-[11px] text-[#6E828A] dark:text-[#96B2BC] mt-0.5">
              Unduh seluruh salinan data jadwal, tugas, dan kelas Anda dalam format JSON.
            </p>
          </div>

          <button
            onClick={handleExportBackup}
            className="px-3.5 py-2 bg-[#163E4B] hover:bg-[#1D4E5E] text-white rounded-full text-xs font-bold shrink-0 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#F4A950]" />
            <span>Unduh JSON</span>
          </button>
        </div>

        {/* Footer */}
        <div className="pt-2 flex justify-end border-t border-[#E8ECEE] dark:border-[#214B59]">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#F4A950] hover:bg-[#E59638] text-[#163E4B] rounded-full text-xs font-extrabold cursor-pointer transition-colors"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
