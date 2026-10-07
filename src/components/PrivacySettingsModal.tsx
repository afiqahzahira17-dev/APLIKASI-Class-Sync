import React from 'react';
import { useApp } from '../context/AppContext';
import {
  ShieldCheck,
  Eye,
  EyeOff,
  Lock,
  Database,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl p-5 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <span>Pengaturan Privasi & Keamanan</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                  Transparan
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Kontrol hak akses data jadwal sensitif dan keamanan akun
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

        {/* Privacy Toggles */}
        <div className="space-y-3">
          <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
            <Eye className="w-4 h-4 text-indigo-500" />
            <span>Preferensi Visibilitas Jadwal & Lokasi</span>
          </h4>

          {/* Toggle 1: Hide specific location */}
          <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <p className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                {privacySettings.hideSpecificLocations ? (
                  <EyeOff className="w-3.5 h-3.5 text-amber-500" />
                ) : (
                  <Eye className="w-3.5 h-3.5 text-slate-400" />
                )}
                <span>Sembunyikan Lokasi Ruangan Spesifik</span>
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                Lokasi ruang kelas/lab hanya akan ditampilkan sebagai "Ruang Kelas" untuk menjaga privasi pergerakan siswa.
              </p>
            </div>

            <button
              onClick={() =>
                updatePrivacySettings({
                  hideSpecificLocations: !privacySettings.hideSpecificLocations,
                })
              }
              className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${
                privacySettings.hideSpecificLocations ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full bg-white block transition-transform shadow-xs absolute top-0.5 ${
                  privacySettings.hideSpecificLocations ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {/* Toggle 2: Members Only Schedule */}
          <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <p className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                <span>Hanya Tampilkan Jadwal ke Anggota Terdaftar</span>
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                Mencegah orang luar yang tidak memiliki kode kelas resmi melihat rincian mata pelajaran harian.
              </p>
            </div>

            <button
              onClick={() =>
                updatePrivacySettings({
                  membersOnlySchedule: !privacySettings.membersOnlySchedule,
                })
              }
              className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${
                privacySettings.membersOnlySchedule ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full bg-white block transition-transform shadow-xs absolute top-0.5 ${
                  privacySettings.membersOnlySchedule ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {/* Toggle 3: Gamification Stats */}
          <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <p className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
                <span>Tampilkan Badge & Skor Prestasi</span>
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                Tampilkan lencana tugas tepat waktu dan level kemahiran belajar di profil Anda.
              </p>
            </div>

            <button
              onClick={() =>
                updatePrivacySettings({
                  showStudyStats: !privacySettings.showStudyStats,
                })
              }
              className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${
                privacySettings.showStudyStats ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full bg-white block transition-transform shadow-xs absolute top-0.5 ${
                  privacySettings.showStudyStats ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Security & Access Transparency */}
        <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 space-y-2">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h5 className="font-bold text-xs text-emerald-900 dark:text-emerald-200">
              Keamanan Data & Row Level Security (RLS)
            </h5>
          </div>
          <p className="text-[11px] text-emerald-800 dark:text-emerald-300 leading-relaxed">
            Data jadwal dan nilai pengumpulan tugas dilindungi oleh aturan keamanan PostgreSQL RLS. Hanya pengguna yang terotentikasi dan anggota kelas yang diizinkan memodifikasi tugas dan absensi.
          </p>
          <div className="grid grid-cols-2 gap-2 pt-1 text-[10px] font-mono text-emerald-700 dark:text-emerald-400">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              Penyimpanan Terisolasi
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              Realtime Socket TLS
            </span>
          </div>
        </div>

        {/* Data Portability: Backup JSON */}
        <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
          <div>
            <h5 className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
              <FileCheck className="w-4 h-4 text-indigo-500" />
              <span>Salinan Cadangan Data (Backup)</span>
            </h5>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Unduh seluruh salinan data jadwal, tugas, dan kelas Anda dalam format JSON.
            </p>
          </div>

          <button
            onClick={handleExportBackup}
            className="px-3 py-1.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600 rounded-xl text-xs font-bold shrink-0 flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Unduh JSON</span>
          </button>
        </div>

        {/* Footer */}
        <div className="pt-2 flex justify-end border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
