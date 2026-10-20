import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Trophy,
  Award,
  Zap,
  Clock,
  CalendarCheck,
  Users,
  CheckCircle,
  Lock,
  Sparkles,
  X,
  Star,
  ChevronRight,
  Flame,
  AlertTriangle,
  TrendingUp,
  BookOpen,
  HelpCircle,
  CheckCircle2,
  GraduationCap,
  ShieldCheck,
} from 'lucide-react';

interface GamificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'prestasi' | 'penjelasan';
}

export const GamificationModal: React.FC<GamificationModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'prestasi',
}) => {
  const {
    userXp,
    userBadges,
    userLevel,
    currentUser,
    xpBreakdown,
    expiredUnsubmittedAssignments,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'prestasi' | 'penjelasan'>(defaultTab);

  if (!isOpen) return null;

  // Calculate percentage to next level
  const range = userLevel.nextXp - userLevel.prevXp;
  const currentInRange = userXp - userLevel.prevXp;
  const progressPercent = Math.min(100, Math.max(0, Math.round((currentInRange / range) * 100)));

  const getBadgeIcon = (iconName: string) => {
    switch (iconName) {
      case 'Zap':
        return <Zap className="w-5 h-5 text-amber-500" />;
      case 'Clock':
        return <Clock className="w-5 h-5 text-indigo-500" />;
      case 'Award':
        return <Award className="w-5 h-5 text-purple-500" />;
      case 'CalendarCheck':
        return <CalendarCheck className="w-5 h-5 text-emerald-500" />;
      case 'Users':
        return <Users className="w-5 h-5 text-sky-500" />;
      default:
        return <Star className="w-5 h-5 text-amber-500" />;
    }
  };

  const levelTiers = [
    { level: 1, title: 'Murid Baru', xpReq: '0 - 99 XP', desc: 'Memulai perjalanan belajar di kelas.' },
    { level: 2, title: 'Pelajar Rajin', xpReq: '100 - 249 XP', desc: 'Mulai rutin mengumpulkan tugas.' },
    { level: 3, title: 'Bintang Kelas', xpReq: '250 - 449 XP', desc: 'Disiplin dan aktif dalam KBM harian.' },
    { level: 4, title: 'Penjelajah Ilmu', xpReq: '450 - 699 XP', desc: 'Nilai tugas konsisten di atas rata-rata.' },
    { level: 5, title: 'Master Tugas', xpReq: '700 - 999 XP', desc: 'Semua tugas terverifikasi tepat waktu.' },
    { level: 6, title: 'Cendekiawan Muda', xpReq: '1000 - 1499 XP', desc: 'Menguasai materi dan lencana prestasi.' },
    { level: 7, title: 'Teladan Sekolah', xpReq: '1500+ XP', desc: 'Peringkat teladan dengan integritas tinggi.' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl p-5 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <span>Prestasi & Gamifikasi Belajar</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                  XP & Lencana
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Sistem Poin Prestasi & Kedisiplinan Siswa
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher: Prestasi Saya vs Penjelasan Sistem XP */}
        <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800/80 p-1">
          <button
            onClick={() => setActiveTab('prestasi')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'prestasi'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Prestasi & Lencana</span>
          </button>
          <button
            onClick={() => setActiveTab('penjelasan')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'penjelasan'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Penjelasan Sistem XP</span>
          </button>
        </div>

        {/* TAB 1: PRESTASI SAYA */}
        {activeTab === 'prestasi' && (
          <div className="space-y-4">
            {/* Level & XP Hero Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-700 text-white shadow-md space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-200">
                    Tingkat Kemahiran ({currentUser.name})
                  </span>
                  <h4 className="text-lg font-black flex items-center gap-2">
                    <span>Level {userLevel.level}: {userLevel.title}</span>
                  </h4>
                </div>

                <div className="text-right">
                  <span className="text-xs text-indigo-200 block font-medium">Total Poin</span>
                  <span className="text-xl font-black text-amber-300 flex items-center justify-end gap-1">
                    <Sparkles className="w-4 h-4" />
                    {userXp} XP
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="w-full bg-indigo-900/60 h-2.5 rounded-full overflow-hidden p-0.5">
                  <div
                    className="bg-amber-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-indigo-200 font-mono">
                  <span>{userXp} XP</span>
                  <span>Menuju Level {userLevel.level + 1} ({userLevel.nextXp} XP)</span>
                </div>
              </div>
            </div>

            {/* Rincian Perolehan & Pengurangan XP */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>Rincian Perhitungan XP Siswa</span>
                </h4>
                <button
                  onClick={() => setActiveTab('penjelasan')}
                  className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer flex items-center gap-0.5"
                >
                  <span>Lihat Aturan</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 space-y-0.5">
                  <span className="text-[10px] text-slate-400 font-medium block">Modal Awal:</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">+{xpBreakdown.baseXp} XP</span>
                </div>

                <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60 space-y-0.5">
                  <span className="text-[10px] text-amber-700 dark:text-amber-300 font-bold block flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    Verifikasi Guru:
                  </span>
                  <span className="font-black text-amber-600 dark:text-amber-400">
                    +{xpBreakdown.verifiedBonusXp} XP
                  </span>
                </div>

                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-900/60 space-y-0.5">
                  <span className="text-[10px] text-indigo-600 dark:text-indigo-300 font-medium block">Lencana Dibuka:</span>
                  <span className="font-bold text-indigo-700 dark:text-indigo-300">+{xpBreakdown.badgesXp} XP</span>
                </div>

                <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-900/60 space-y-0.5">
                  <span className="text-[10px] text-rose-700 dark:text-rose-300 font-bold block flex items-center gap-1">
                    <Flame className="w-3 h-3 text-rose-500" />
                    Pinalti Kadaluwarsa:
                  </span>
                  <span className="font-black text-rose-600 dark:text-rose-400">
                    -{xpBreakdown.expiredPenaltyXp} XP
                  </span>
                </div>
              </div>

              {/* Expired assignments list if any */}
              {expiredUnsubmittedAssignments.length > 0 && (
                <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700 space-y-1.5">
                  <div className="flex items-center gap-1 text-[11px] font-bold text-rose-700 dark:text-rose-400">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>{expiredUnsubmittedAssignments.length} Tugas Melewati Batas Waktu:</span>
                  </div>
                  <div className="space-y-1 max-h-28 overflow-y-auto pr-1">
                    {expiredUnsubmittedAssignments.map((a) => (
                      <div
                        key={a.id}
                        className="p-1.5 rounded-lg bg-rose-100/70 dark:bg-rose-950/70 text-[11px] flex items-center justify-between text-rose-900 dark:text-rose-200"
                      >
                        <span className="truncate max-w-[200px] font-medium">{a.title}</span>
                        <span className="font-bold shrink-0 text-rose-600 dark:text-rose-400">
                          -{a.xpPenaltyOverdue || 30} XP
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 italic">
                    * Kumpulkan tugas sebelum tenggat agar tidak terkena pemotongan XP ini.
                  </p>
                </div>
              )}
            </div>

            {/* Badges Collection List */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-indigo-500" />
                  <span>Koleksi Lencana Prestasi ({userBadges.filter((b) => b.isUnlocked).length}/{userBadges.length} Terbuka)</span>
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {userBadges.map((badge) => {
                  return (
                    <div
                      key={badge.id}
                      className={`p-3 rounded-xl border transition-all ${
                        badge.isUnlocked
                          ? 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 shadow-2xs'
                          : 'bg-slate-50 dark:bg-slate-900/60 border-dashed border-slate-200 dark:border-slate-800 opacity-60'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            badge.isUnlocked
                              ? 'bg-slate-100 dark:bg-slate-700/80 shadow-2xs'
                              : 'bg-slate-200/50 dark:bg-slate-800'
                          }`}
                        >
                          {badge.isUnlocked ? (
                            getBadgeIcon(badge.icon)
                          ) : (
                            <Lock className="w-4 h-4 text-slate-400" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <h5 className="font-bold text-xs text-slate-900 dark:text-white truncate">
                              {badge.name}
                            </h5>
                            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 shrink-0">
                              +{badge.xpReward} XP
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5 leading-tight">
                            {badge.description}
                          </p>

                          <div className="mt-2 flex items-center justify-between text-[10px]">
                            {badge.isUnlocked ? (
                              <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" /> Terbuka
                              </span>
                            ) : (
                              <span className="text-slate-400 italic">Belum tercapai</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PENJELASAN LENGKAP SISTEM XP */}
        {activeTab === 'penjelasan' && (
          <div className="space-y-4 text-xs">
            {/* Overview Box */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-indigo-500/10 to-teal-500/15 border border-amber-300 dark:border-amber-800/60 space-y-2">
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300">
                <Sparkles className="w-4 h-4 text-amber-600 fill-amber-500" />
                <h4 className="font-extrabold text-sm">Apa Itu XP (Experience Points)?</h4>
              </div>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-[11px]">
                <b>XP (Experience Points)</b> adalah sistem poin keaktifan, kedisiplinan, dan prestasi belajar siswa di <b>ClassyWork</b>. XP memberikan penghargaan langsung bagi siswa yang rajin mengumpulkan tugas tepat waktu dan meraih nilai tinggi dari guru.
              </p>
            </div>

            {/* How to Earn XP */}
            <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 space-y-2.5">
              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Cara Menambah XP (+XP Menyala)</span>
              </div>
              <div className="space-y-2">
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-emerald-100 dark:border-emerald-900/50 flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/70 text-emerald-700 dark:text-emerald-300 font-extrabold flex items-center justify-center shrink-0 text-xs">
                    +75
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200 block">
                      Verifikasi Pengumpulan Tugas Tepat Waktu
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Saat siswa mengumpulkan tugas dan guru memverifikasinya, XP otomatis menyala dan bertambah <b>+75 XP</b>.
                    </span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-amber-100 dark:border-amber-900/50 flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-900/70 text-amber-700 dark:text-amber-300 font-extrabold flex items-center justify-center shrink-0 text-xs">
                    +50
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200 block">
                      Bonus Nilai Unggul (Nilai ≥ 85)
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Jika guru memberikan nilai <b>85 atau lebih</b>, siswa mendapatkan tambahan bonus <b>+50 XP</b>.
                    </span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-indigo-100 dark:border-indigo-900/50 flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-900/70 text-indigo-700 dark:text-indigo-300 font-extrabold flex items-center justify-center shrink-0 text-xs">
                    +100
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200 block">
                      Membuka Lencana Prestasi (Badges)
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Setiap kali mencapai milestone (seperti tugas pertama, pengumpulan tepat waktu, atau partisipasi kelas).
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* XP Deductions / Penalties */}
            <div className="p-3.5 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 space-y-2">
              <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300 font-bold">
                <Flame className="w-4 h-4 text-rose-600" />
                <span>Pengurangan XP (Pinalti Kedisiplinan)</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-rose-100 dark:border-rose-900/50 flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-rose-100 dark:bg-rose-900/70 text-rose-700 dark:text-rose-300 font-extrabold flex items-center justify-center shrink-0 text-xs">
                  -30
                </div>
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">
                    Tugas Kadaluwarsa (Lewat Tenggat Waktu)
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Jika siswa tidak mengumpulkan tugas hingga waktu deadline habis, sistem otomatis mencatat pinalti <b>-30 XP</b> per tugas. Siswa dapat mengumpulkan tugas terlambat dengan izin guru agar dinilai.
                  </span>
                </div>
              </div>
            </div>

            {/* Level Tiers Table */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 space-y-2">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold">
                <GraduationCap className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Jenjang Level & Gelar Akademik</span>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
                {levelTiers.map((tier) => (
                  <div key={tier.level} className="p-2 flex items-center justify-between gap-2 text-[11px]">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold w-6 h-6 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 flex items-center justify-center text-[10px]">
                        L{tier.level}
                      </span>
                      <div>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{tier.title}</span>
                        <span className="text-[10px] text-slate-400 block">{tier.desc}</span>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 text-[10px] shrink-0">
                      {tier.xpReq}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 text-xs">
          <span className="text-slate-400 text-[11px]">
            {activeTab === 'prestasi' ? 'ClassyWork Gamifikasi v2.0' : 'Sistem Penilaian Terintegrasi'}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-xs transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
