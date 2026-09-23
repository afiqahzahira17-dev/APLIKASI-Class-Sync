import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Users,
  Copy,
  Check,
  Plus,
  KeyRound,
  GraduationCap,
  School,
  IdCard,
  UserCheck,
  Share2,
  ChevronRight,
  ArrowRight,
  Trash2,
} from 'lucide-react';

interface ClassDetailViewProps {
  onOpenClassModal: () => void;
}

export const ClassDetailView: React.FC<ClassDetailViewProps> = ({ onOpenClassModal }) => {
  const { currentUser, activeClass, classes, setActiveClass, deleteClass, clearAllClasses, allDemoUsers } =
    useApp();
  const [copiedCode, setCopiedCode] = useState(false);
  const [deletingClassId, setDeletingClassId] = useState<string | null>(null);

  const handleCopy = () => {
    if (!activeClass) return;
    navigator.clipboard.writeText(activeClass.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleDeleteClass = (clsId: string, clsName: string) => {
    if (window.confirm(`Hapus kelas "${clsName}"? Semua jadwal dan tugas di kelas ini akan ikut terhapus.`)) {
      deleteClass(clsId);
    }
  };

  // Filter students belonging to this class
  const classStudents = allDemoUsers.filter((u) => u.role === 'student');

  return (
    <div className="space-y-4 pb-24">
      {/* Current User Profile Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3.5">
          <img
            src={currentUser.avatarUrl}
            alt={currentUser.name}
            className="w-12 h-12 rounded-xl object-cover border border-slate-300 dark:border-slate-700"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base text-slate-900 dark:text-white truncate">
                {currentUser.name}
              </h3>
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize ${
                  currentUser.role === 'teacher'
                    ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                    : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                }`}
              >
                {currentUser.role === 'teacher' ? 'Guru' : 'Siswa'}
              </span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5 flex items-center gap-2">
              <span>{currentUser.identifierNumber}</span>
              <span>•</span>
              <span>{currentUser.schoolName}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Multi-Class Section: Daftar Kelas Tersedia */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Daftar Kelas Anda ({classes.length} Kelas)</span>
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {classes.length === 0
                ? 'Semua kelas kosong. Mulai dengan membuat kelas sendiri.'
                : 'Pilih kelas untuk melihat jadwal pelajaran dan tugas masing-masing'}
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            {classes.length > 0 && (
              <button
                onClick={() => {
                  if (window.confirm('Hapus semua kelas yang terdaftar? Tindakan ini tidak dapat dibatalkan.')) {
                    clearAllClasses();
                  }
                }}
                className="px-2.5 py-1.5 text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors shrink-0"
                title="Hapus Semua Kelas"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Hapus Semua</span>
              </button>
            )}
            <button
              onClick={onOpenClassModal}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm transition-colors shrink-0 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Buat Kelas Baru</span>
            </button>
          </div>
        </div>

        {classes.length === 0 ? (
          <div className="text-center py-10 px-4 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30">
            <School className="w-10 h-10 text-indigo-500 mx-auto mb-2.5 opacity-80" />
            <h5 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              Belum Ada Kelas yang Terdaftar
            </h5>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto leading-relaxed">
              Semua kelas dummy telah dihapus sesuai permintaan. Anda sekarang dapat membuat kelas sendiri dengan nama, tingkat (Kelas 7, 8, atau 9 MTs), dan deskripsi sesuai keinginan Anda.
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <button
                onClick={onOpenClassModal}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Buat Kelas Pertama Saya</span>
              </button>
              <button
                onClick={onOpenClassModal}
                className="px-3.5 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                <span>Gabung via Kode</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {classes.map((cls) => {
              const isActive = activeClass && cls.id === activeClass.id;
              return (
                <div
                  key={cls.id}
                  className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                    isActive
                      ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 ring-1 ring-indigo-500/30'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        {cls.gradeLevel}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {isActive ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-600 text-white flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            Sedang Aktif
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono text-slate-400">
                            {cls.code}
                          </span>
                        )}
                        <button
                          onClick={() => handleDeleteClass(cls.id, cls.name)}
                          className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-colors"
                          title={`Hapus kelas ${cls.name}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h5 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">
                      {cls.name}
                    </h5>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Wali: {cls.teacherName}
                    </p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {cls.studentCount} Siswa
                    </span>

                    {!isActive ? (
                      <button
                        onClick={() => setActiveClass(cls)}
                        className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1 py-0.5 px-2 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        <span>Buka Kelas</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                        Aktif
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Active Class Detail & Code Box (when a class is active) */}
      {activeClass && (
        <>
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                  Kelas Aktif Saat Ini
                </span>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  {activeClass.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {activeClass.description}
                </p>
              </div>

              <div className="text-right shrink-0">
                <span className="text-xs text-slate-400 block font-medium">T.A</span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {activeClass.academicYear}
                </span>
              </div>
            </div>

            {/* Shareable Class Code Box */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2">
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                  Kode Kelas (Untuk Siswa Bergabung)
                </p>
                <p className="font-mono text-base font-extrabold text-indigo-600 dark:text-indigo-400">
                  {activeClass.code}
                </p>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleCopy}
                  className="px-3 py-1.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-semibold hover:bg-slate-100 flex items-center gap-1 transition-all cursor-pointer"
                >
                  {copiedCode ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600 text-xs">Tersalin</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Salin</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: `Gabung Kelas ${activeClass.name}`,
                        text: `Kode kelas ${activeClass.name}: ${activeClass.code}`,
                      });
                    } else {
                      handleCopy();
                    }
                  }}
                  className="p-1.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Bagikan"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Roster of Classmates / Students */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  Siswa di {activeClass.name}
                </h4>
              </div>
              <span className="text-xs text-slate-400 font-medium">
                {classStudents.length} Siswa Terdaftar
              </span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {classStudents.map((student) => (
                <div key={student.id} className="py-2 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={student.avatarUrl}
                      alt={student.name}
                      className="w-7 h-7 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                    />
                    <div>
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        {student.name}
                        {student.id === currentUser.id && (
                          <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                            Anda
                          </span>
                        )}
                      </p>
                      <p className="text-[11px] text-slate-400 font-mono">
                        {student.identifierNumber}
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                    Siswa Aktif
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
