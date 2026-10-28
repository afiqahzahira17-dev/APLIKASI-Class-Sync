import React from 'react';
import { useApp } from '../context/AppContext';
import { School, Plus, KeyRound } from 'lucide-react';

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
    <div className="py-10 px-6 text-center max-w-md mx-auto bg-white dark:bg-[#13313C] rounded-[28px] shadow-[0_10px_30px_rgba(22,62,75,0.06)] border border-[#ECECE6] dark:border-[#214B59] space-y-4 relative overflow-hidden">
      <div className="w-28 h-28 rounded-full border-[6px] border-[#FCEADE]/80 dark:border-white/[0.04] absolute -right-8 -top-8 pointer-events-none" />

      <div className="w-16 h-16 rounded-[22px] bg-[#FCEADE] dark:bg-[#1E4654] text-[#163E4B] dark:text-[#F4A950] flex items-center justify-center mx-auto shadow-xs relative z-10">
        <School className="w-8 h-8" />
      </div>

      <div className="space-y-1.5 relative z-10">
        <p className="text-xs font-bold text-[#E69D45]">
          {isTeacher ? 'Ruang Kelas Belum Tersedia' : 'Belum Bergabung ke Kelas'}
        </p>
        <h3 className="text-xl font-extrabold text-[#163E4B] dark:text-white tracking-tight">
          {isTeacher ? (
            <>
              Mulai Buat <span className="text-[#E69D45]">Kelas Anda</span>
            </>
          ) : (
            <>
              Gabung ke <span className="text-[#E69D45]">Kelas Anda</span>
            </>
          )}
        </h3>
        <p className="text-xs text-[#6E828A] dark:text-[#9CB7C0] leading-relaxed">
          {message || defaultMessage}
        </p>
      </div>

      <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5 relative z-10">
        {isTeacher ? (
          <>
            <button
              onClick={onOpenClassModal}
              className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-[#F4A950] hover:bg-[#E59638] text-white text-xs font-bold shadow-[0_8px_20px_rgba(244,169,80,0.35)] flex items-center justify-center gap-2 transition-all cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Kelas Baru</span>
            </button>

            <button
              onClick={onOpenClassModal}
              className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-[#163E4B] hover:bg-[#10303B] text-white text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer whitespace-nowrap"
            >
              <KeyRound className="w-3.5 h-3.5 text-[#F4A950]" />
              <span>Gabung via Kode</span>
            </button>
          </>
        ) : (
          <button
            onClick={onOpenClassModal}
            className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-[#F4A950] hover:bg-[#E59638] text-white text-xs font-bold shadow-[0_8px_20px_rgba(244,169,80,0.35)] flex items-center justify-center gap-2 transition-all cursor-pointer whitespace-nowrap"
          >
            <KeyRound className="w-4 h-4" />
            <span>Masukkan Kode Kelas</span>
          </button>
        )}
      </div>

      <p className="text-[11px] text-[#7B8D93] dark:text-[#8BA6B0] pt-1 relative z-10">
        {isTeacher
          ? 'Tips: Anda dapat menambahkan nama kelas (misal: VII-A, VIII-B), memilih tingkat kelas MTs, serta membagikan kode kelas kepada siswa.'
          : 'Tips: Minta kode kelas (misal: VII-A-701 atau IX-A-891) kepada guru pengampu atau wali kelas Anda.'}
      </p>
    </div>
  );
};
