import React from 'react';
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
} from 'lucide-react';

interface GamificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GamificationModal: React.FC<GamificationModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    userXp,
    userBadges,
    userLevel,
    currentUser,
    xpBreakdown,
    expiredUnsubmittedAssignments,
  } = useApp();

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
                  XP & Badge
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pencapaian aktif {currentUser.name}
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

        {/* Level & XP Hero Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-700 text-white shadow-md space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-200">
                Tingkat Kemahiran
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

        {/* Rincian Perolehan & Pengurangan XP (Transparansi Poin) */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 space-y-2.5">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Rincian Perhitungan XP Siswa</span>
            </h4>
            <span className="text-[10px] text-slate-400">Sistem Otomatis</span>
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

        {/* Footer */}
        <div className="pt-2 flex justify-end border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
