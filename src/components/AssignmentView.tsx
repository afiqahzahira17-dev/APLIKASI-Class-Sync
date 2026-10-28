import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Assignment, Submission, AssignmentAttachment } from '../types';
import { AVATAR_STUDENT_SVG } from '../data/mockData';
import { EmptyClassState } from './EmptyClassState';
import { TeacherPhoneVerificationModal } from './TeacherPhoneVerificationModal';
import { GamificationModal } from './GamificationModal';
import confetti from 'canvas-confetti';
import {
  CheckSquare,
  Plus,
  Clock,
  Calendar,
  FileText,
  UploadCloud,
  AlertCircle,
  Star,
  Download,
  Trash2,
  MessageSquare,
  Check,
  Paperclip,
  Sparkles,
  MessageCircle,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Pencil,
  ListOrdered,
  Trophy,
} from 'lucide-react';

interface AssignmentViewProps {
  onOpenClassModal?: () => void;
}

export const AssignmentView: React.FC<AssignmentViewProps> = ({ onOpenClassModal }) => {
  const {
    currentUser,
    activeClass,
    assignments,
    submissions,
    addAssignment,
    updateAssignment,
    deleteAssignment,
    submitAssignment,
    verifySubmission,
    userXp,
  } = useApp();

  const [filterStatus, setFilterStatus] = useState<
    'all' | 'pending' | 'submitted' | 'expired' | 'graded'
  >('all');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [selectedAssignmentForSubmit, setSelectedAssignmentForSubmit] = useState<Assignment | null>(
    null
  );
  const [selectedAssignmentForReview, setSelectedAssignmentForReview] = useState<Assignment | null>(
    null
  );

  const [uploadFile, setUploadFile] = useState<{
    name: string;
    size: string;
    type: string;
    dataUrl?: string;
  } | null>(null);
  const [studentNote, setStudentNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState("Al-Qur'an Hadits");
  const [newDescription, setNewDescription] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [attachmentName, setAttachmentName] = useState('');

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editSubject, setEditSubject] = useState("Al-Qur'an Hadits");
  const [editDescription, setEditDescription] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [editAttachmentName, setEditAttachmentName] = useState('');
  const [editMaxScore, setEditMaxScore] = useState<number>(100);

  const [attendanceNumberInput, setAttendanceNumberInput] = useState<number>(
    currentUser.attendanceNumber || 1
  );

  const [sortSubmissionBy, setSortSubmissionBy] = useState<'attendance' | 'time'>('attendance');

  const [showXpGuide, setShowXpGuide] = useState(false);
  const [showGamificationModal, setShowGamificationModal] = useState(false);

  const [gradingSubmissionId, setGradingSubmissionId] = useState<string | null>(null);
  const [scoreInput, setScoreInput] = useState<number>(90);
  const [feedbackInput, setFeedbackInput] = useState('Bagus sekali, terus tingkatkan!');

  const classAssignments = useMemo(() => {
    if (!activeClass) return [];
    return assignments
      .filter((a) => a.classId === activeClass.id)
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [assignments, activeClass]);

  const mySubmissionsMap = useMemo(() => {
    const map = new Map<string, Submission>();
    submissions
      .filter((s) => s.studentId === currentUser.id)
      .forEach((s) => {
        map.set(s.assignmentId, s);
      });
    return map;
  }, [submissions, currentUser.id]);

  const displayedAssignments = useMemo(() => {
    if (currentUser.role === 'teacher') return classAssignments;

    const now = new Date();
    return classAssignments.filter((a) => {
      const mySub = mySubmissionsMap.get(a.id);
      const isPastDue = now > new Date(a.dueDate);

      if (filterStatus === 'all') return true;
      if (filterStatus === 'pending') return !mySub && !isPastDue;
      if (filterStatus === 'submitted') return !!mySub;
      if (filterStatus === 'expired') return !mySub && isPastDue;
      if (filterStatus === 'graded') return mySub && mySub.grade !== undefined;
      return true;
    });
  }, [classAssignments, currentUser.role, filterStatus, mySubmissionsMap]);

  const studentExpiredCount = useMemo(() => {
    if (currentUser.role !== 'student') return 0;
    const now = new Date();
    return classAssignments.filter((a) => {
      const sub = mySubmissionsMap.get(a.id);
      return !sub && now > new Date(a.dueDate);
    }).length;
  }, [classAssignments, mySubmissionsMap, currentUser.role]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('Ukuran file melebihi batas maksimal 10MB.');
        return;
      }
      const sizeFormatted =
        file.size > 1024 * 1024
          ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
          : `${Math.round(file.size / 1024)} KB`;

      setUploadFile({
        name: file.name,
        size: sizeFormatted,
        type: file.type || 'application/octet-stream',
      });
    }
  };

  const handleSubmitTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignmentForSubmit || !uploadFile) return;

    setIsSubmitting(true);
    setTimeout(() => {
      submitAssignment(
        selectedAssignmentForSubmit.id,
        uploadFile,
        studentNote,
        attendanceNumberInput
      );
      setIsSubmitting(false);
      setSelectedAssignmentForSubmit(null);
      setUploadFile(null);
      setStudentNote('');

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#F4A950', '#163E4B', '#FCEADE'],
      });
    }, 500);
  };

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeClass || !newTitle.trim() || !newDueDate) return;

    const attachmentsList: AssignmentAttachment[] = attachmentName
      ? [
          {
            name: attachmentName.trim(),
            size: '1.2 MB',
            type: 'application/pdf',
          },
        ]
      : [];

    addAssignment({
      classId: activeClass.id,
      title: newTitle.trim(),
      subjectName: newSubject.trim(),
      description: newDescription.trim(),
      dueDate: newDueDate,
      attachments: attachmentsList,
      maxScore: 100,
    });

    setShowCreateModal(false);
    setNewTitle('');
    setNewDescription('');
    setNewDueDate('');
    setAttachmentName('');
  };

  const handleOpenEditAssignment = (assignment: Assignment) => {
    setEditingAssignment(assignment);
    setEditTitle(assignment.title);
    setEditSubject(assignment.subjectName);
    setEditDescription(assignment.description);
    try {
      const d = new Date(assignment.dueDate);
      const isoLocal = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
      setEditDueDate(isoLocal);
    } catch {
      setEditDueDate(assignment.dueDate);
    }
    setEditMaxScore(assignment.maxScore || 100);
    setEditAttachmentName(assignment.attachments?.[0]?.name || '');
    setShowEditModal(true);
  };

  const handleSaveEditAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAssignment || !editTitle.trim() || !editDueDate) return;

    const attachmentsList: AssignmentAttachment[] = editAttachmentName.trim()
      ? [
          {
            name: editAttachmentName.trim(),
            size: editingAssignment.attachments?.[0]?.size || '1.2 MB',
            type: 'application/pdf',
          },
        ]
      : editingAssignment.attachments || [];

    updateAssignment(editingAssignment.id, {
      title: editTitle.trim(),
      subjectName: editSubject.trim(),
      description: editDescription.trim(),
      dueDate: editDueDate,
      attachments: attachmentsList,
      maxScore: editMaxScore,
    });

    setShowEditModal(false);
    setEditingAssignment(null);
  };

  const handleVerifySubmissionAction = (
    submissionId: string,
    status: 'verified' | 'rejected',
    score?: number,
    feedback?: string
  ) => {
    verifySubmission(submissionId, status, score, feedback);
    setGradingSubmissionId(null);
    if (status === 'verified') {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.5 },
        colors: ['#F4A950', '#163E4B', '#FCEADE'],
      });
    }
  };

  const formatDueDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('id-ID', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const getTeacherWaLink = (assignmentTitle?: string) => {
    const raw = activeClass?.teacherPhone || currentUser.phone || '';
    const clean = raw.replace(/[^0-9]/g, '');
    let formatted = clean;
    if (formatted.startsWith('0')) formatted = '62' + formatted.slice(1);
    const text = encodeURIComponent(
      `Assalamu'alaikum Bapak/Ibu Guru ${activeClass?.teacherName || 'Pengampu'}, saya siswa kelas ${
        activeClass?.name || ''
      }. Ingin bertanya mengenai tugas "${assignmentTitle || 'Pelajaran'}"...`
    );
    return `https://wa.me/${formatted}?text=${text}`;
  };

  if (!activeClass) {
    return (
      <EmptyClassState
        onOpenClassModal={onOpenClassModal}
        message="Belum ada kelas aktif. Buat kelas baru untuk mempublikasikan tugas dan mengelola pengumpulan siswa."
      />
    );
  }

  return (
    <div className="space-y-4 pb-24">
      {/* Top Hero Banner in Deep Petrol #163E4B matching reference card */}
      <div className="bg-[#163E4B] rounded-[28px] p-5 text-white shadow-[0_14px_34px_rgba(22,62,75,0.2)] flex items-center justify-between gap-3 flex-wrap relative overflow-hidden">
        <div className="w-36 h-36 rounded-full border-[7px] border-white/[0.05] absolute -right-10 -bottom-10 pointer-events-none" />

        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="p-1.5 rounded-xl bg-white/12 text-[#F4A950]">
              <CheckSquare className="w-4 h-4" />
            </div>
            <h3 className="font-extrabold text-sm sm:text-base text-white tracking-tight">
              {currentUser.role === 'teacher' ? (
                <>
                  Portal Guru: Kelola & <span className="text-[#F4A950]">Nilai Tugas</span>
                </>
              ) : (
                <>
                  Tugas Belajar & <span className="text-[#F4A950]">Pengumpulan</span>
                </>
              )}
            </h3>
            <span className="text-[11px] font-semibold text-[#FCEADE]/80">
              · {currentUser.role === 'teacher' ? 'Mode Pendidik' : 'Mode Siswa'}
            </span>
          </div>
          <p className="text-xs text-white/75">
            {currentUser.role === 'teacher'
              ? 'Terbitkan tugas baru, edit soal, urutkan sesuai nomor absen, dan berikan nilai serta XP'
              : 'Pantau tenggat waktu, konsultasi via WhatsApp guru, dan kumpulkan tugas sesuai nomor absen'}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap relative z-10">
          {/* XP Info Button */}
          <button
            onClick={() => setShowXpGuide((prev) => !prev)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold transition-colors shrink-0 cursor-pointer whitespace-nowrap ${
              showXpGuide
                ? 'bg-[#FCEADE] text-[#163E4B] shadow-xs'
                : 'bg-white/12 text-[#FCEADE] hover:bg-white/20'
            }`}
            title="Penjelasan Sistem XP & Prestasi Belajar"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#F4A950]" />
            <span>Penjelasan XP</span>
          </button>

          {currentUser.role === 'teacher' ? (
            <>
              <button
                onClick={() => setShowPhoneModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-white/12 hover:bg-white/20 text-white rounded-full text-xs font-bold transition-colors shrink-0 cursor-pointer whitespace-nowrap"
                title="Atur & Verifikasi Nomor WhatsApp Guru"
              >
                <MessageCircle className="w-3.5 h-3.5 text-[#F4A950]" />
                <span>Nomor WA Guru</span>
              </button>

              <button
                id="create-assignment-btn"
                onClick={() => {
                  const tomorrow = new Date();
                  tomorrow.setDate(tomorrow.getDate() + 1);
                  tomorrow.setHours(23, 59, 0, 0);
                  const isoLocal = new Date(
                    tomorrow.getTime() - tomorrow.getTimezoneOffset() * 60000
                  )
                    .toISOString()
                    .slice(0, 16);
                  setNewDueDate(isoLocal);
                  setShowCreateModal(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#F4A950] hover:bg-[#E59638] text-white rounded-full text-xs font-bold shadow-[0_6px_16px_rgba(244,169,80,0.35)] transition-colors shrink-0 cursor-pointer whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Buat Tugas Baru</span>
              </button>
            </>
          ) : (
            activeClass.isTeacherVerified && activeClass.teacherPhone ? (
              <a
                href={getTeacherWaLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 bg-[#F4A950] hover:bg-[#E59638] text-white rounded-full text-xs font-bold shadow-[0_6px_16px_rgba(244,169,80,0.35)] transition-colors shrink-0 whitespace-nowrap"
                title="Chat Wali Kelas via WhatsApp"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Chat Guru (WA)</span>
              </a>
            ) : null
          )}
        </div>
      </div>

      {/* XP System Explanation Card in Soft Warm Peach #FCEADE */}
      {showXpGuide && (
        <div className="bg-[#FCEADE] dark:bg-[#193D4A] rounded-[26px] p-4 sm:p-5 border border-[#F4D3BA] dark:border-[#2A596A] shadow-xs space-y-3.5 animate-in fade-in">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-[#163E4B] text-[#F4A950] flex items-center justify-center font-bold shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-[#163E4B] dark:text-white flex items-center gap-2 flex-wrap">
                  <span>Panduan & Penjelasan Sistem XP</span>
                  <span className="text-xs font-bold text-[#E59638] tabular-nums">
                    · {userXp} XP Anda
                  </span>
                </h4>
                <p className="text-xs text-[#5B727B] dark:text-[#C5DBE2]">
                  XP adalah poin keaktifan, kedisiplinan, dan prestasi akademik siswa di ClassyWork.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowGamificationModal(true)}
              className="px-4 py-2 rounded-full bg-[#163E4B] hover:bg-[#10303B] text-white font-bold text-xs shadow-xs transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Trophy className="w-3.5 h-3.5 text-[#F4A950]" />
              <span>Lihat Lencana & Level</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
            <div className="p-3.5 rounded-2xl bg-white dark:bg-[#13313C] border border-[#F0D4BE] dark:border-[#245363]">
              <div className="flex items-center gap-1.5 text-[#163E4B] dark:text-white font-extrabold mb-1">
                <CheckCircle2 className="w-4 h-4 text-[#E59638] shrink-0" />
                <span>+75 XP Tugas Tepat Waktu</span>
              </div>
              <p className="text-[11px] text-[#6E828A] dark:text-[#9CB7C0] leading-relaxed">
                XP otomatis bertambah ketika siswa mengumpulkan tugas sebelum batas tenggat dan diverifikasi guru.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white dark:bg-[#13313C] border border-[#F0D4BE] dark:border-[#245363]">
              <div className="flex items-center gap-1.5 text-[#163E4B] dark:text-white font-extrabold mb-1">
                <Star className="w-4 h-4 text-[#F4A950] fill-[#F4A950] shrink-0" />
                <span>+50 XP Bonus Nilai Unggul</span>
              </div>
              <p className="text-[11px] text-[#6E828A] dark:text-[#9CB7C0] leading-relaxed">
                Bonus ekstra bagi siswa yang meraih nilai tugas minimal <b>85</b> dari penilaian guru.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white dark:bg-[#13313C] border border-[#F0D4BE] dark:border-[#245363]">
              <div className="flex items-center gap-1.5 text-rose-700 dark:text-rose-400 font-extrabold mb-1">
                <Flame className="w-4 h-4 text-rose-500 shrink-0" />
                <span>-30 XP Pinalti Kadaluwarsa</span>
              </div>
              <p className="text-[11px] text-[#6E828A] dark:text-[#9CB7C0] leading-relaxed">
                Pengurangan XP otomatis jika tugas melewati tenggat waktu KBM tanpa pengumpulan siswa.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Warning Banner: Expired Assignments Penalty for Student */}
      {currentUser.role === 'student' && studentExpiredCount > 0 && (
        <div className="p-4 rounded-[24px] bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start justify-between gap-3 text-rose-900 dark:text-rose-200">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-rose-800 dark:text-rose-200">
                Peringatan: {studentExpiredCount} Tugas Telah Kadaluwarsa
              </h4>
              <p className="text-xs text-rose-700 dark:text-rose-300 mt-0.5">
                Tugas yang melewati tenggat waktu tanpa dikumpulkan dikenakan pinalti{' '}
                <b className="tabular-nums">-{studentExpiredCount * 30} XP</b>.
              </p>
            </div>
          </div>
          <button
            onClick={() => setFilterStatus('expired')}
            className="px-3.5 py-1.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shrink-0 transition-colors cursor-pointer whitespace-nowrap"
          >
            Lihat Tugas
          </button>
        </div>
      )}

      {/* Student Filter Pills */}
      {currentUser.role === 'student' && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {[
            { id: 'all' as const, label: 'Semua Tugas' },
            { id: 'pending' as const, label: 'Belum Selesai' },
            { id: 'submitted' as const, label: 'Sudah Dikirim' },
            {
              id: 'expired' as const,
              label: `Kadaluwarsa (${studentExpiredCount})`,
              highlight: studentExpiredCount > 0,
            },
            { id: 'graded' as const, label: 'Sudah Dinilai' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterStatus(f.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                filterStatus === f.id
                  ? f.id === 'expired'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-[#163E4B] text-white shadow-xs'
                  : f.highlight
                  ? 'bg-rose-100 text-rose-800 border border-rose-300 dark:bg-rose-950/60 dark:text-rose-300'
                  : 'bg-white dark:bg-[#13313C] border border-[#EAEAE4] dark:border-[#214B59] text-[#6E828A] dark:text-[#9CB7C0] hover:text-[#163E4B]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      {/* Assignment List */}
      {displayedAssignments.length === 0 ? (
        <div className="bg-white dark:bg-[#13313C] rounded-[26px] p-8 border border-dashed border-[#D8E0E3] dark:border-[#245363] text-center space-y-2 shadow-[0_8px_24px_rgba(22,62,75,0.04)]">
          <CheckSquare className="w-10 h-10 mx-auto text-[#B5C4C9] dark:text-[#577C89]" />
          <p className="text-sm font-bold text-[#163E4B] dark:text-white">
            {filterStatus === 'expired'
              ? 'Hebat! Tidak ada tugas kadaluwarsa pada kelas ini.'
              : 'Tidak ada tugas pada kategori ini.'}
          </p>
          <p className="text-xs text-[#7B8D93] dark:text-[#98B4BE]">
            {currentUser.role === 'student'
              ? 'Semua tugas telah dikerjakan atau belum ada tugas baru dari guru.'
              : 'Belum ada tugas yang diterbitkan untuk kelas ini.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {displayedAssignments.map((assignment, idx) => {
            const mySubmission = mySubmissionsMap.get(assignment.id);
            const isPastDue = new Date() > new Date(assignment.dueDate);
            const isExpiredUnsubmitted = !mySubmission && isPastDue;

            const classSubmissions = submissions.filter((s) => s.assignmentId === assignment.id);
            const pendingVerifyCount = classSubmissions.filter(
              (s) => s.status === 'pending_verification' || !s.status
            ).length;
            const verifiedCount = classSubmissions.filter((s) => s.status === 'verified').length;
            const isPeachCard = !isExpiredUnsubmitted && idx % 2 === 1;

            return (
              <div
                key={assignment.id}
                id={`assignment-card-${assignment.id}`}
                className={`rounded-[26px] p-4 sm:p-5 border transition-all relative overflow-hidden ${
                  isExpiredUnsubmitted
                    ? 'bg-rose-50/70 dark:bg-rose-950/20 border-rose-300 dark:border-rose-900/60'
                    : isPeachCard
                    ? 'bg-[#FCEADE] dark:bg-[#193D4A] border-[#F4D3BA] dark:border-[#2A596A] shadow-[0_8px_24px_rgba(22,62,75,0.04)]'
                    : 'bg-white dark:bg-[#13313C] border-[#ECECE6] dark:border-[#214B59] shadow-[0_8px_26px_rgba(22,62,75,0.05)]'
                }`}
              >
                {isPeachCard && (
                  <div className="w-28 h-28 rounded-full border-[6px] border-[#F2C9A8]/45 dark:border-white/[0.04] absolute -right-8 -bottom-8 pointer-events-none" />
                )}

                <div className="flex items-start justify-between gap-3 relative z-10">
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap text-xs">
                      <span className="font-extrabold text-[#E59638]">
                        {assignment.subjectName}
                      </span>

                      {currentUser.role === 'student' && (
                        <>
                          <span>·</span>
                          {mySubmission ? (
                            mySubmission.status === 'verified' ? (
                              <span className="inline-flex items-center gap-1 font-bold text-[#163E4B] dark:text-[#FCEADE]">
                                <Sparkles className="w-3 h-3 text-[#F4A950]" />
                                Terverifikasi Guru
                                {mySubmission.grade !== undefined && (
                                  <span className="tabular-nums">({mySubmission.grade}/100)</span>
                                )}
                              </span>
                            ) : mySubmission.status === 'rejected' ? (
                              <span className="inline-flex items-center gap-1 font-bold text-rose-600 dark:text-rose-400">
                                <AlertCircle className="w-3 h-3" />
                                Perlu Perbaikan
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 font-semibold text-[#6E828A] dark:text-[#9CB7C0]">
                                <Clock className="w-3 h-3 text-[#F4A950]" />
                                Menunggu Verifikasi Guru
                              </span>
                            )
                          ) : isExpiredUnsubmitted ? (
                            <span className="inline-flex items-center gap-1 font-extrabold text-rose-600 dark:text-rose-400">
                              <Flame className="w-3 h-3" />
                              Kadaluwarsa (-30 XP)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 font-semibold text-[#6E828A] dark:text-[#9CB7C0]">
                              <Clock className="w-3 h-3 text-[#F4A950]" />
                              Belum Dikumpulkan
                            </span>
                          )}
                        </>
                      )}

                      {currentUser.role === 'teacher' && (
                        <div className="flex items-center gap-2 flex-wrap text-[#6E828A] dark:text-[#B4CED7] font-semibold">
                          <span>·</span>
                          <span className="tabular-nums">Kiriman: {classSubmissions.length}</span>
                          {pendingVerifyCount > 0 && (
                            <span className="text-[#E59638] font-bold tabular-nums">
                              · {pendingVerifyCount} Menunggu Nilai
                            </span>
                          )}
                          {verifiedCount > 0 && (
                            <span className="text-[#163E4B] dark:text-[#FCEADE] font-bold tabular-nums">
                              · {verifiedCount} Terverifikasi
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <h4 className="text-base sm:text-lg font-extrabold text-[#163E4B] dark:text-white pt-0.5 tracking-tight">
                      {assignment.title}
                    </h4>

                    <p className="text-xs text-[#5E747D] dark:text-[#B2CBD4] line-clamp-2 leading-relaxed">
                      {assignment.description}
                    </p>
                  </div>

                  {currentUser.role === 'teacher' && (
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        id={`edit-assignment-btn-${assignment.id}`}
                        onClick={() => handleOpenEditAssignment(assignment)}
                        className="text-[#6E828A] hover:text-[#163E4B] dark:hover:text-white p-2 rounded-xl hover:bg-white/70 dark:hover:bg-[#112B35] transition-colors cursor-pointer"
                        title="Edit Tugas Ini"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Hapus tugas "${assignment.title}"?`)) {
                            deleteAssignment(assignment.id);
                          }
                        }}
                        className="text-[#6E828A] hover:text-rose-600 p-2 rounded-xl hover:bg-white/70 dark:hover:bg-[#112B35] transition-colors shrink-0 cursor-pointer"
                        title="Hapus Tugas"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {currentUser.role === 'student' && isExpiredUnsubmitted && (
                  <div className="mt-2.5 p-2.5 rounded-2xl bg-rose-100/80 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200 text-xs flex items-center justify-between gap-2 relative z-10">
                    <span className="font-semibold text-[11px]">
                      Tugas telah melewati tenggat. Pengurangan 30 XP dicatat pada sistem nilai.
                    </span>
                    <span className="text-[11px] font-extrabold tabular-nums text-rose-700 dark:text-rose-300">
                      -30 XP
                    </span>
                  </div>
                )}

                {assignment.attachments && assignment.attachments.length > 0 && (
                  <div className="mt-3 flex items-center gap-2 flex-wrap relative z-10">
                    <span className="text-[11px] text-[#6E828A] dark:text-[#98B4BE] font-semibold flex items-center gap-1">
                      <Paperclip className="w-3 h-3 text-[#F4A950]" /> Lampiran Soal:
                    </span>
                    {assignment.attachments.map((att, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-white/80 dark:bg-[#0F2730] border border-[#E6EAEB] dark:border-[#245363] text-[#163E4B] dark:text-[#E5F0F3] font-semibold"
                      >
                        <FileText className="w-3 h-3 text-[#F4A950]" />
                        <span className="max-w-[150px] truncate">{att.name}</span>
                        <span className="text-[10px] text-[#7B8D93]">({att.size})</span>
                      </span>
                    ))}
                  </div>
                )}

                {currentUser.role === 'student' && mySubmission?.feedback && (
                  <div className="mt-3 p-3.5 rounded-2xl bg-white/85 dark:bg-[#0E262F] border border-[#F0D3B8] dark:border-[#285768] relative z-10">
                    <div className="flex items-start gap-2.5">
                      <MessageSquare className="w-4 h-4 text-[#F4A950] shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-extrabold text-[#163E4B] dark:text-white flex items-center gap-2">
                          <span>Ulasan & Nilai Guru:</span>
                          {mySubmission.grade !== undefined && (
                            <span className="text-[#E59638] font-black tabular-nums">
                              {mySubmission.grade} / 100
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-[#5A717A] dark:text-[#C5DBE2] mt-0.5">
                          "{mySubmission.feedback}"
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Bottom Bar: Due Date and Actions */}
                <div
                  className={`mt-4 pt-3 border-t flex items-center justify-between flex-wrap gap-2 relative z-10 ${
                    isPeachCard
                      ? 'border-[#F0CCA9]/60 dark:border-white/10'
                      : 'border-[#F0F0EC] dark:border-[#214B59]'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs text-[#6E828A] dark:text-[#9CB7C0]">
                    <Calendar className="w-3.5 h-3.5 text-[#F4A950]" />
                    <span>Tenggat:</span>
                    <span
                      className={`font-bold ${
                        isPastDue
                          ? 'text-rose-600 dark:text-rose-400'
                          : 'text-[#163E4B] dark:text-white'
                      }`}
                    >
                      {formatDueDate(assignment.dueDate)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {currentUser.role === 'student' && (
                      <a
                        href={getTeacherWaLink(assignment.title)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-[#163E4B] text-white hover:bg-[#10303B] transition-colors whitespace-nowrap"
                        title="Tanya guru mengenai tugas ini via WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-[#F4A950]" />
                        <span className="hidden sm:inline">Tanya WA Guru</span>
                      </a>
                    )}

                    {currentUser.role === 'student' ? (
                      <button
                        id={`submit-btn-${assignment.id}`}
                        onClick={() => {
                          setSelectedAssignmentForSubmit(assignment);
                          setUploadFile(null);
                          setStudentNote(mySubmission?.studentNote || '');
                        }}
                        className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold shadow-xs transition-colors cursor-pointer whitespace-nowrap ${
                          isExpiredUnsubmitted
                            ? 'bg-rose-600 hover:bg-rose-700 text-white'
                            : mySubmission
                            ? 'bg-white dark:bg-[#0E262F] border border-[#DCE3E6] dark:border-[#275668] text-[#163E4B] dark:text-white hover:border-[#F4A950]'
                            : 'bg-[#F4A950] hover:bg-[#E59638] text-white shadow-[0_6px_16px_rgba(244,169,80,0.35)]'
                        }`}
                      >
                        <UploadCloud className="w-3.5 h-3.5" />
                        <span>
                          {mySubmission
                            ? 'Ubah Kiriman Tugas'
                            : isExpiredUnsubmitted
                            ? 'Kumpulkan Terlambat'
                            : 'Kumpulkan Tugas'}
                        </span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          id={`edit-assignment-bottom-btn-${assignment.id}`}
                          onClick={() => handleOpenEditAssignment(assignment)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-white dark:bg-[#0E262F] hover:bg-[#F7F7F5] text-[#163E4B] dark:text-white border border-[#DCE3E6] dark:border-[#275668] transition-colors cursor-pointer whitespace-nowrap"
                          title="Edit Tugas Ini"
                        >
                          <Pencil className="w-3.5 h-3.5 text-[#E59638]" />
                          <span>Edit Tugas</span>
                        </button>
                        <button
                          id={`review-btn-${assignment.id}`}
                          onClick={() => setSelectedAssignmentForReview(assignment)}
                          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold bg-[#163E4B] hover:bg-[#10303B] text-white shadow-xs transition-colors cursor-pointer whitespace-nowrap"
                        >
                          <ListOrdered className="w-3.5 h-3.5 text-[#F4A950]" />
                          <span className="tabular-nums">
                            Nilai & Urut Absen ({classSubmissions.length})
                          </span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Student Submit Assignment Modal */}
      {selectedAssignmentForSubmit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0D242C]/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#13313C] rounded-[28px] max-w-lg w-full p-5 shadow-2xl border border-[#ECECE6] dark:border-[#245363] max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0F0EC] dark:border-[#214B59]">
              <div>
                <span className="text-[11px] font-bold text-[#E59638]">
                  Pengumpulan Tugas (Siswa)
                </span>
                <h3 className="font-extrabold text-[#163E4B] dark:text-white text-base">
                  {selectedAssignmentForSubmit.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedAssignmentForSubmit(null)}
                className="text-[#7B8D93] hover:text-[#163E4B] dark:hover:text-white text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitTask} className="mt-4 space-y-4">
              <div className="bg-[#FCEADE]/60 dark:bg-[#0E262F] p-3.5 rounded-2xl border border-[#F4D3BA] dark:border-[#214B59] text-xs space-y-1">
                <p className="font-bold text-[#163E4B] dark:text-white">
                  Mata Pelajaran: {selectedAssignmentForSubmit.subjectName}
                </p>
                <p className="text-[#6E828A] dark:text-[#9CB7C0]">
                  Tenggat:{' '}
                  <span className="font-bold text-[#163E4B] dark:text-white">
                    {formatDueDate(selectedAssignmentForSubmit.dueDate)}
                  </span>
                </p>
                <p className="text-[#5A717A] dark:text-[#B5CED6] mt-1">
                  "{selectedAssignmentForSubmit.description}"
                </p>
              </div>

              {/* Input Nomor Absen Siswa */}
              <div>
                <label className="text-xs font-bold text-[#163E4B] dark:text-[#E5F0F3] block mb-1">
                  Nomor Urut Absen Siswa *
                </label>
                <div className="flex items-center gap-2">
                  <div className="w-12 h-10 rounded-2xl bg-[#163E4B] text-[#F4A950] font-mono tabular-nums font-extrabold flex items-center justify-center text-xs shrink-0">
                    #{attendanceNumberInput.toString().padStart(2, '0')}
                  </div>
                  <input
                    type="number"
                    min={1}
                    max={60}
                    required
                    value={attendanceNumberInput}
                    onChange={(e) =>
                      setAttendanceNumberInput(Math.max(1, parseInt(e.target.value) || 1))
                    }
                    className="flex-1 px-3.5 py-2.5 text-xs rounded-2xl border border-[#DCE3E6] dark:border-[#275668] bg-[#F7F7F5] dark:bg-[#0E262F] text-[#163E4B] dark:text-white font-bold focus:outline-hidden focus:ring-2 focus:ring-[#F4A950] font-mono tabular-nums"
                    placeholder="Nomor absen (contoh: 1, 2, 3...)"
                  />
                </div>
                <p className="text-[10px] text-[#7B8D93] mt-1">
                  Pengumpulan tugas otomatis diurutkan sesuai nomor absen di portal penilaian guru.
                </p>
              </div>

              {/* Upload Zone */}
              <div>
                <label className="text-xs font-bold text-[#163E4B] dark:text-[#E5F0F3] block mb-1">
                  File Jawaban / Dokumen Tugas (PDF, JPG, PNG, DOCX, maks 10MB) *
                </label>

                <div className="relative border-2 border-dashed border-[#CBD6DA] dark:border-[#275668] rounded-[24px] p-5 text-center hover:border-[#F4A950] transition-colors bg-[#F7F7F5] dark:bg-[#0E262F]">
                  <input
                    type="file"
                    id="student-file-input"
                    required={!uploadFile}
                    accept=".pdf,.jpg,.jpeg,.png,.docx,.doc,.xlsx,.zip"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <UploadCloud className="w-8 h-8 mx-auto text-[#F4A950] mb-2" />
                  <p className="text-xs font-bold text-[#163E4B] dark:text-white">
                    {uploadFile ? uploadFile.name : 'Ketuk untuk memilih file dokumen tugas'}
                  </p>
                  <p className="text-[11px] text-[#7B8D93] mt-0.5">
                    {uploadFile
                      ? `Ukuran: ${uploadFile.size} · Siap dikirim`
                      : 'Mendukung format PDF, JPG, PNG, DOCX hingga 10MB'}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#163E4B] dark:text-[#E5F0F3] block mb-1">
                  Catatan Tambahan untuk Guru (Opsional)
                </label>
                <textarea
                  rows={2}
                  value={studentNote}
                  onChange={(e) => setStudentNote(e.target.value)}
                  placeholder="Tuliskan catatan singkat mengenai jawaban ini..."
                  className="w-full px-3.5 py-2.5 text-xs rounded-2xl border border-[#DCE3E6] dark:border-[#275668] bg-[#F7F7F5] dark:bg-[#0E262F] text-[#163E4B] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#F4A950] resize-none"
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-[#FCEADE] dark:bg-[#193D4A] text-[11px] text-[#163E4B] dark:text-[#FCEADE] flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-[#E59638] shrink-0 mt-0.5" />
                <span>
                  Setelah tugas dikirim, XP Anda akan <b>bertambah (+75 hingga +125 XP)</b> begitu guru memverifikasi dan menilai tugas Anda.
                </span>
              </div>

              <div className="pt-3 border-t border-[#F0F0EC] dark:border-[#214B59] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedAssignmentForSubmit(null)}
                  className="px-4 py-2 text-xs font-bold rounded-full text-[#6E828A] hover:bg-[#F7F7F5] dark:hover:bg-[#1B4250] cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !uploadFile}
                  className="px-5 py-2 text-xs font-bold rounded-full bg-[#F4A950] hover:bg-[#E59638] text-white shadow-[0_6px_18px_rgba(244,169,80,0.35)] disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  {isSubmitting ? 'Mengirim...' : 'Kirim Tugas ke Guru'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Teacher Create Assignment Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0D242C]/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#13313C] rounded-[28px] max-w-lg w-full p-5 shadow-2xl border border-[#ECECE6] dark:border-[#245363] max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0F0EC] dark:border-[#214B59]">
              <h3 className="font-extrabold text-[#163E4B] dark:text-white text-base">
                Terbitkan Tugas Baru untuk Kelas
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-[#7B8D93] hover:text-[#163E4B] dark:hover:text-white text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAssignment} className="mt-4 space-y-3.5">
              <div>
                <label className="text-xs font-bold text-[#163E4B] dark:text-[#E5F0F3] block mb-1">
                  Judul Tugas *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Praktikum Fisika Hukum Newton atau Hafalan Al-Qur'an"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-2xl border border-[#DCE3E6] dark:border-[#275668] bg-[#F7F7F5] dark:bg-[#0E262F] text-[#163E4B] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#F4A950]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#163E4B] dark:text-[#E5F0F3] block mb-1">
                  Mata Pelajaran *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Al-Qur'an Hadits, Fiqih, IPA Terpadu"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-2xl border border-[#DCE3E6] dark:border-[#275668] bg-[#F7F7F5] dark:bg-[#0E262F] text-[#163E4B] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#F4A950]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#163E4B] dark:text-[#E5F0F3] block mb-1">
                  Tenggat Pengumpulan *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-2xl border border-[#DCE3E6] dark:border-[#275668] bg-[#F7F7F5] dark:bg-[#0E262F] text-[#163E4B] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#F4A950] font-mono tabular-nums"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#163E4B] dark:text-[#E5F0F3] block mb-1">
                  Petunjuk & Kriteria Tugas *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Tuliskan petunjuk pengerjaan tugas dan kriteria penilaian..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-2xl border border-[#DCE3E6] dark:border-[#275668] bg-[#F7F7F5] dark:bg-[#0E262F] text-[#163E4B] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#F4A950] resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#163E4B] dark:text-[#E5F0F3] block mb-1">
                  Nama File Lampiran Soal / Modul (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Modul_Tugas_04.pdf"
                  value={attachmentName}
                  onChange={(e) => setAttachmentName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-2xl border border-[#DCE3E6] dark:border-[#275668] bg-[#F7F7F5] dark:bg-[#0E262F] text-[#163E4B] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#F4A950]"
                />
              </div>

              <div className="pt-3 border-t border-[#F0F0EC] dark:border-[#214B59] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-bold rounded-full text-[#6E828A] hover:bg-[#F7F7F5] dark:hover:bg-[#1B4250] cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-full bg-[#F4A950] hover:bg-[#E59638] text-white shadow-[0_6px_18px_rgba(244,169,80,0.35)] cursor-pointer"
                >
                  Publikasikan Tugas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Teacher Edit Assignment Modal */}
      {showEditModal && editingAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0D242C]/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#13313C] rounded-[28px] max-w-lg w-full p-5 shadow-2xl border border-[#ECECE6] dark:border-[#245363] max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0F0EC] dark:border-[#214B59]">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-[#FCEADE] text-[#163E4B]">
                  <Pencil className="w-4 h-4 text-[#E59638]" />
                </div>
                <h3 className="font-extrabold text-[#163E4B] dark:text-white text-base">
                  Edit Tugas Belajar (Mode Guru)
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingAssignment(null);
                }}
                className="text-[#7B8D93] hover:text-[#163E4B] dark:hover:text-white text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditAssignment} className="mt-4 space-y-3.5">
              <div>
                <label className="text-xs font-bold text-[#163E4B] dark:text-[#E5F0F3] block mb-1">
                  Judul Tugas *
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-2xl border border-[#DCE3E6] dark:border-[#275668] bg-[#F7F7F5] dark:bg-[#0E262F] text-[#163E4B] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#F4A950]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#163E4B] dark:text-[#E5F0F3] block mb-1">
                  Mata Pelajaran *
                </label>
                <input
                  type="text"
                  required
                  value={editSubject}
                  onChange={(e) => setEditSubject(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-2xl border border-[#DCE3E6] dark:border-[#275668] bg-[#F7F7F5] dark:bg-[#0E262F] text-[#163E4B] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#F4A950]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-[#163E4B] dark:text-[#E5F0F3] block mb-1">
                    Tenggat Pengumpulan *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={editDueDate}
                    onChange={(e) => setEditDueDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-2xl border border-[#DCE3E6] dark:border-[#275668] bg-[#F7F7F5] dark:bg-[#0E262F] text-[#163E4B] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#F4A950] font-mono tabular-nums"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#163E4B] dark:text-[#E5F0F3] block mb-1">
                    Nilai Maksimal
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={100}
                    value={editMaxScore}
                    onChange={(e) => setEditMaxScore(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 text-xs rounded-2xl border border-[#DCE3E6] dark:border-[#275668] bg-[#F7F7F5] dark:bg-[#0E262F] text-[#163E4B] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#F4A950] font-mono tabular-nums font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#163E4B] dark:text-[#E5F0F3] block mb-1">
                  Petunjuk & Kriteria Tugas *
                </label>
                <textarea
                  rows={3}
                  required
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-2xl border border-[#DCE3E6] dark:border-[#275668] bg-[#F7F7F5] dark:bg-[#0E262F] text-[#163E4B] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#F4A950] resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#163E4B] dark:text-[#E5F0F3] block mb-1">
                  Nama File Lampiran Soal / Modul (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Modul_Tugas_04.pdf"
                  value={editAttachmentName}
                  onChange={(e) => setEditAttachmentName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-2xl border border-[#DCE3E6] dark:border-[#275668] bg-[#F7F7F5] dark:bg-[#0E262F] text-[#163E4B] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#F4A950]"
                />
              </div>

              <div className="pt-3 border-t border-[#F0F0EC] dark:border-[#214B59] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingAssignment(null);
                  }}
                  className="px-4 py-2 text-xs font-bold rounded-full text-[#6E828A] hover:bg-[#F7F7F5] dark:hover:bg-[#1B4250] cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-full bg-[#F4A950] hover:bg-[#E59638] text-white shadow-[0_6px_18px_rgba(244,169,80,0.35)] cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Simpan Perubahan Tugas</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Teacher Review, Grading & Verification Modal */}
      {selectedAssignmentForReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0D242C]/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#13313C] rounded-[28px] max-w-2xl w-full p-5 shadow-2xl border border-[#ECECE6] dark:border-[#245363] max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0F0EC] dark:border-[#214B59]">
              <div>
                <span className="text-[11px] font-bold text-[#E59638]">
                  Verifikasi Pengumpulan & Penilaian (Urutan Absen)
                </span>
                <h3 className="font-extrabold text-[#163E4B] dark:text-white text-base">
                  {selectedAssignmentForReview.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedAssignmentForReview(null)}
                className="text-[#7B8D93] hover:text-[#163E4B] dark:hover:text-white text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {(() => {
                const subs = submissions
                  .filter((s) => s.assignmentId === selectedAssignmentForReview.id)
                  .sort((a, b) => {
                    if (sortSubmissionBy === 'attendance') {
                      const numA = a.attendanceNumber ?? 999;
                      const numB = b.attendanceNumber ?? 999;
                      return numA - numB;
                    }
                    return (
                      new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
                    );
                  });

                const gradedSubs = subs.filter((s) => s.grade !== undefined);
                const avgScore =
                  gradedSubs.length > 0
                    ? Math.round(
                        gradedSubs.reduce((acc, curr) => acc + (curr.grade || 0), 0) /
                          gradedSubs.length
                      )
                    : null;

                if (subs.length === 0) {
                  return (
                    <div className="p-8 text-center border border-dashed border-[#D8E0E3] dark:border-[#245363] rounded-2xl space-y-1">
                      <p className="text-sm font-bold text-[#163E4B] dark:text-white">
                        Belum ada siswa yang mengumpulkan tugas ini.
                      </p>
                      <p className="text-xs text-[#7B8D93]">
                        Siswa yang telah mengunggah berkas akan tampil berurutan sesuai nomor absen untuk dinilai.
                      </p>
                    </div>
                  );
                }

                return (
                  <>
                    {/* Attendance Sorting & Overview Bar */}
                    <div className="p-3 rounded-2xl bg-[#F7F7F5] dark:bg-[#0E262F] border border-[#ECECE6] dark:border-[#214B59] flex items-center justify-between gap-2 flex-wrap text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#163E4B] dark:text-white">Urutan:</span>
                        <div className="flex items-center bg-white dark:bg-[#13313C] p-0.5 rounded-full border border-[#E5E8E6] dark:border-[#245363]">
                          <button
                            type="button"
                            onClick={() => setSortSubmissionBy('attendance')}
                            className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                              sortSubmissionBy === 'attendance'
                                ? 'bg-[#163E4B] text-white shadow-xs'
                                : 'text-[#6E828A] dark:text-[#9CB7C0]'
                            }`}
                          >
                            <ListOrdered className="w-3.5 h-3.5 text-[#F4A950]" />
                            <span>Sesuai No. Absen (1 - 40)</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setSortSubmissionBy('time')}
                            className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                              sortSubmissionBy === 'time'
                                ? 'bg-[#163E4B] text-white shadow-xs'
                                : 'text-[#6E828A] dark:text-[#9CB7C0]'
                            }`}
                          >
                            <Clock className="w-3.5 h-3.5" />
                            <span>Waktu Kirim</span>
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-[#6E828A] font-semibold tabular-nums">
                        <span>
                          Total: <b className="text-[#163E4B] dark:text-white">{subs.length} Siswa</b>
                        </span>
                        <span>·</span>
                        <span>
                          Dinilai: <b className="text-[#E59638]">{gradedSubs.length}/{subs.length}</b>
                        </span>
                        {avgScore !== null && (
                          <>
                            <span>·</span>
                            <span>
                              Rata-rata: <b className="text-[#163E4B] dark:text-[#F4A950]">{avgScore}</b>
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {subs.map((sub) => {
                      const isGradingThis = gradingSubmissionId === sub.id;
                      const isVerified = sub.status === 'verified';

                      return (
                        <div
                          key={sub.id}
                          className={`p-4 rounded-[22px] border transition-all space-y-3 ${
                            isVerified
                              ? 'border-[#ECECE6] dark:border-[#245363] bg-white dark:bg-[#0E262F]'
                              : 'border-[#F4D3BA] dark:border-[#2A596A] bg-[#FCEADE]/60 dark:bg-[#193D4A]'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                              {/* Urutan Nomor Absen Badge */}
                              <div className="w-11 h-11 rounded-2xl bg-[#163E4B] text-white font-mono tabular-nums font-black text-xs flex flex-col items-center justify-center shrink-0 shadow-xs">
                                <span className="text-[8px] text-[#FCEADE]/80 leading-none">
                                  Absen
                                </span>
                                <span className="text-sm font-black text-[#F4A950] leading-tight">
                                  #{String(sub.attendanceNumber || 1).padStart(2, '0')}
                                </span>
                              </div>

                              <img
                                src={sub.studentAvatar || AVATAR_STUDENT_SVG}
                                alt={sub.studentName}
                                referrerPolicy="no-referrer"
                                onError={(e) => {
                                  e.currentTarget.src = AVATAR_STUDENT_SVG;
                                }}
                                className="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-[#245363]"
                              />

                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h5 className="font-extrabold text-xs sm:text-sm text-[#163E4B] dark:text-white">
                                    {sub.studentName}
                                  </h5>
                                  {isVerified ? (
                                    <span className="text-[11px] font-bold text-[#163E4B] dark:text-[#FCEADE] tabular-nums">
                                      · Terverifikasi (+{sub.xpAwarded || 75} XP)
                                    </span>
                                  ) : (
                                    <span className="text-[11px] font-bold text-[#E59638]">
                                      · Menunggu Nilai Guru
                                    </span>
                                  )}
                                  {sub.isLate && (
                                    <span className="text-[11px] font-bold text-rose-600">
                                      · Terlambat
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-[#7B8D93]">
                                  Dikumpulkan: {formatDueDate(sub.submittedAt)}
                                </p>
                              </div>
                            </div>

                            <div className="text-right shrink-0">
                              {sub.grade !== undefined ? (
                                <div className="space-y-0.5 text-right">
                                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#163E4B] text-white font-extrabold text-xs tabular-nums">
                                    <Star className="w-3.5 h-3.5 fill-[#F4A950] text-[#F4A950]" />
                                    {sub.grade} / 100
                                  </span>
                                  <span className="block text-[10px] font-bold text-[#E59638]">
                                    {sub.grade >= 90
                                      ? 'Predikat A'
                                      : sub.grade >= 80
                                      ? 'Predikat B'
                                      : sub.grade >= 70
                                      ? 'Predikat C'
                                      : 'Predikat D'}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-[11px] font-bold text-[#E59638]">
                                  Belum Dinilai
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="p-3 rounded-2xl bg-[#F7F7F5] dark:bg-[#13313C] border border-[#EAEAE4] dark:border-[#245363] flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 truncate">
                              <FileText className="w-4 h-4 text-[#F4A950] shrink-0" />
                              <div className="truncate">
                                <p className="text-xs font-bold text-[#163E4B] dark:text-white truncate">
                                  {sub.fileName}
                                </p>
                                <p className="text-[10px] text-[#7B8D93]">{sub.fileSize}</p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => alert(`Mengunduh file jawaban: ${sub.fileName}`)}
                              className="px-3 py-1.5 text-xs font-bold text-[#163E4B] dark:text-[#FCEADE] hover:bg-white dark:hover:bg-[#1A4250] rounded-full flex items-center gap-1 shrink-0 cursor-pointer"
                            >
                              <Download className="w-3.5 h-3.5 text-[#F4A950]" />
                              <span>Unduh</span>
                            </button>
                          </div>

                          {sub.studentNote && (
                            <p className="text-xs text-[#5E747D] dark:text-[#C5DBE2] bg-white/80 dark:bg-[#13313C] p-2.5 rounded-xl border border-[#ECECE6] dark:border-[#245363]">
                              Catatan Siswa: "{sub.studentNote}"
                            </p>
                          )}

                          {isGradingThis ? (
                            <div className="pt-2 border-t border-[#ECECE6] dark:border-[#245363] space-y-2.5">
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                <div>
                                  <label className="text-[11px] font-bold text-[#163E4B] dark:text-[#E5F0F3] block mb-1">
                                    Cantumkan Nilai (0 - 100) *
                                  </label>
                                  <input
                                    type="number"
                                    min={0}
                                    max={100}
                                    value={scoreInput}
                                    onChange={(e) => setScoreInput(Number(e.target.value))}
                                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-[#DCE3E6] dark:border-[#275668] bg-white dark:bg-[#13313C] text-[#163E4B] dark:text-white font-bold font-mono tabular-nums"
                                  />
                                  <div className="flex gap-1 mt-1">
                                    {[100, 95, 85, 75].map((preset) => (
                                      <button
                                        key={preset}
                                        type="button"
                                        onClick={() => setScoreInput(preset)}
                                        className="text-[10px] px-2 py-0.5 rounded-full bg-[#FCEADE] hover:bg-[#F4A950] hover:text-white text-[#163E4B] font-bold tabular-nums cursor-pointer transition-colors"
                                      >
                                        {preset}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                                <div className="sm:col-span-2">
                                  <label className="text-[11px] font-bold text-[#163E4B] dark:text-[#E5F0F3] block mb-1">
                                    Catatan / Umpan Balik Guru
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="Contoh: Jawaban sangat rapi dan lengkap..."
                                    value={feedbackInput}
                                    onChange={(e) => setFeedbackInput(e.target.value)}
                                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-[#DCE3E6] dark:border-[#275668] bg-white dark:bg-[#13313C] text-[#163E4B] dark:text-white"
                                  />
                                </div>
                              </div>

                              <div className="flex justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => setGradingSubmissionId(null)}
                                  className="px-3.5 py-1.5 text-xs font-bold rounded-full text-[#6E828A] hover:bg-[#F7F7F5] cursor-pointer"
                                >
                                  Batal
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleVerifySubmissionAction(
                                      sub.id,
                                      'verified',
                                      scoreInput,
                                      feedbackInput
                                    )
                                  }
                                  className="px-4 py-1.5 text-xs font-bold rounded-full bg-[#F4A950] hover:bg-[#E59638] text-white shadow-[0_6px_16px_rgba(244,169,80,0.35)] flex items-center gap-1.5 cursor-pointer"
                                >
                                  <Sparkles className="w-3.5 h-3.5" />
                                  <span className="tabular-nums">
                                    Simpan Nilai & Beri XP (+{scoreInput >= 85 ? 125 : 75} XP)
                                  </span>
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#ECECE6] dark:border-[#245363] flex-wrap">
                              {sub.feedback && (
                                <p className="text-[11px] text-[#6E828A] dark:text-[#9CB7C0] line-clamp-1">
                                  Catatan Guru: "{sub.feedback}"
                                </p>
                              )}

                              <div className="flex items-center gap-2 ml-auto">
                                {!isVerified && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleVerifySubmissionAction(
                                        sub.id,
                                        'verified',
                                        sub.grade || 90,
                                        sub.feedback || 'Tugas diverifikasi oleh guru pengampu'
                                      )
                                    }
                                    className="px-3.5 py-1.5 text-xs font-bold rounded-full bg-[#163E4B] hover:bg-[#10303B] text-white shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                                  >
                                    <Sparkles className="w-3.5 h-3.5 text-[#F4A950]" />
                                    <span>Verifikasi Cepat (+125 XP)</span>
                                  </button>
                                )}

                                <button
                                  type="button"
                                  onClick={() => {
                                    setGradingSubmissionId(sub.id);
                                    setScoreInput(sub.grade !== undefined ? sub.grade : 90);
                                    setFeedbackInput(sub.feedback || 'Bagus sekali!');
                                  }}
                                  className="px-3.5 py-1.5 text-xs font-bold rounded-full bg-[#F4A950] hover:bg-[#E59638] text-white shadow-2xs transition-colors cursor-pointer flex items-center gap-1"
                                >
                                  <Star className="w-3.5 h-3.5 fill-white text-white" />
                                  <span>
                                    {sub.grade !== undefined
                                      ? 'Ubah Nilai & Feedback'
                                      : 'Cantumkan Nilai'}
                                  </span>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Gamification & XP Explanation Modal */}
      <GamificationModal
        isOpen={showGamificationModal}
        onClose={() => setShowGamificationModal(false)}
        defaultTab="penjelasan"
      />

      {/* Teacher Phone Verification Modal */}
      <TeacherPhoneVerificationModal
        isOpen={showPhoneModal}
        onClose={() => setShowPhoneModal(false)}
      />
    </div>
  );
};
