import React from 'react';
import { useApp } from '../context/AppContext';
import { School, Plus, KeyRound, Sparkles } from 'lucide-react';

interface EmptyClassStateProps {
  onOpenClassModal?: () => void;
  message?: string;
}

export const EmptyClassState: React.FC<EmptyClassStateProps> = ({
  onOpenClassModal,
  message,
}) => {
  const { currentUser } = useApp();
  const isTeacher = currentUser.role === 'teacher';

  const defaultMessage = isTeacher
    ? 'Silakan buat kelas baru Anda untuk mulai mengelola jadwal KBM, tugas, dan agenda kelas digital.'
    : 'Anda belum terdaftar di kelas manapun. Silakan masukkan kode kelas dari guru pengampu Anda untuk mulai melihat jadwal dan mengumpulkan tugas.';

  return (
    <div className="py-10 px-4 text-center max-w-md mx-auto space-y-4">
      <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto shadow-sm">
        <School className="w-8 h-8" />
      </div>

      <div className="space-y-1.5">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-300">
          <Sparkles className="w-3 h-3 text-indigo-500" />
          <span>{isTeacher ? 'Ruang Kelas Belum Tersedia' : 'Belum Bergabung ke Kelas'}</span>
        </div>
        <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
          {isTeacher ? 'Mulai Buat Kelas Anda' : 'Gabung ke Kelas Anda'}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          {message || defaultMessage}
        </p>
      </div>

      <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
        {isTeacher ? (
          <>
            <button
              onClick={onOpenClassModal}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Kelas Baru</span>
            </button>

            <button
              onClick={onOpenClassModal}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5 text-slate-400" />
              <span>Gabung via Kode</span>
            </button>
          </>
        ) : (
          <button
            onClick={onOpenClassModal}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <KeyRound className="w-4 h-4" />
            <span>Masukkan Kode Kelas</span>
          </button>
        )}
      </div>

      <p className="text-[11px] text-slate-400 dark:text-slate-500 italic pt-1">
        {isTeacher
          ? 'Tips: Anda dapat menambahkan nama kelas (misal: VII-A, VIII-B), memilih tingkat kelas MTs, serta membagikan kode kelas kepada siswa.'
          : 'Tips: Minta kode kelas (misal: VII-A-701 atau IX-A-891) kepada guru pengampu atau wali kelas Anda.'}
      </p>
    </div>
  );
};
