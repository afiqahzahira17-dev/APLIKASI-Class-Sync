import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Assignment, Submission, AssignmentAttachment } from '../types';
import { EmptyClassState } from './EmptyClassState';
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
    allDemoUsers,
  } = useApp();

  // Filters for student
  const [filterStatus, setFilterStatus] = useState<
    'all' | 'pending' | 'submitted' | 'late' | 'graded'
  >('all');

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
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

  // Teacher grading modal state
  const [gradingSubmissionId, setGradingSubmissionId] = useState<string | null>(null);
  const [scoreInput, setScoreInput] = useState<number>(90);
  const [feedbackInput, setFeedbackInput] = useState('');

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

    return classAssignments.filter((a) => {
      const mySub = mySubmissionsMap.get(a.id);
      const isPastDue = new Date() > new Date(a.dueDate);

      if (filterStatus === 'all') return true;
      if (filterStatus === 'pending') return !mySub && !isPastDue;
      if (filterStatus === 'submitted') return !!mySub;
      if (filterStatus === 'late') return (!mySub && isPastDue) || (mySub && mySub.isLate);
      if (filterStatus === 'graded') return mySub && mySub.grade !== undefined;
      return true;
    });
  }, [classAssignments, currentUser.role, filterStatus, mySubmissionsMap]);

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
    }, 600);
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

  // Handlers for Teacher Grading
  const handleSaveGrade = (submissionId: string) => {
    if (scoreInput < 0 || scoreInput > 100) {
      return;
    }
    gradeSubmission(submissionId, scoreInput, feedbackInput);
    setGradingSubmissionId(null);
    setFeedbackInput('');
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
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5">
            <CheckSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-bold text-sm sm:text-base text-slate-800 dark:text-slate-100">
              {currentUser.role === 'teacher' ? 'Kelola & Periksa Tugas' : 'Tugas & Tagihan Belajar'}
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {currentUser.role === 'teacher'
              ? 'Terbitkan tugas baru dan evaluasi pengumpulan siswa'
              : 'Pantau tenggat waktu dan kumpulkan dokumen tugas'}
          </p>
        </div>

        {currentUser.role === 'teacher' && (
          <button
            id="create-assignment-btn"
            onClick={() => {
              // Pre-fill tomorrow 23:59 as default deadline
              const tomorrow = new Date();
              tomorrow.setDate(tomorrow.getDate() + 1);
              tomorrow.setHours(23, 59, 0, 0);
              const isoLocal = new Date(tomorrow.getTime() - tomorrow.getTimezoneOffset() * 60000)
                .toISOString()
                .slice(0, 16);
              setNewDueDate(isoLocal);
              setShowCreateModal(true);
            }}
            className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Buat Tugas</span>
          </button>
        )}
      </div>

      {/* Student Filter Pills (PRD 3.3 Status Pengiriman: Belum, Sudah Dikirim, Terlambat) */}
      {currentUser.role === 'student' && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {[
            { id: 'all' as const, label: 'Semua Tugas' },
            { id: 'pending' as const, label: 'Belum Selesai' },
            { id: 'submitted' as const, label: 'Sudah Dikirim' },
            { id: 'late' as const, label: 'Terlambat' },
            { id: 'graded' as const, label: 'Sudah Dinilai ⭐' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterStatus(f.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                filterStatus === f.id
                  ? 'bg-indigo-600 text-white shadow-xs'
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
            Tidak ada tugas pada kategori ini.
          </p>
          <p className="text-xs text-slate-400">
            {currentUser.role === 'student'
              ? 'Semua tugas telah dikerjakan atau belum ada tugas baru.'
              : 'Belum ada tugas yang diterbitkan untuk kelas ini.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayedAssignments.map((assignment) => {
            const mySubmission = mySubmissionsMap.get(assignment.id);
            const isPastDue = new Date() > new Date(assignment.dueDate);

            // Calculate submission statistics for teacher
            const classSubmissions = submissions.filter((s) => s.assignmentId === assignment.id);
            const gradedCount = classSubmissions.filter((s) => s.grade !== undefined).length;

            return (
              <div
                key={assignment.id}
                id={`assignment-card-${assignment.id}`}
                className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-xs"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/50">
                        {assignment.subjectName}
                      </span>

                      {/* Status indicator badges */}
                      {currentUser.role === 'student' && (
                        <>
                          {mySubmission ? (
                            mySubmission.grade !== undefined ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300">
                                <Star className="w-3 h-3 fill-emerald-500 text-emerald-500" />
                                Nilai: {mySubmission.grade}/100
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400">
                                <CheckCircle className="w-3 h-3" />
                                Sudah Dikirim {mySubmission.isLate && '(Terlambat)'}
                              </span>
                            )
                          ) : isPastDue ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-400">
                              <AlertCircle className="w-3 h-3" />
                              Terlambat (Belum Mengumpulkan)
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
                        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                          Pengumpulan: {classSubmissions.length} Siswa ({gradedCount} Dinilai)
                        </span>
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
                      className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Hapus Tugas"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

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

                {/* Student's feedback note if already graded */}
                {currentUser.role === 'student' && mySubmission?.feedback && (
                  <div className="mt-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50">
                    <div className="flex items-start gap-2">
                      <MessageSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                          Umpan Balik Guru (Nilai: {mySubmission.grade}/100):
                        </p>
                        <p className="text-xs text-emerald-900 dark:text-emerald-200/90 mt-0.5 italic">
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
                        isPastDue ? 'text-rose-600 dark:text-rose-400' : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {formatDueDate(assignment.dueDate)}
                    </span>
                  </div>

                  {/* Actions depending on role */}
                  {currentUser.role === 'student' ? (
                    <button
                      id={`submit-btn-${assignment.id}`}
                      onClick={() => {
                        setSelectedAssignmentForSubmit(assignment);
                        setUploadFile(null);
                        setStudentNote(mySubmission?.studentNote || '');
                      }}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold shadow-xs transition-colors ${
                        mySubmission
                          ? 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      }`}
                    >
                      <UploadCloud className="w-3.5 h-3.5" />
                      <span>{mySubmission ? 'Ubah Pengumpulan' : 'Kumpulkan Tugas'}</span>
                    </button>
                  ) : (
                    <button
                      id={`review-btn-${assignment.id}`}
                      onClick={() => setSelectedAssignmentForReview(assignment)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Periksa Pengumpulan ({classSubmissions.length})</span>
                    </button>
                  )}
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
                  Pengumpulan Tugas
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

              {/* Upload Zone (PRD 3.3 Opsi unggah file PDF, JPG, PNG, DOCX max 10MB) */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  File Jawaban / Tugas (PDF, JPG, PNG, DOCX, maks 10MB) *
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
                    {uploadFile ? uploadFile.name : 'Ketuk untuk memilih file atau seret ke sini'}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {uploadFile
                      ? `Ukuran: ${uploadFile.size} • Format didukung`
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
                  {isSubmitting ? 'Mengunggah...' : 'Kirim Tugas'}
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
                Buat Tugas Baru untuk Kelas
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
                  placeholder="Contoh: Setoran Hafalan QS. Al-Bayyinah atau Laporan Lab IPA"
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
                  placeholder="Contoh: Al-Qur'an Hadits, Fiqih, IPA Terpadu, Matematika, Bahasa Arab"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-transparent text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Tenggat Pengumpulan (Deadline) *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-transparent text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Deskripsi & Instruksi Pengerjaan *
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
                  placeholder="Contoh: Modul_Praktikum_04.pdf"
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

      {/* Teacher Review & Grading Modal (PRD 3.3 Pemeriksaan Tugas: Daftar siswa, Beri Nilai 0-100 & Feedback) */}
      {selectedAssignmentForReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-2xl w-full p-5 shadow-2xl border border-slate-200 dark:border-slate-700 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
              <div>
                <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">
                  Pemeriksaan & Penilaian Tugas
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
                        Siswa yang telah mengunggah file jawaban akan muncul di sini.
                      </p>
                    </div>
                  );
                }

                return subs.map((sub) => {
                  const isGradingThis = gradingSubmissionId === sub.id;

                  return (
                    <div
                      key={sub.id}
                      className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={sub.studentAvatar}
                            alt={sub.studentName}
                            className="w-9 h-9 rounded-full object-cover border"
                          />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h5 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                                {sub.studentName}
                              </h5>
                              {sub.isLate ? (
                                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400">
                                  Terlambat
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                                  Tepat Waktu
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
                          onClick={() => alert(`Mengunduh file simulasi: ${sub.fileName}`)}
                          className="px-2.5 py-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-950 rounded-lg flex items-center gap-1 shrink-0"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Unduh</span>
                        </button>
                      </div>

                      {/* Student Note */}
                      {sub.studentNote && (
                        <p className="text-xs text-slate-600 dark:text-slate-400 italic bg-slate-100/60 dark:bg-slate-800/60 p-2 rounded-lg">
                          Catatan Siswa: "{sub.studentNote}"
                        </p>
                      )}

                      {/* Existing Feedback */}
                      {sub.feedback && !isGradingThis && (
                        <div className="p-2.5 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/40 text-xs">
                          <span className="font-semibold text-emerald-800 dark:text-emerald-300">
                            Umpan Balik Terkirim:
                          </span>
                          <p className="text-slate-700 dark:text-slate-300 mt-0.5">{sub.feedback}</p>
                        </div>
                      )}

                      {/* Grading Form */}
                      {isGradingThis ? (
                        <div className="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-2">
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
                                Umpan Balik (Feedback)
                              </label>
                              <input
                                type="text"
                                placeholder="Contoh: Analisis sudah tepat, rapikan penulisan rumus..."
                                value={feedbackInput}
                                onChange={(e) => setFeedbackInput(e.target.value)}
                                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                              />
                            </div>
                          </div>
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => setGradingSubmissionId(null)}
                              className="px-3 py-1 text-xs rounded-lg text-slate-500 hover:bg-slate-100"
                            >
                              Batal
                            </button>
                            <button
                              onClick={() => handleSaveGrade(sub.id)}
                              className="px-3.5 py-1 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                            >
                              Simpan & Kirim Nilai
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-end">
                          <button
                            onClick={() => {
                              setGradingSubmissionId(sub.id);
                              setScoreInput(sub.grade !== undefined ? sub.grade : 90);
                              setFeedbackInput(sub.feedback || '');
                            }}
                            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 transition-colors"
                          >
                            {sub.grade !== undefined ? 'Ubah Nilai / Catatan' : 'Beri Nilai & Feedback'}
                          </button>
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
    </div>
  );
};
