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
  CheckCircle2,
  GraduationCap,
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
        return <Zap className="w-5 h-5 text-[#E59638]" />;
      case 'Clock':
        return <Clock className="w-5 h-5 text-[#163E4B] dark:text-[#F4A950]" />;
      case 'Award':
        return <Award className="w-5 h-5 text-[#C87A24]" />;
      case 'CalendarCheck':
        return <CalendarCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
      case 'Users':
        return <Users className="w-5 h-5 text-[#163E4B] dark:text-[#8FB4C1]" />;
      default:
        return <Star className="w-5 h-5 text-[#F4A950]" />;
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 bg-[#0B1E25]/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#132F3A] border border-[#E8ECEE] dark:border-[#214B59] rounded-[28px] w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-[0_20px_50px_rgba(22,62,75,0.2)] p-5 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FCEADE] dark:bg-[#F4A950]/15 text-[#163E4B] dark:text-[#F4A950] flex items-center justify-center font-bold border border-[#F4D3BA] dark:border-[#F4A950]/30">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[#163E4B] dark:text-white flex items-center gap-2 flex-wrap">
                <span>Prestasi & Gamifikasi Belajar</span>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#FCEADE] text-[#8A4F14] dark:bg-[#F4A950]/20 dark:text-[#F4A950]">
                  XP & Lencana
                </span>
              </h3>
              <p className="text-xs text-[#6E828A] dark:text-[#96B2BC]">
                Sistem Poin Prestasi & Kedisiplinan Siswa
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#8A9BA2] hover:text-[#163E4B] dark:hover:text-white rounded-full hover:bg-[#F7F7F5] dark:hover:bg-[#193B48] cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher: Prestasi Saya vs Penjelasan Sistem XP */}
        <div className="flex rounded-full bg-[#F7F7F5] dark:bg-[#0E242D] p-1 border border-[#E8ECEE] dark:border-[#214B59]">
          <button
            onClick={() => setActiveTab('prestasi')}
            className={`flex-1 py-2 text-xs font-bold rounded-full transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'prestasi'
                ? 'bg-[#163E4B] text-white shadow-xs'
                : 'text-[#6E828A] hover:text-[#163E4B] dark:text-[#96B2BC] dark:hover:text-white'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Prestasi & Lencana</span>
          </button>
          <button
            onClick={() => setActiveTab('penjelasan')}
            className={`flex-1 py-2 text-xs font-bold rounded-full transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'penjelasan'
                ? 'bg-[#163E4B] text-white shadow-xs'
                : 'text-[#6E828A] hover:text-[#163E4B] dark:text-[#96B2BC] dark:hover:text-white'
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
            <div className="relative overflow-hidden p-4 rounded-[24px] bg-[#163E4B] text-white shadow-[0_12px_28px_rgba(22,62,75,0.2)] space-y-3">
              {/* Decorative concentric rings */}
              <div className="pointer-events-none absolute -right-8 -top-8 w-28 h-28 rounded-full border-[10px] border-white/[0.04]" />
              <div className="pointer-events-none absolute -right-2 -top-2 w-16 h-16 rounded-full border-[6px] border-white/[0.05]" />

              <div className="relative flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#9BBAC4]">
                    Tingkat Kemahiran ({currentUser.name})
                  </span>
                  <h4 className="text-lg font-extrabold flex items-center gap-2 mt-0.5">
                    <span>Level {userLevel.level}: {userLevel.title}</span>
                  </h4>
                </div>

                <div className="text-right">
                  <span className="text-[11px] text-[#9BBAC4] block font-medium">Total Poin</span>
                  <span className="text-xl font-extrabold text-[#F4A950] flex items-center justify-end gap-1 tabular-nums">
                    <Sparkles className="w-4 h-4" />
                    {userXp} XP
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="relative space-y-1">
                <div className="w-full bg-white/15 h-2.5 rounded-full overflow-hidden p-0.5">
                  <div
                    className="bg-[#F4A950] h-full rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-[#B8D0D8] font-mono tabular-nums">
                  <span>{userXp} XP</span>
                  <span>Menuju Level {userLevel.level + 1} ({userLevel.nextXp} XP)</span>
                </div>
              </div>
            </div>

            {/* Rincian Perolehan & Pengurangan XP */}
            <div className="p-4 rounded-[24px] bg-[#F7F7F5] dark:bg-[#0E242D] border border-[#E8ECEE] dark:border-[#214B59] space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs text-[#163E4B] dark:text-white flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-[#E59638]" />
                  <span>Rincian Perhitungan XP Siswa</span>
                </h4>
                <button
                  onClick={() => setActiveTab('penjelasan')}
                  className="text-[10px] font-bold text-[#163E4B] dark:text-[#F4A950] hover:underline cursor-pointer flex items-center gap-0.5"
                >
                  <span>Lihat Aturan</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-2xl bg-white dark:bg-[#132F3A] border border-[#E8ECEE] dark:border-[#214B59] space-y-0.5">
                  <span className="text-[10px] text-[#7A8E96] font-medium block">Modal Awal:</span>
                  <span className="font-bold text-[#163E4B] dark:text-white tabular-nums">+{xpBreakdown.baseXp} XP</span>
                </div>

                <div className="p-2.5 rounded-2xl bg-[#FCEADE] dark:bg-[#F4A950]/15 border border-[#F4D3BA] dark:border-[#F4A950]/30 space-y-0.5">
                  <span className="text-[10px] text-[#8A4F14] dark:text-[#F4A950] font-bold flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[#E59638]" />
                    Verifikasi Guru:
                  </span>
                  <span className="font-extrabold text-[#163E4B] dark:text-[#FCEADE] tabular-nums">
                    +{xpBreakdown.verifiedBonusXp} XP
                  </span>
                </div>

                <div className="p-2.5 rounded-2xl bg-white dark:bg-[#132F3A] border border-[#E8ECEE] dark:border-[#214B59] space-y-0.5">
                  <span className="text-[10px] text-[#6E828A] dark:text-[#96B2BC] font-medium block">Lencana Dibuka:</span>
                  <span className="font-bold text-[#163E4B] dark:text-[#F4A950] tabular-nums">+{xpBreakdown.badgesXp} XP</span>
                </div>

                <div className="p-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-900/60 space-y-0.5">
                  <span className="text-[10px] text-rose-700 dark:text-rose-300 font-bold flex items-center gap-1">
                    <Flame className="w-3 h-3 text-rose-500" />
                    Pinalti Kadaluwarsa:
                  </span>
                  <span className="font-extrabold text-rose-600 dark:text-rose-400 tabular-nums">
                    -{xpBreakdown.expiredPenaltyXp} XP
                  </span>
                </div>
              </div>

              {/* Expired assignments list if any */}
              {expiredUnsubmittedAssignments.length > 0 && (
                <div className="mt-2 pt-2 border-t border-[#E8ECEE] dark:border-[#214B59] space-y-1.5">
                  <div className="flex items-center gap-1 text-[11px] font-bold text-rose-700 dark:text-rose-400">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>{expiredUnsubmittedAssignments.length} Tugas Melewati Batas Waktu:</span>
                  </div>
                  <div className="space-y-1 max-h-28 overflow-y-auto pr-1">
                    {expiredUnsubmittedAssignments.map((a) => (
                      <div
                        key={a.id}
                        className="p-1.5 rounded-xl bg-rose-100/70 dark:bg-rose-950/70 text-[11px] flex items-center justify-between text-rose-900 dark:text-rose-200"
                      >
                        <span className="truncate max-w-[200px] font-medium">{a.title}</span>
                        <span className="font-bold shrink-0 text-rose-600 dark:text-rose-400 tabular-nums">
                          -{a.xpPenaltyOverdue || 30} XP
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-[#6E828A] dark:text-[#96B2BC] italic">
                    * Kumpulkan tugas sebelum tenggat agar tidak terkena pemotongan XP ini.
                  </p>
                </div>
              )}
            </div>

            {/* Badges Collection List */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs text-[#163E4B] dark:text-white flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-[#E59638]" />
                  <span>Koleksi Lencana Prestasi ({userBadges.filter((b) => b.isUnlocked).length}/{userBadges.length} Terbuka)</span>
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {userBadges.map((badge) => {
                  return (
                    <div
                      key={badge.id}
                      className={`p-3 rounded-2xl border transition-all ${
                        badge.isUnlocked
                          ? 'bg-white dark:bg-[#193B48] border-[#E8ECEE] dark:border-[#214B59] shadow-[0_4px_14px_rgba(22,62,75,0.04)]'
                          : 'bg-[#F7F7F5] dark:bg-[#0E242D]/70 border-dashed border-[#D5DFE3] dark:border-[#214B59] opacity-65'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            badge.isUnlocked
                              ? 'bg-[#FCEADE] dark:bg-[#F4A950]/15'
                              : 'bg-[#EAEFEF] dark:bg-[#132F3A]'
                          }`}
                        >
                          {badge.isUnlocked ? (
                            getBadgeIcon(badge.icon)
                          ) : (
                            <Lock className="w-4 h-4 text-[#8A9BA2]" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <h5 className="font-bold text-xs text-[#163E4B] dark:text-white truncate">
                              {badge.name}
                            </h5>
                            <span className="text-[10px] font-bold text-[#C87A24] dark:text-[#F4A950] shrink-0 tabular-nums">
                              +{badge.xpReward} XP
                            </span>
                          </div>
                          <p className="text-[11px] text-[#6E828A] dark:text-[#96B2BC] line-clamp-2 mt-0.5 leading-tight">
                            {badge.description}
                          </p>

                          <div className="mt-2 flex items-center justify-between text-[10px]">
                            {badge.isUnlocked ? (
                              <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" /> Terbuka
                              </span>
                            ) : (
                              <span className="text-[#8A9BA2] italic">Belum tercapai</span>
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
            <div className="p-4 rounded-[24px] bg-[#FCEADE] dark:bg-[#F4A950]/15 border border-[#F4D3BA] dark:border-[#F4A950]/30 space-y-2">
              <div className="flex items-center gap-2 text-[#163E4B] dark:text-[#FCEADE]">
                <Sparkles className="w-4 h-4 text-[#E59638] fill-[#F4A950]" />
                <h4 className="font-extrabold text-sm">Apa Itu XP (Experience Points)?</h4>
              </div>
              <p className="text-[#4B636D] dark:text-[#D2E2E8] leading-relaxed text-[11px]">
                <b>XP (Experience Points)</b> adalah sistem poin keaktifan, kedisiplinan, dan prestasi belajar siswa di <b>ClassyWork</b>. XP memberikan penghargaan langsung bagi siswa yang rajin mengumpulkan tugas tepat waktu dan meraih nilai tinggi dari guru.
              </p>
            </div>

            {/* How to Earn XP */}
            <div className="p-4 rounded-[24px] bg-[#F7F7F5] dark:bg-[#0E242D] border border-[#E8ECEE] dark:border-[#214B59] space-y-2.5">
              <div className="flex items-center gap-2 text-[#163E4B] dark:text-white font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Cara Menambah XP (+XP Menyala)</span>
              </div>
              <div className="space-y-2">
                <div className="p-2.5 rounded-2xl bg-white dark:bg-[#132F3A] border border-[#E8ECEE] dark:border-[#214B59] flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-extrabold flex items-center justify-center shrink-0 text-xs tabular-nums">
                    +75
                  </div>
                  <div>
                    <span className="font-bold text-[#163E4B] dark:text-white block">
                      Verifikasi Pengumpulan Tugas Tepat Waktu
                    </span>
                    <span className="text-[11px] text-[#6E828A] dark:text-[#96B2BC]">
                      Saat siswa mengumpulkan tugas dan guru memverifikasinya, XP otomatis menyala dan bertambah <b>+75 XP</b>.
                    </span>
                  </div>
                </div>

                <div className="p-2.5 rounded-2xl bg-white dark:bg-[#132F3A] border border-[#E8ECEE] dark:border-[#214B59] flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#FCEADE] dark:bg-[#F4A950]/20 text-[#8A4F14] dark:text-[#F4A950] font-extrabold flex items-center justify-center shrink-0 text-xs tabular-nums">
                    +50
                  </div>
                  <div>
                    <span className="font-bold text-[#163E4B] dark:text-white block">
                      Bonus Nilai Unggul (Nilai ≥ 85)
                    </span>
                    <span className="text-[11px] text-[#6E828A] dark:text-[#96B2BC]">
                      Jika guru memberikan nilai <b>85 atau lebih</b>, siswa mendapatkan tambahan bonus <b>+50 XP</b>.
                    </span>
                  </div>
                </div>

                <div className="p-2.5 rounded-2xl bg-white dark:bg-[#132F3A] border border-[#E8ECEE] dark:border-[#214B59] flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#163E4B] text-[#F4A950] font-extrabold flex items-center justify-center shrink-0 text-xs tabular-nums">
                    +100
                  </div>
                  <div>
                    <span className="font-bold text-[#163E4B] dark:text-white block">
                      Membuka Lencana Prestasi (Badges)
                    </span>
                    <span className="text-[11px] text-[#6E828A] dark:text-[#96B2BC]">
                      Setiap kali mencapai milestone (seperti tugas pertama, pengumpulan tepat waktu, atau partisipasi kelas).
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* XP Deductions / Penalties */}
            <div className="p-4 rounded-[24px] bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 space-y-2">
              <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300 font-bold">
                <Flame className="w-4 h-4 text-rose-600" />
                <span>Pengurangan XP (Pinalti Kedisiplinan)</span>
              </div>
              <div className="p-2.5 rounded-2xl bg-white dark:bg-[#132F3A] border border-rose-100 dark:border-rose-900/50 flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-900/70 text-rose-700 dark:text-rose-300 font-extrabold flex items-center justify-center shrink-0 text-xs tabular-nums">
                  -30
                </div>
                <div>
                  <span className="font-bold text-[#163E4B] dark:text-white block">
                    Tugas Kadaluwarsa (Lewat Tenggat Waktu)
                  </span>
                  <span className="text-[11px] text-[#6E828A] dark:text-[#96B2BC]">
                    Jika siswa tidak mengumpulkan tugas hingga waktu deadline habis, sistem otomatis mencatat pinalti <b>-30 XP</b> per tugas. Siswa dapat mengumpulkan tugas terlambat dengan izin guru agar dinilai.
                  </span>
                </div>
              </div>
            </div>

            {/* Level Tiers Table */}
            <div className="p-4 rounded-[24px] bg-[#F7F7F5] dark:bg-[#0E242D] border border-[#E8ECEE] dark:border-[#214B59] space-y-2">
              <div className="flex items-center gap-2 text-[#163E4B] dark:text-white font-bold">
                <GraduationCap className="w-4 h-4 text-[#E59638]" />
                <span>Jenjang Level & Gelar Akademik</span>
              </div>
              <div className="divide-y divide-[#E8ECEE] dark:divide-[#214B59] border border-[#E8ECEE] dark:border-[#214B59] rounded-2xl overflow-hidden bg-white dark:bg-[#132F3A]">
                {levelTiers.map((tier) => (
                  <div key={tier.level} className="p-2.5 flex items-center justify-between gap-2 text-[11px]">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono font-bold w-6 h-6 rounded-full bg-[#FCEADE] dark:bg-[#F4A950]/20 text-[#163E4B] dark:text-[#F4A950] flex items-center justify-center text-[10px]">
                        L{tier.level}
                      </span>
                      <div>
                        <span className="font-bold text-[#163E4B] dark:text-white">{tier.title}</span>
                        <span className="text-[10px] text-[#7A8E96] block">{tier.desc}</span>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-[#C87A24] dark:text-[#F4A950] text-[10px] shrink-0 tabular-nums">
                      {tier.xpReq}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-2 flex items-center justify-between border-t border-[#E8ECEE] dark:border-[#214B59] text-xs">
          <span className="text-[#8A9BA2] text-[11px]">
            {activeTab === 'prestasi' ? 'ClassyWork Gamifikasi v2.0' : 'Sistem Penilaian Terintegrasi'}
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#F4A950] hover:bg-[#E59638] text-[#163E4B] rounded-full text-xs font-extrabold cursor-pointer shadow-xs transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
