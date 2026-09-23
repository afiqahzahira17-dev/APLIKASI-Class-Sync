import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { KeyRound, Plus, Check, Copy, School, AlertCircle } from 'lucide-react';

interface ClassModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ClassModal: React.FC<ClassModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, joinClassByCode, createClass } = useApp();

  const [mode, setMode] = useState<'join' | 'create'>(
    currentUser.role === 'teacher' ? 'create' : 'join'
  );

  // Join form
  const [inputCode, setInputCode] = useState('');
  const [joinResult, setJoinResult] = useState<{ success: boolean; message: string } | null>(null);

  // Create form
  const [newClassName, setNewClassName] = useState('');
  const [newGradeLevel, setNewGradeLevel] = useState('Kelas 7');
  const [newDescription, setNewDescription] = useState('');
  const [createdClassCode, setCreatedClassCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;

    const res = joinClassByCode(inputCode.trim());
    setJoinResult(res);

    if (res.success) {
      setTimeout(() => {
        onClose();
        setJoinResult(null);
        setInputCode('');
      }, 1200);
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return;

    const newCls = createClass(newClassName.trim(), newGradeLevel, newDescription.trim());
    setCreatedClassCode(newCls.code);
  };

  const handleCopyCode = () => {
    if (createdClassCode) {
      navigator.clipboard.writeText(createdClassCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
          <h3 className="font-bold text-slate-900 dark:text-white text-base">
            Manajemen Kelas Sekolah
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-sm font-bold"
          >
            ✕
          </button>
        </div>

        {/* Mode switcher tabs */}
        <div className="flex rounded-xl bg-slate-100 dark:bg-slate-900 p-1 mt-3">
          <button
            onClick={() => {
              setMode('join');
              setJoinResult(null);
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              mode === 'join'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-500'
            }`}
          >
            Gabung via Kode
          </button>
          <button
            onClick={() => {
              setMode('create');
              setCreatedClassCode(null);
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              mode === 'create'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-500'
            }`}
          >
            Buat Kelas Baru (Guru)
          </button>
        </div>

        {/* Mode: Join with code */}
        {mode === 'join' && (
          <form onSubmit={handleJoin} className="mt-4 space-y-3.5">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Masukkan <b>Kode Kelas</b> yang dibagikan oleh guru mata pelajaran atau wali kelas Anda
              (contoh: <code>VII-A-701</code> atau <code>VIII-B-802</code>).
            </p>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Kode Kelas *
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="Contoh: VII-A-701"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                  className="w-full pl-9 pr-3 py-2 text-sm font-mono uppercase tracking-wider rounded-xl border border-slate-300 dark:border-slate-600 bg-transparent text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {joinResult && (
              <div
                className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
                  joinResult.success
                    ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300 border border-rose-200'
                }`}
              >
                {joinResult.success ? (
                  <Check className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                )}
                <span>{joinResult.message}</span>
              </div>
            )}

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20"
              >
                Masuk ke Kelas
              </button>
            </div>
          </form>
        )}

        {/* Mode: Create Class (Teacher) */}
        {mode === 'create' && (
          <div className="mt-4">
            {createdClassCode ? (
              <div className="space-y-4 text-center py-2">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-base">
                    Kelas Berhasil Dibuat!
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Bagikan kode kelas berikut kepada siswa agar mereka dapat bergabung:
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 font-mono text-xl font-black text-indigo-600 dark:text-indigo-400 tracking-wider flex items-center justify-center gap-2">
                  <span>{createdClassCode}</span>
                </div>

                <button
                  onClick={handleCopyCode}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md flex items-center justify-center gap-1.5"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Kode Berhasil Disalin!' : 'Salin Kode Kelas'}</span>
                </button>

                <button
                  onClick={() => {
                    onClose();
                    setCreatedClassCode(null);
                  }}
                  className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-800"
                >
                  Selesai
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreate} className="space-y-3.5">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Nama Kelas *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: VII-A (Tahfidz & Sains) atau VIII-B"
                    value={newClassName}
                    onChange={(e) => setNewClassName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-transparent text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Tingkat Kelas MTs
                  </label>
                  <select
                    value={newGradeLevel}
                    onChange={(e) => setNewGradeLevel(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Kelas 7">Kelas 7 (Tingkat VII MTs)</option>
                    <option value="Kelas 8">Kelas 8 (Tingkat VIII MTs)</option>
                    <option value="Kelas 9">Kelas 9 (Tingkat IX MTs)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Deskripsi Kelas (Opsional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Contoh: Kelas tahfidz dan riset sains MTs tahun ajaran 2026/2027..."
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-transparent text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 resize-none"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20"
                  >
                    Buat & Dapatkan Kode
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
