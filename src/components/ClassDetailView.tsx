import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AVATAR_STUDENT_SVG } from '../data/mockData';
import { TeacherPhoneVerificationModal } from './TeacherPhoneVerificationModal';
import {
  Users,
  Copy,
  Check,
  Plus,
  KeyRound,
  GraduationCap,
  School,
  Share2,
  ArrowRight,
  Trash2,
  Trophy,
  Sparkles,
  MessageCircle,
  ShieldCheck,
  LogOut,
  Layers,
  Link2,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface ClassDetailViewProps {
  onOpenClassModal: () => void;
}

export const ClassDetailView: React.FC<ClassDetailViewProps> = ({ onOpenClassModal }) => {
  const {
    currentUser,
    registeredUsers,
    activeClass,
    classes,
    setActiveClass,
    isAllClassesView,
    setIsAllClassesView,
    deleteClass,
    leaveClass,
    clearAllClasses,
    logout,
    assignments,
    submissions,
    userXp,
    userLevel,
    userBadges,
    activeLiveClass,
    setActiveTab,
    updateUserPassword,
  } = useApp();
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLoginUrl, setCopiedLoginUrl] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmClearAll, setConfirmClearAll] = useState(false);

  const isTeacher = currentUser.role === 'teacher';
  const isDefaultStudentPass = !isTeacher && !currentUser.hasChangedPassword;
  const [showPasswordEditor, setShowPasswordEditor] = useState(false);
  const [oldPasswordInput, setOldPasswordInput] = useState(isDefaultStudentPass ? '0000' : '');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [showPassChars, setShowPassChars] = useState(false);
  const [passNotice, setPassNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  React.useEffect(() => {
    setOldPasswordInput(!isTeacher && !currentUser.hasChangedPassword ? '0000' : '');
    setNewPasswordInput('');
    setPassNotice(null);
  }, [currentUser.id, currentUser.hasChangedPassword, isTeacher]);

  const handleSaveNewPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPassNotice(null);
    const res = updateUserPassword(oldPasswordInput, newPasswordInput);
    if (res.success) {
      setPassNotice({ type: 'success', text: res.message });
      setOldPasswordInput('');
      setNewPasswordInput('');
    } else {
      setPassNotice({ type: 'error', text: res.message });
    }
  };

  const handleCopy = () => {
    if (!activeClass) return;
    navigator.clipboard.writeText(activeClass.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLoginLink = () => {
    const loginUrl = `${window.location.origin}/?portal=siswa`;
    navigator.clipboard.writeText(loginUrl);
    setCopiedLoginUrl(true);
    setTimeout(() => setCopiedLoginUrl(false), 2000);
  };

  const classStudents = React.useMemo(() => {
    if (!activeClass) return [];
    const studentMap = new Map<
      string,
      {
        id: string;
        name: string;
        avatarUrl: string;
        identifierNumber?: string;
        attendanceNumber?: number;
      }
    >();

    // Include all registered student accounts enrolled in this class
    registeredUsers
      .filter(
        (u) =>
          u.role === 'student' &&
          ((u.joinedClassIds || []).includes(activeClass.id) ||
            (activeClass.memberIds || []).includes(u.id))
      )
      .forEach((stu) => {
        studentMap.set(stu.id, {
          id: stu.id,
          name: stu.name,
          avatarUrl: stu.avatarUrl || AVATAR_STUDENT_SVG,
          identifierNumber: stu.identifierNumber,
          attendanceNumber: stu.attendanceNumber,
        });
      });

    if (
      currentUser.role === 'student' &&
      (currentUser.joinedClassIds || []).includes(activeClass.id)
    ) {
      studentMap.set(currentUser.id, {
        id: currentUser.id,
        name: currentUser.name,
        avatarUrl: currentUser.avatarUrl || AVATAR_STUDENT_SVG,
        identifierNumber: currentUser.identifierNumber,
        attendanceNumber: currentUser.attendanceNumber,
      });
    }

    const classAssignmentIds = new Set(
      assignments.filter((a) => a.classId === activeClass.id).map((a) => a.id)
    );
    submissions
      .filter((s) => classAssignmentIds.has(s.assignmentId))
      .forEach((sub) => {
        if (!studentMap.has(sub.studentId)) {
          studentMap.set(sub.studentId, {
            id: sub.studentId,
            name: sub.studentName,
            avatarUrl:
              sub.studentAvatar && !sub.studentAvatar.includes('unsplash.com')
                ? sub.studentAvatar
                : AVATAR_STUDENT_SVG,
            identifierNumber: 'Siswa Kelas',
            attendanceNumber: sub.attendanceNumber,
          });
        }
      });

    return Array.from(studentMap.values()).sort((a, b) => {
      const numA = a.attendanceNumber ?? 999;
      const numB = b.attendanceNumber ?? 999;
      if (numA !== numB) return numA - numB;
      return a.name.localeCompare(b.name);
    });
  }, [activeClass, currentUser, registeredUsers, assignments, submissions]);

  return (
    <div className="space-y-4 pb-24">
      {/* Current User Profile Card in Deep Petrol #163E4B */}
      <div className="bg-[#163E4B] rounded-[28px] p-5 text-white shadow-[0_14px_34px_rgba(22,62,75,0.2)] relative overflow-hidden">
        <div className="w-36 h-36 rounded-full border-[7px] border-white/[0.05] absolute -right-10 -bottom-12 pointer-events-none" />

        <div className="flex items-start justify-between gap-3.5 flex-wrap relative z-10">
          <div className="flex items-center gap-3.5 min-w-0 flex-1">
            <img
              src={currentUser.avatarUrl || AVATAR_STUDENT_SVG}
              alt={currentUser.name}
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.src = AVATAR_STUDENT_SVG;
              }}
              className="w-14 h-14 rounded-2xl object-cover border-2 border-[#F4A950] shadow-xs shrink-0"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-extrabold text-base sm:text-lg text-white truncate">
                  {currentUser.name}
                </h3>
                <span className="text-xs font-bold text-[#F4A950]">
                  · {currentUser.role === 'teacher' ? 'Guru' : 'Siswa'}
                </span>
              </div>

              <p className="text-xs text-white/75 font-medium mt-0.5 flex items-center gap-2 flex-wrap tabular-nums">
                {!isTeacher && currentUser.attendanceNumber && (
                  <>
                    <span className="text-[#FCEADE] font-bold">
                      Absen #{currentUser.attendanceNumber}
                    </span>
                    <span>·</span>
                  </>
                )}
                <span className="font-mono">{currentUser.identifierNumber}</span>
                <span>·</span>
                <span className="text-[#FCEADE] font-bold">{classes.length} Kelas Aktif</span>
              </p>

              <div className="flex items-center gap-3 mt-2 flex-wrap text-xs">
                <span className="inline-flex items-center gap-1.5 text-[#FCEADE] font-bold tabular-nums">
                  <Trophy className="w-3.5 h-3.5 text-[#F4A950]" />
                  Level {userLevel.level}: {userLevel.title} ({userXp} XP)
                </span>
                <span className="inline-flex items-center gap-1 text-white/80 font-semibold tabular-nums">
                  <Sparkles className="w-3.5 h-3.5 text-[#F4A950]" />
                  {userBadges.filter((b) => b.isUnlocked).length}/{userBadges.length} Lencana
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <button
              type="button"
              onClick={() => {
                setShowPasswordEditor((prev) => !prev);
                setPassNotice(null);
              }}
              className="min-h-[38px] px-3.5 py-2 rounded-full bg-[#F4A950] hover:bg-[#E59638] text-[#163E4B] text-xs font-extrabold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 whitespace-nowrap"
              title="Ubah kata sandi akun Anda"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{showPasswordEditor ? 'Tutup Sandi' : 'Ubah Sandi'}</span>
            </button>

            <button
              type="button"
              onClick={logout}
              className="min-h-[38px] px-3.5 py-2 rounded-full bg-white/12 hover:bg-rose-500/90 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 whitespace-nowrap"
              title="Keluar ke Halaman Login"
            >
              <LogOut className="w-3.5 h-3.5 text-[#F4A950]" />
              <span>Keluar Akun</span>
            </button>
          </div>
        </div>

        {/* Helpful reminder if student is still using initial 0000 password */}
        {isDefaultStudentPass && !showPasswordEditor && (
          <div className="relative z-10 mt-3.5 pt-3 border-t border-white/12 flex items-center justify-between gap-2 flex-wrap text-xs text-[#FCEADE]/90">
            <span>
              Kata sandi Anda saat ini masih sandi awal (<strong className="font-mono">0000</strong>). Anda dapat menggantinya kapan saja.
            </span>
            <button
              type="button"
              onClick={() => setShowPasswordEditor(true)}
              className="text-[#F4A950] hover:underline font-extrabold cursor-pointer whitespace-nowrap"
            >
              Edit Kata Sandi →
            </button>
          </div>
        )}

        {/* Inline Collapsible Password Editor */}
        {showPasswordEditor && (
          <form
            onSubmit={handleSaveNewPassword}
            className="relative z-10 mt-4 pt-4 border-t border-white/15 space-y-3"
          >
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="text-xs font-extrabold text-[#FCEADE]">
                Edit Kata Sandi {isTeacher ? 'Guru' : `Siswa (${currentUser.identifierNumber})`}
              </span>
              {isDefaultStudentPass && (
                <span className="text-[11px] font-mono text-[#F4A950]">
                  Sandi awal saat ini: 0000
                </span>
              )}
            </div>

            {passNotice && (
              <div
                className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 ${
                  passNotice.type === 'success'
                    ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200'
                    : 'bg-rose-950/60 border-rose-500/50 text-rose-200'
                }`}
              >
                {passNotice.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                )}
                <span className="font-medium">{passNotice.text}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end">
              <div className="sm:col-span-4">
                <label className="text-[11px] font-semibold text-white/80 block mb-1">
                  Kata Sandi Lama
                </label>
                <input
                  type={showPassChars ? 'text' : 'password'}
                  required
                  value={oldPasswordInput}
                  onChange={(e) => setOldPasswordInput(e.target.value)}
                  placeholder={isDefaultStudentPass ? '0000' : 'Sandi saat ini'}
                  className="w-full min-h-[40px] px-3 py-2 text-xs font-mono tabular-nums rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/45 focus:outline-hidden focus:ring-2 focus:ring-[#F4A950]"
                />
              </div>

              <div className="sm:col-span-5">
                <label className="text-[11px] font-semibold text-white/80 block mb-1">
                  Kata Sandi Baru Pilihan Anda
                </label>
                <div className="relative">
                  <input
                    type={showPassChars ? 'text' : 'password'}
                    required
                    minLength={3}
                    value={newPasswordInput}
                    onChange={(e) => setNewPasswordInput(e.target.value)}
                    placeholder="Ketik sandi baru (min. 3 karakter)"
                    className="w-full min-h-[40px] pl-3 pr-9 py-2 text-xs font-mono tabular-nums rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/45 focus:outline-hidden focus:ring-2 focus:ring-[#F4A950]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassChars((prev) => !prev)}
                    className="absolute right-2 top-1 min-h-[32px] min-w-[28px] flex items-center justify-center text-white/70 hover:text-white cursor-pointer"
                    title={showPassChars ? 'Sembunyikan' : 'Tampilkan'}
                  >
                    {showPassChars ? (
                      <EyeOff className="w-3.5 h-3.5" />
                    ) : (
                      <Eye className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="sm:col-span-3">
                <button
                  type="submit"
                  className="w-full min-h-[40px] px-4 py-2 rounded-xl bg-[#F4A950] hover:bg-[#E59638] text-[#163E4B] text-xs font-extrabold transition-colors cursor-pointer whitespace-nowrap"
                >
                  Simpan Sandi
                </button>
              </div>
            </div>
          </form>
        )}
      </div>

      {/* Multi-Class Section: Daftar Kelas Tersedia */}
      <div className="bg-white dark:bg-[#13313C] rounded-[28px] p-5 border border-[#ECECE6] dark:border-[#214B59] shadow-[0_8px_26px_rgba(22,62,75,0.05)]">
        <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
          <div>
            <h4 className="font-extrabold text-sm sm:text-base text-[#163E4B] dark:text-white flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-[#F4A950]" />
              <span className="tabular-nums">Daftar Kelas Anda ({classes.length} Kelas)</span>
            </h4>
            <p className="text-xs text-[#6E828A] dark:text-[#9CB7C0]">
              {classes.length === 0
                ? 'Belum ada kelas terdaftar. Anda dapat bergabung atau membuat 2 kelas atau lebih.'
                : 'Anda dapat tergabung di 2 kelas atau lebih dan berpindah kapan saja'}
            </p>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {isTeacher && classes.length > 0 && (
              confirmClearAll ? (
                <div className="flex items-center gap-1 bg-rose-50 dark:bg-rose-950/50 px-2.5 py-1 rounded-full border border-rose-200 dark:border-rose-800">
                  <button
                    type="button"
                    onClick={() => {
                      clearAllClasses();
                      setConfirmClearAll(false);
                    }}
                    className="text-xs font-extrabold text-rose-700 dark:text-rose-300 px-2 cursor-pointer"
                  >
                    Ya, Hapus Semua
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmClearAll(false)}
                    className="text-xs font-bold text-[#6E828A] px-1.5 cursor-pointer"
                  >
                    Batal
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmClearAll(true)}
                  className="px-3 py-1.5 text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40 rounded-full text-xs font-bold flex items-center gap-1 transition-colors shrink-0 cursor-pointer"
                  title="Hapus Semua Kelas"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Hapus Semua</span>
                </button>
              )
            )}
            {isTeacher ? (
              <button
                onClick={onOpenClassModal}
                className="px-4 py-2 bg-[#F4A950] hover:bg-[#E59638] text-white rounded-full text-xs font-bold flex items-center gap-1.5 shadow-[0_6px_16px_rgba(244,169,80,0.35)] transition-colors shrink-0 cursor-pointer whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah / Gabung Kelas</span>
              </button>
            ) : (
              <button
                onClick={onOpenClassModal}
                className="px-4 py-2 bg-[#F4A950] hover:bg-[#E59638] text-white rounded-full text-xs font-bold flex items-center gap-1.5 shadow-[0_6px_16px_rgba(244,169,80,0.35)] transition-colors shrink-0 cursor-pointer whitespace-nowrap"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>+ Gabung Kelas Lain</span>
              </button>
            )}
          </div>
        </div>

        {/* Combined All-Classes View Toggle Banner when enrolled in 2+ classes */}
        {classes.length >= 2 && (
          <div className="mb-4 p-3.5 rounded-2xl bg-[#FCEADE]/75 dark:bg-[#193D4A] border border-[#F4D3BA] dark:border-[#2A596A] flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#163E4B] text-[#F4A950] flex items-center justify-center shrink-0">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-extrabold text-[#163E4B] dark:text-white">
                  Mode Gabungan {classes.length} Kelas
                </p>
                <p className="text-[11px] text-[#5C717A] dark:text-[#C5DBE2]">
                  Tampilkan jadwal, tugas, dan pengumuman dari seluruh kelas Anda dalam satu layar.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsAllClassesView(!isAllClassesView)}
              className={`px-4 py-2 rounded-full text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                isAllClassesView
                  ? 'bg-[#163E4B] text-white shadow-xs'
                  : 'bg-white dark:bg-[#13313C] text-[#163E4B] dark:text-white border border-[#DCE4E7] dark:border-[#245363]'
              }`}
            >
              {isAllClassesView ? '✓ Mode Gabungan Aktif' : 'Aktifkan Semua Kelas'}
            </button>
          </div>
        )}

        {classes.length === 0 ? (
          <div className="text-center py-10 px-4 border border-dashed border-[#D8E0E3] dark:border-[#245363] rounded-[24px] bg-[#F7F7F5] dark:bg-[#0E262F]">
            <School className="w-10 h-10 text-[#F4A950] mx-auto mb-2.5" />
            <h5 className="text-sm font-extrabold text-[#163E4B] dark:text-white">
              {isTeacher ? 'Belum Ada Kelas yang Terdaftar' : 'Belum Bergabung ke Kelas'}
            </h5>
            <p className="text-xs text-[#6E828A] dark:text-[#9CB7C0] mt-1 max-w-md mx-auto leading-relaxed">
              {isTeacher
                ? 'Mulai dengan membuat kelas pertama Anda untuk mengelola jadwal pelajaran, materi, dan pengumpulan tugas.'
                : 'Masukkan kode kelas yang diberikan oleh guru Anda untuk mulai mengakses jadwal dan tugas.'}
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              {isTeacher ? (
                <>
                  <button
                    onClick={onOpenClassModal}
                    className="px-5 py-2.5 bg-[#F4A950] hover:bg-[#E59638] text-white text-xs font-bold rounded-full flex items-center gap-2 shadow-[0_6px_18px_rgba(244,169,80,0.35)] transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Buat Kelas Pertama Saya</span>
                  </button>
                  <button
                    onClick={onOpenClassModal}
                    className="px-4 py-2.5 bg-[#163E4B] hover:bg-[#10303B] text-white text-xs font-bold rounded-full flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-[#F4A950]" />
                    <span>Gabung via Kode</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={onOpenClassModal}
                  className="px-5 py-2.5 bg-[#F4A950] hover:bg-[#E59638] text-white text-xs font-bold rounded-full flex items-center gap-2 shadow-[0_6px_18px_rgba(244,169,80,0.35)] transition-all cursor-pointer"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>Masukkan Kode Kelas</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {classes.map((cls, idx) => {
              const isActive = !isAllClassesView && activeClass && cls.id === activeClass.id;
              const isPeach = !isActive && idx % 2 === 1;
              const isOwnerTeacher = isTeacher && cls.teacherId === currentUser.id;
              return (
                <div
                  key={cls.id}
                  className={`p-4 rounded-[22px] border transition-all flex flex-col justify-between relative overflow-hidden ${
                    isActive
                      ? 'border-[#163E4B] bg-[#163E4B] text-white shadow-md'
                      : isPeach
                      ? 'border-[#F4D3BA] bg-[#FCEADE] text-[#163E4B] dark:bg-[#193D4A] dark:border-[#2A596A] dark:text-white'
                      : 'border-[#ECECE6] dark:border-[#214B59] bg-[#F7F7F5] dark:bg-[#0E262F] text-[#163E4B] dark:text-white'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span
                        className={`text-[11px] font-bold ${
                          isActive ? 'text-[#F4A950]' : 'text-[#6E828A] dark:text-[#9CB7C0]'
                        }`}
                      >
                        {cls.gradeLevel}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {isActive ? (
                          <span className="text-[11px] font-bold text-[#FCEADE] flex items-center gap-1">
                            <Check className="w-3 h-3 text-[#F4A950]" />
                            Sedang Aktif
                          </span>
                        ) : (
                          <span className="text-[11px] font-mono tabular-nums text-[#7B8D93]">
                            {cls.code}
                          </span>
                        )}
                        {isOwnerTeacher ? (
                          confirmDeleteId === cls.id ? (
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  deleteClass(cls.id);
                                  setConfirmDeleteId(null);
                                }}
                                className="px-2 py-0.5 rounded bg-rose-600 text-white text-[10px] font-bold cursor-pointer"
                              >
                                Hapus
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteId(null)}
                                className="px-1.5 py-0.5 text-[10px] font-bold opacity-80 cursor-pointer"
                              >
                                Batal
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(cls.id)}
                              className={`p-1 rounded-lg transition-colors cursor-pointer ${
                                isActive
                                  ? 'text-white/70 hover:text-rose-300'
                                  : 'text-[#7B8D93] hover:text-rose-600'
                              }`}
                              title={`Hapus kelas ${cls.name}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )
                        ) : (
                          <button
                            type="button"
                            onClick={() => leaveClass(cls.id)}
                            className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-colors cursor-pointer ${
                              isActive
                                ? 'bg-white/15 text-white hover:bg-rose-500'
                                : 'text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40'
                            }`}
                            title={`Keluar dari kelas ${cls.name}`}
                          >
                            Keluar
                          </button>
                        )}
                      </div>
                    </div>

                    <h5 className="font-extrabold text-sm line-clamp-1">{cls.name}</h5>
                    <p
                      className={`text-xs mt-0.5 ${
                        isActive ? 'text-white/80' : 'text-[#6E828A] dark:text-[#9CB7C0]'
                      }`}
                    >
                      Wali: {cls.teacherName}
                    </p>
                  </div>

                  <div
                    className={`mt-3 pt-2.5 border-t flex items-center justify-between ${
                      isActive ? 'border-white/15' : 'border-[#E5E8E6] dark:border-[#214B59]'
                    }`}
                  >
                    <span
                      className={`text-xs tabular-nums ${
                        isActive ? 'text-[#FCEADE]' : 'text-[#6E828A] dark:text-[#9CB7C0]'
                      }`}
                    >
                      {cls.studentCount} Siswa
                    </span>

                    {!isActive ? (
                      <button
                        onClick={() => setActiveClass(cls)}
                        className="text-xs font-bold text-[#163E4B] dark:text-[#F4A950] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>Buka Kelas</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <span className="text-xs font-bold text-[#F4A950]">Aktif</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Active Class Detail & Code Box */}
      {activeClass && (
        <>
          <div className="bg-white dark:bg-[#13313C] rounded-[28px] p-5 border border-[#ECECE6] dark:border-[#214B59] shadow-[0_8px_26px_rgba(22,62,75,0.05)] space-y-3.5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-[#E59638]">Kelas Aktif Saat Ini</span>
                <h3 className="text-lg font-extrabold text-[#163E4B] dark:text-white">
                  {activeClass.name}
                </h3>
                <p className="text-xs text-[#6E828A] dark:text-[#9CB7C0] mt-0.5">
                  {activeClass.description}
                </p>
              </div>

              <div className="text-right shrink-0">
                <span className="text-xs text-[#7B8D93] block font-medium">T.A</span>
                <span className="text-xs font-bold text-[#163E4B] dark:text-white tabular-nums">
                  {activeClass.academicYear}
                </span>
              </div>
            </div>

            {activeLiveClass && activeLiveClass.classId === activeClass.id && (
              <div className="p-4 rounded-2xl bg-[#163E4B] text-white flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <span className="text-xs font-bold text-[#F4A950] block">
                    KBM Sedang Berlangsung Sekarang (WITA)
                  </span>
                  <span className="text-[11px] text-white/85 font-medium">
                    {activeLiveClass.subjectName} ({activeLiveClass.startTime} -{' '}
                    {activeLiveClass.endTime} WITA) · {activeLiveClass.roomLocation}
                  </span>
                </div>
                <button
                  onClick={() => setActiveTab('jadwal')}
                  className="px-4 py-1.5 bg-[#F4A950] hover:bg-[#E59638] text-white rounded-full text-xs font-bold transition-colors cursor-pointer ml-auto"
                >
                  Buka Jadwal Live →
                </button>
              </div>
            )}

            {/* Shareable Class Code Box in Soft Peach #FCEADE */}
            <div className="p-4 rounded-2xl bg-[#FCEADE] dark:bg-[#193D4A] border border-[#F4D3BA] dark:border-[#2A596A] flex items-center justify-between gap-2">
              <div>
                <p className="text-[11px] text-[#6E828A] dark:text-[#C5DBE2] font-bold">
                  Kode Kelas (Untuk Siswa Bergabung)
                </p>
                <p className="font-mono tabular-nums text-base font-extrabold text-[#163E4B] dark:text-[#F4A950]">
                  {activeClass.code}
                </p>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={handleCopyLoginLink}
                  className="px-3.5 py-1.5 bg-[#163E4B] hover:bg-[#10303B] text-white rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs whitespace-nowrap"
                  title="Salin link langsung menuju Halaman Login Siswa"
                >
                  {copiedLoginUrl ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#F4A950]" />
                      <span className="text-[#FCEADE] text-xs">Link Siswa Tersalin</span>
                    </>
                  ) : (
                    <>
                      <Link2 className="w-3.5 h-3.5 text-[#F4A950]" />
                      <span>Link Login Siswa</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleCopy}
                  className="px-3.5 py-1.5 bg-white dark:bg-[#13313C] text-[#163E4B] dark:text-white rounded-full text-xs font-bold hover:bg-[#F7F7F5] flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs whitespace-nowrap"
                >
                  {copiedCode ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#E59638]" />
                      <span className="text-[#E59638] text-xs">Tersalin</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Salin Kode</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    const loginUrl = `${window.location.origin}/?portal=siswa`;
                    if (navigator.share) {
                      navigator.share({
                        title: `Login Siswa ClassyWork — Kelas ${activeClass.name}`,
                        text: `Masuk ke Kelas ${activeClass.name} (Kode: ${activeClass.code}) melalui Halaman Login Siswa: ${loginUrl}`,
                        url: loginUrl,
                      });
                    } else {
                      handleCopyLoginLink();
                    }
                  }}
                  className="p-2 bg-white dark:bg-[#13313C] text-[#163E4B] dark:text-white rounded-full hover:bg-[#F7F7F5] transition-colors cursor-pointer shadow-2xs"
                  title="Bagikan Link Login Siswa & Kode Kelas"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Teacher WhatsApp Official Contact Card */}
            <div className="p-4 rounded-2xl bg-[#F7F7F5] dark:bg-[#0E262F] border border-[#ECECE6] dark:border-[#214B59] flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#163E4B] text-[#F4A950] flex items-center justify-center shrink-0">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-extrabold text-[#163E4B] dark:text-white">
                      WhatsApp Wali Kelas ({activeClass.teacherName})
                    </span>
                    <span className="text-[11px] font-bold text-[#E59638]">
                      ·{' '}
                      {activeClass.isTeacherVerified || currentUser.isPhoneVerified
                        ? 'Terverifikasi Resmi'
                        : 'Menunggu Verifikasi PIN'}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#6E828A] dark:text-[#9CB7C0] mt-0.5">
                    {activeClass.isTeacherVerified && activeClass.teacherPhone
                      ? `Nomor resmi: +${activeClass.teacherPhone} · Konsultasi belajar siswa`
                      : 'Verifikasi nomor kontak pendidik untuk keamanan komunikasi'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isTeacher ? (
                  <button
                    onClick={() => setShowPhoneModal(true)}
                    className="px-4 py-2 rounded-full text-xs font-bold bg-[#163E4B] hover:bg-[#10303B] text-white shadow-2xs flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-[#F4A950]" />
                    <span>Kelola & Verifikasi No. WA</span>
                  </button>
                ) : activeClass.isTeacherVerified && activeClass.teacherPhone ? (
                  <a
                    href={`https://wa.me/${activeClass.teacherPhone}?text=${encodeURIComponent(
                      `Assalamu'alaikum Bapak/Ibu Guru ${activeClass.teacherName}, saya siswa di kelas ${activeClass.name}...`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-full text-xs font-bold bg-[#F4A950] hover:bg-[#E59638] text-white shadow-[0_6px_16px_rgba(244,169,80,0.35)] flex items-center gap-1.5 transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Hubungi Guru (WA)</span>
                  </a>
                ) : (
                  <span className="text-[11px] text-[#7B8D93]">Belum Terverifikasi</span>
                )}
              </div>
            </div>
          </div>

          {/* Roster of Classmates / Students */}
          <div className="bg-white dark:bg-[#13313C] rounded-[28px] p-5 border border-[#ECECE6] dark:border-[#214B59] shadow-[0_8px_26px_rgba(22,62,75,0.05)]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#F4A950]" />
                <h4 className="font-extrabold text-sm text-[#163E4B] dark:text-white">
                  Siswa di {activeClass.name}
                </h4>
              </div>
              <span className="text-xs text-[#6E828A] font-semibold tabular-nums">
                {classStudents.length} Siswa Terdaftar
              </span>
            </div>

            {classStudents.length === 0 ? (
              <div className="py-6 text-center space-y-1">
                <p className="text-xs font-bold text-[#163E4B] dark:text-white">
                  Belum ada siswa yang terdaftar di kelas ini
                </p>
                <p className="text-[11px] text-[#7B8D93]">
                  Bagikan kode kelas{' '}
                  <span className="font-mono font-bold text-[#E59638]">{activeClass.code}</span>{' '}
                  agar siswa dapat bergabung.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[#F0F0EC] dark:divide-[#214B59]">
                {classStudents.map((student) => (
                  <div key={student.id} className="py-2.5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={student.avatarUrl || AVATAR_STUDENT_SVG}
                        alt={student.name}
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          e.currentTarget.src = AVATAR_STUDENT_SVG;
                        }}
                        className="w-8 h-8 rounded-full object-cover border border-[#ECECE6] dark:border-[#245363]"
                      />
                      <div>
                        <p className="text-xs font-bold text-[#163E4B] dark:text-white flex items-center gap-1.5">
                          {student.name}
                          {student.id === currentUser.id && (
                            <span className="text-[11px] font-bold text-[#E59638]">· Anda</span>
                          )}
                        </p>
                        <p className="text-[11px] text-[#7B8D93] font-mono tabular-nums">
                          {student.attendanceNumber ? `No. Absen ${student.attendanceNumber} · ` : ''}
                          {student.identifierNumber}
                        </p>
                      </div>
                    </div>

                    <span className="text-[11px] font-semibold text-[#6E828A] dark:text-[#9CB7C0] whitespace-nowrap">
                      Siswa Aktif
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      <TeacherPhoneVerificationModal
        isOpen={showPhoneModal}
        onClose={() => setShowPhoneModal(false)}
      />
    </div>
  );
};
