import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Assignment, Submission, AssignmentAttachment } from '../types';
import { EmptyClassState } from './EmptyClassState';
import { TeacherPhoneVerificationModal } from './TeacherPhoneVerificationModal';
import confetti from 'canvas-confetti';
import {
  CheckSquare,
  Plus,
  Clock,
  Calendar,
  FileText,
  UploadCloud,
  CheckCircle,
  AlertCircle,
  Star,
  Download,
  Trash2,
  Eye,
  User,
  MessageSquare,
  Filter,
  Check,
  Paperclip,
  FileSpreadsheet,
  FileCheck,
  Sparkles,
  MessageCircle,
  ShieldCheck,
  AlertTriangle,
  ExternalLink,
  Flame,
  CheckCircle2,
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
    deleteAssignment,
    submitAssignment,
    gradeSubmission,
    verifySubmission,
    expiredUnsubmittedAssignments,
    userXp,
  } = useApp();

  // Filters for student: 'all' | 'pending' | 'submitted' | 'expired' | 'graded'
  const [filterStatus, setFilterStatus] = useState<
    'all' | 'pending' | 'submitted' | 'expired' | 'graded'
  >('all');

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [selectedAssignmentForSubmit, setSelectedAssignmentForSubmit] = useState<Assignment | null>(
    null
  );
  const [selectedAssignmentForReview, setSelectedAssignmentForReview] = useState<Assignment | null>(
    null
  );

  // Student upload form
  const [uploadFile, setUploadFile] = useState<{
    name: string;
    size: string;
    type: string;
    dataUrl?: string;
  } | null>(null);
  const [studentNote, setStudentNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Teacher create assignment form
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState("Al-Qur'an Hadits");
  const [newDescription, setNewDescription] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [attachmentName, setAttachmentName] = useState('');

  // Teacher grading & verification modal state
  const [gradingSubmissionId, setGradingSubmissionId] = useState<string | null>(null);
  const [scoreInput, setScoreInput] = useState<number>(90);
  const [feedbackInput, setFeedbackInput] = useState('Bagus sekali, terus tingkatkan!');

  // Filter assignments for active class
  const classAssignments = useMemo(() => {
    if (!activeClass) return [];
    return assignments
      .filter((a) => a.classId === activeClass.id)
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [assignments, activeClass]);

  // Student specific logic: get submission map
  const mySubmissionsMap = useMemo(() => {
    const map = new Map<string, Submission>();
    submissions
      .filter((s) => s.studentId === currentUser.id)
      .forEach((s) => {
        map.set(s.assignmentId, s);
      });
    return map;
  }, [submissions, currentUser.id]);

  // Filtered assignments for student
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

  // Expired unsubmitted count for current student
  const studentExpiredCount = useMemo(() => {
    if (currentUser.role !== 'student') return 0;
    const now = new Date();
    return classAssignments.filter((a) => {
      const sub = mySubmissionsMap.get(a.id);
      return !sub && now > new Date(a.dueDate);
    }).length;
  }, [classAssignments, mySubmissionsMap, currentUser.role]);

  // Handlers for Student Submission
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
      submitAssignment(selectedAssignmentForSubmit.id, uploadFile, studentNote);
      setIsSubmitting(false);
      setSelectedAssignmentForSubmit(null);
      setUploadFile(null);
      setStudentNote('');

      // Confetti burst for rewarding user on completion!
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    }, 500);
  };

  // Handlers for Teacher Assignment Creation
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

  // Teacher Verifies and Awards Glowing XP
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

  // WhatsApp Link Helper
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
      {/* Top Banner & Action */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between gap-3 flex-wrap">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <div
              className={`p-1.5 rounded-lg ${
                currentUser.role === 'teacher'
                  ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                  : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
              }`}
            >
              <CheckSquare className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm sm:text-base text-slate-800 dark:text-slate-100">
              {currentUser.role === 'teacher'
                ? 'Portal Guru: Kelola, Periksa & Verifikasi Tugas'
                : 'Tugas Belajar & Pengumpulan Dokumen'}
            </h3>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                currentUser.role === 'teacher'
                  ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                  : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
              }`}
            >
              {currentUser.role === 'teacher' ? 'Mode Pendidik' : 'Mode Siswa'}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {currentUser.role === 'teacher'
              ? 'Terbitkan tugas baru, periksa berkas siswa, dan verifikasi untuk menyalakan XP siswa'
              : 'Pantau tenggat waktu, konsultasi via WhatsApp guru, dan kumpulkan tugas tepat waktu'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {currentUser.role === 'teacher' ? (
            <>
              <button
                onClick={() => setShowPhoneModal(true)}
                className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-semibold shadow-xs transition-colors shrink-0"
                title="Atur & Verifikasi Nomor WhatsApp Guru"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Nomor WA Guru</span>
                {currentUser.isPhoneVerified && <span className="text-[10px]">✅</span>}
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
                className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors shrink-0 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Buat Tugas Baru</span>
              </button>
            </>
          ) : (
            /* Student: Verified Teacher WA consultation button */
            activeClass.isTeacherVerified && activeClass.teacherPhone ? (
              <a
                href={getTeacherWaLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors shrink-0"
                title="Chat Wali Kelas via WhatsApp"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Chat Guru (WA)</span>
                <span className="text-[10px] bg-white/20 px-1 rounded-sm">Resmi</span>
              </a>
            ) : null
          )}
        </div>
      </div>

      {/* Warning Banner: Expired Assignments Penalty for Student */}
      {currentUser.role === 'student' && studentExpiredCount > 0 && (
        <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start justify-between gap-3 text-rose-900 dark:text-rose-200 animate-in fade-in">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-rose-800 dark:text-rose-200">
                Peringatan: {studentExpiredCount} Tugas Telah Kadaluwarsa!
              </h4>
              <p className="text-xs text-rose-700 dark:text-rose-300 mt-0.5">
                Tugas yang melewati tenggat waktu tanpa dikumpulkan dikenakan pinalti pemotongan{' '}
                <b>-{studentExpiredCount * 30} XP</b>. Segera hubungi guru atau kumpulkan dengan status terlambat.
              </p>
            </div>
          </div>
          <button
            onClick={() => setFilterStatus('expired')}
            className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shrink-0 transition-colors cursor-pointer"
          >
            Lihat Tugas Kadaluwarsa
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
              label: `Kadaluwarsa (${studentExpiredCount}) ⚠️`,
              highlight: studentExpiredCount > 0,
            },
            { id: 'graded' as const, label: 'Sudah Dinilai ⭐' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterStatus(f.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                filterStatus === f.id
                  ? f.id === 'expired'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-indigo-600 text-white shadow-xs'
                  : f.highlight
                  ? 'bg-rose-100 text-rose-800 border border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 hover:bg-rose-200'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      {/* Assignment List */}
      {displayedAssignments.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-dashed border-slate-300 dark:border-slate-800 text-center space-y-2">
          <CheckSquare className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            {filterStatus === 'expired'
              ? 'Hebat! Tidak ada tugas kadaluwarsa pada kelas ini.'
              : 'Tidak ada tugas pada kategori ini.'}
          </p>
          <p className="text-xs text-slate-400">
            {currentUser.role === 'student'
              ? 'Semua tugas telah dikerjakan atau belum ada tugas baru dari guru.'
              : 'Belum ada tugas yang diterbitkan untuk kelas ini.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayedAssignments.map((assignment) => {
            const mySubmission = mySubmissionsMap.get(assignment.id);
            const isPastDue = new Date() > new Date(assignment.dueDate);
            const isExpiredUnsubmitted = !mySubmission && isPastDue;

            // Calculate submission statistics for teacher
            const classSubmissions = submissions.filter((s) => s.assignmentId === assignment.id);
            const pendingVerifyCount = classSubmissions.filter(
              (s) => s.status === 'pending_verification' || !s.status
            ).length;
            const verifiedCount = classSubmissions.filter((s) => s.status === 'verified').length;

            return (
              <div
                key={assignment.id}
                id={`assignment-card-${assignment.id}`}
                className={`rounded-2xl p-4 sm:p-5 border transition-all shadow-xs ${
                  isExpiredUnsubmitted
                    ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-300 dark:border-rose-900/60 ring-1 ring-rose-400/30'
                    : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/50">
                        {assignment.subjectName}
                      </span>

                      {/* Status indicator badges */}
                      {currentUser.role === 'student' && (
                        <>
                          {mySubmission ? (
                            mySubmission.status === 'verified' ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 animate-pulse">
                                <Sparkles className="w-3 h-3 text-amber-600 fill-amber-500" />
                                Terverifikasi Guru (+XP Menyala!)
                                {mySubmission.grade !== undefined && ` • ${mySubmission.grade}/100`}
                              </span>
                            ) : mySubmission.status === 'rejected' ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300">
                                <AlertCircle className="w-3 h-3" />
                                Perlu Perbaikan (Guru)
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200">
                                <Clock className="w-3 h-3" />
                                Menunggu Verifikasi Guru ⏳
                              </span>
                            )
                          ) : isExpiredUnsubmitted ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-rose-600 text-white shadow-xs">
                              <Flame className="w-3 h-3" />
                              Kadaluwarsa (-30 XP Pinalti)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400">
                              <Clock className="w-3 h-3" />
                              Belum Dikumpulkan
                            </span>
                          )}
                        </>
                      )}

                      {currentUser.role === 'teacher' && (
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                            Total Kiriman: {classSubmissions.length}
                          </span>
                          {pendingVerifyCount > 0 && (
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 animate-pulse">
                              ⏳ {pendingVerifyCount} Menunggu Verifikasi
                            </span>
                          )}
                          {verifiedCount > 0 && (
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                              ✅ {verifiedCount} Terverifikasi
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white pt-1">
                      {assignment.title}
                    </h4>

                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {assignment.description}
                    </p>
                  </div>

                  {currentUser.role === 'teacher' && (
                    <button
                      onClick={() => {
                        if (confirm(`Hapus tugas "${assignment.title}"?`)) {
                          deleteAssignment(assignment.id);
                        }
                      }}
                      className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
                      title="Hapus Tugas"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Expired Unsubmitted Warning Notice */}
                {currentUser.role === 'student' && isExpiredUnsubmitted && (
                  <div className="mt-2.5 p-2.5 rounded-xl bg-rose-100/70 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200 text-xs flex items-center justify-between gap-2">
                    <span className="font-semibold text-[11px]">
                      ⚠️ Tugas telah kadaluwarsa! Pengurangan 30 XP telah dicatat pada sistem nilai.
                    </span>
                    <span className="text-[10px] font-bold bg-rose-700 text-white px-2 py-0.5 rounded-md">
                      -30 XP
                    </span>
                  </div>
                )}

                {/* Attachments from teacher */}
                {assignment.attachments && assignment.attachments.length > 0 && (
                  <div className="mt-3 flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                      <Paperclip className="w-3 h-3" /> Lampiran Soal/Materi:
                    </span>
                    {assignment.attachments.map((att, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
                      >
                        <FileText className="w-3 h-3 text-indigo-500" />
                        <span className="max-w-[150px] truncate">{att.name}</span>
                        <span className="text-[10px] text-slate-400">({att.size})</span>
                      </span>
                    ))}
                  </div>
                )}

                {/* Feedback note if graded/verified */}
                {currentUser.role === 'student' && mySubmission?.feedback && (
                  <div className="mt-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50">
                    <div className="flex items-start gap-2">
                      <MessageSquare className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1">
                          <span>Ulasan & Penilaian Guru:</span>
                          {mySubmission.grade !== undefined && (
                            <span className="px-1.5 py-0.2 bg-amber-200 dark:bg-amber-900 rounded text-[11px] font-black">
                              {mySubmission.grade} / 100
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-amber-900 dark:text-amber-200/90 mt-0.5 italic">
                          "{mySubmission.feedback}"
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Bottom Bar: Due Date and Actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Tenggat:</span>
                    <span
                      className={`font-semibold ${
                        isPastDue
                          ? 'text-rose-600 dark:text-rose-400'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {formatDueDate(assignment.dueDate)}
                    </span>
                  </div>

                  {/* Actions depending on role */}
                  <div className="flex items-center gap-2">
                    {/* WhatsApp teacher consultation button for student */}
                    {currentUser.role === 'student' && (
                      <a
                        href={getTeacherWaLink(assignment.title)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 transition-colors"
                        title="Tanya guru mengenai tugas ini via WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
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
                        className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer ${
                          isExpiredUnsubmitted
                            ? 'bg-rose-600 hover:bg-rose-700 text-white'
                            : mySubmission
                            ? 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                        }`}
                      >
                        <UploadCloud className="w-3.5 h-3.5" />
                        <span>
                          {mySubmission
                            ? 'Ubah Kiriman Tugas'
                            : isExpiredUnsubmitted
                            ? 'Kumpulkan Terlambat (Izin Guru)'
                            : 'Kumpulkan Tugas'}
                        </span>
                      </button>
                    ) : (
                      <button
                        id={`review-btn-${assignment.id}`}
                        onClick={() => setSelectedAssignmentForReview(assignment)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>
                          Periksa & Verifikasi ({classSubmissions.length} Siswa)
                        </span>
                      </button>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-slate-200 dark:border-slate-700 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
              <div>
                <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">
                  Pengumpulan Tugas (Siswa)
                </span>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  {selectedAssignmentForSubmit.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedAssignmentForSubmit(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitTask} className="mt-4 space-y-4">
              <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800 text-xs space-y-1">
                <p className="font-semibold text-slate-700 dark:text-slate-300">
                  Mata Pelajaran: {selectedAssignmentForSubmit.subjectName}
                </p>
                <p className="text-slate-500">
                  Tenggat:{' '}
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {formatDueDate(selectedAssignmentForSubmit.dueDate)}
                  </span>
                </p>
                <p className="text-slate-600 dark:text-slate-400 mt-1 italic">
                  "{selectedAssignmentForSubmit.description}"
                </p>
              </div>

              {/* Upload Zone */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  File Jawaban / Dokumen Tugas (PDF, JPG, PNG, DOCX, maks 10MB) *
                </label>

                <div className="relative border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-5 text-center hover:border-indigo-500 transition-colors bg-slate-50/50 dark:bg-slate-900/20">
                  <input
                    type="file"
                    id="student-file-input"
                    required={!uploadFile}
                    accept=".pdf,.jpg,.jpeg,.png,.docx,.doc,.xlsx,.zip"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <UploadCloud className="w-8 h-8 mx-auto text-indigo-500 mb-2" />
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                    {uploadFile ? uploadFile.name : 'Ketuk untuk memilih file dokumen tugas'}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {uploadFile
                      ? `Ukuran: ${uploadFile.size} • Siap dikirim`
                      : 'Mendukung format PDF, JPG, PNG, DOCX hingga 10MB'}
                  </p>
                </div>
              </div>

              {/* Student Note */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Catatan Tambahan untuk Guru (Opsional)
                </label>
                <textarea
                  rows={2}
                  value={studentNote}
                  onChange={(e) => setStudentNote(e.target.value)}
                  placeholder="Tuliskan catatan singkat jika ada hal khusus mengenai jawaban ini..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-transparent text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              {/* Verification Info note */}
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-[11px] text-amber-800 dark:text-amber-300 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  Setelah tugas dikirim, tugas akan berstatus <b>Menunggu Verifikasi Guru</b>. XP Anda akan <b>menyala & bertambah (+75 hingga +125 XP)</b> begitu guru mengonfirmasi pengumpulan Anda!
                </span>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedAssignmentForSubmit(null)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !uploadFile}
                  className="px-5 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md disabled:opacity-50 flex items-center gap-1.5"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-slate-200 dark:border-slate-700 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Terbitkan Tugas Baru untuk Kelas (Guru)
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAssignment} className="mt-4 space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Judul Tugas *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Praktikum Fisika Hukum Newton atau Hafalan Al-Qur'an"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-transparent text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Mata Pelajaran *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Al-Qur'an Hadits, Fiqih, IPA Terpadu, Bahasa Arab"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-transparent text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Tenggat Pengumpulan (Deadline Kadaluwarsa) *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-transparent text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-mono"
                />
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Siswa yang tidak mengumpulkan sebelum tenggat ini akan ditandai Kadaluwarsa (-30 XP).
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Petunjuk & Kriteria Tugas *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Tuliskan petunjuk pengerjaan tugas, format penulisan, dan kriteria penilaian..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-transparent text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Nama File Lampiran Soal / Modul (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Modul_Tugas_04.pdf"
                  value={attachmentName}
                  onChange={(e) => setAttachmentName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-transparent text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20"
                >
                  Publikasikan Tugas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Teacher Review, Grading & Verification Modal */}
      {selectedAssignmentForReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-2xl w-full p-5 shadow-2xl border border-slate-200 dark:border-slate-700 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
              <div>
                <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">
                  Verifikasi Pengumpulan & Penilaian (Pihak Guru)
                </span>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  {selectedAssignmentForReview.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedAssignmentForReview(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* List of submissions */}
            <div className="mt-4 space-y-3">
              {(() => {
                const subs = submissions.filter(
                  (s) => s.assignmentId === selectedAssignmentForReview.id
                );

                if (subs.length === 0) {
                  return (
                    <div className="p-8 text-center border border-dashed border-slate-200 dark:border-slate-700 rounded-xl space-y-1">
                      <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                        Belum ada siswa yang mengumpulkan tugas ini.
                      </p>
                      <p className="text-xs text-slate-400">
                        Siswa yang telah mengunggah file jawaban akan muncul di sini untuk Anda verifikasi dan berikan XP.
                      </p>
                    </div>
                  );
                }

                return subs.map((sub) => {
                  const isGradingThis = gradingSubmissionId === sub.id;
                  const isVerified = sub.status === 'verified';

                  return (
                    <div
                      key={sub.id}
                      className={`p-4 rounded-xl border transition-all space-y-3 ${
                        isVerified
                          ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20'
                          : 'border-amber-300 dark:border-amber-800 bg-amber-50/30 dark:bg-amber-950/20'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={sub.studentAvatar}
                            alt={sub.studentName}
                            className="w-10 h-10 rounded-full object-cover border"
                          />
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h5 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                                {sub.studentName}
                              </h5>
                              {isVerified ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  Terverifikasi (+{sub.xpAwarded || 75} XP)
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 animate-pulse">
                                  ⏳ Menunggu Verifikasi Guru
                                </span>
                              )}
                              {sub.isLate && (
                                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400">
                                  Terlambat
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400">
                              Dikumpulkan: {formatDueDate(sub.submittedAt)}
                            </p>
                          </div>
                        </div>

                        {/* Current Grade Badge */}
                        <div className="text-right shrink-0">
                          {sub.grade !== undefined ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-xs">
                              <Star className="w-3.5 h-3.5 fill-emerald-500 text-emerald-500" />
                              {sub.grade} / 100
                            </span>
                          ) : (
                            <span className="text-[11px] font-semibold text-amber-600 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded">
                              Belum Dinilai
                            </span>
                          )}
                        </div>
                      </div>

                      {/* File Details & Download button */}
                      <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 flex items-center justify-between">
                        <div className="flex items-center gap-2 truncate">
                          <FileText className="w-4 h-4 text-indigo-500 shrink-0" />
                          <div className="truncate">
                            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                              {sub.fileName}
                            </p>
                            <p className="text-[10px] text-slate-400">{sub.fileSize}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => alert(`Mengunduh file pengumpulan tugas: ${sub.fileName}`)}
                          className="px-2.5 py-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-950 rounded-lg flex items-center gap-1 shrink-0"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Unduh Berkas</span>
                        </button>
                      </div>

                      {/* Student Note */}
                      {sub.studentNote && (
                        <p className="text-xs text-slate-600 dark:text-slate-400 italic bg-white dark:bg-slate-800/80 p-2.5 rounded-lg border border-slate-100 dark:border-slate-700">
                          Catatan Siswa: "{sub.studentNote}"
                        </p>
                      )}

                      {/* Teacher Actions & Verification Form */}
                      {isGradingThis ? (
                        <div className="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-2.5">
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                                Nilai (0 - 100)
                              </label>
                              <input
                                type="number"
                                min={0}
                                max={100}
                                value={scoreInput}
                                onChange={(e) => setScoreInput(Number(e.target.value))}
                                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-bold"
                              />
                            </div>
                            <div className="col-span-2">
                              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                                Umpan Balik (Feedback untuk Siswa)
                              </label>
                              <input
                                type="text"
                                placeholder="Contoh: Jawaban sangat rapi dan lengkap..."
                                value={feedbackInput}
                                onChange={(e) => setFeedbackInput(e.target.value)}
                                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                              />
                            </div>
                          </div>

                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setGradingSubmissionId(null)}
                              className="px-3 py-1.5 text-xs rounded-lg text-slate-500 hover:bg-slate-100"
                            >
                              Batal
                            </button>
                            <button
                              onClick={() =>
                                handleVerifySubmissionAction(
                                  sub.id,
                                  'verified',
                                  scoreInput,
                                  feedbackInput
                                )
                              }
                              className="px-4 py-1.5 text-xs font-bold rounded-xl bg-gradient-to-r from-amber-500 to-emerald-600 hover:from-amber-600 hover:to-emerald-700 text-white shadow-md flex items-center gap-1.5"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>Simpan & Verifikasi (+XP Menyala!)</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                          {sub.feedback && (
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 italic line-clamp-1">
                              Feedback: "{sub.feedback}"
                            </p>
                          )}

                          <div className="flex items-center gap-2 ml-auto">
                            {!isVerified && (
                              <button
                                onClick={() =>
                                  handleVerifySubmissionAction(
                                    sub.id,
                                    'verified',
                                    sub.grade || 90,
                                    sub.feedback || 'Tugas diverifikasi oleh guru pengampu'
                                  )
                                }
                                className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
                              >
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>Verifikasi Cepat (+125 XP)</span>
                              </button>
                            )}

                            <button
                              onClick={() => {
                                setGradingSubmissionId(sub.id);
                                setScoreInput(sub.grade !== undefined ? sub.grade : 90);
                                setFeedbackInput(sub.feedback || 'Bagus sekali!');
                              }}
                              className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 transition-colors"
                            >
                              {sub.grade !== undefined
                                ? 'Ubah Nilai & Feedback'
                                : 'Beri Nilai & Verifikasi'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Teacher Phone Verification Modal */}
      <TeacherPhoneVerificationModal
        isOpen={showPhoneModal}
        onClose={() => setShowPhoneModal(false)}
      />
    </div>
  );
};
