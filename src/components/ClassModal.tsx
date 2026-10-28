import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { KeyRound, Check, Copy, AlertCircle, X } from 'lucide-react';

interface ClassModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ClassModal: React.FC<ClassModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, joinClassByCode, createClass } = useApp();

  const isTeacher = currentUser.role === 'teacher';

  const [mode, setMode] = useState<'join' | 'create'>(
    isTeacher ? 'create' : 'join'
  );

  // Sync mode if role changes
  React.useEffect(() => {
    if (!isTeacher) {
      setMode('join');
    }
  }, [isTeacher]);

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
    if (!isTeacher) {
      setJoinResult({
        success: false,
        message:
          'Siswa tidak memiliki izin membuat kelas. Silakan bergabung menggunakan kode kelas dari guru Anda.',
      });
      setMode('join');
      return;
    }
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B1E25]/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-[#132F3A] rounded-[28px] max-w-md w-full p-5 shadow-[0_20px_50px_rgba(22,62,75,0.2)] border border-[#E8ECEE] dark:border-[#214B59] animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-3.5 border-b border-[#E8ECEE] dark:border-[#214B59]">
          <div>
            <h3 className="font-extrabold text-[#163E4B] dark:text-white text-base">
              {isTeacher ? 'Manajemen Kelas (Guru)' : 'Gabung ke Kelas (Siswa)'}
            </h3>
            <p className="text-[11px] text-[#6E828A] dark:text-[#96B2BC]">
              {isTeacher
                ? 'Buat kelas baru atau gabung ke kelas'
                : 'Siswa bergabung menggunakan kode kelas dari guru'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[#8A9BA2] hover:text-[#163E4B] dark:hover:text-white p-1.5 rounded-full hover:bg-[#F7F7F5] dark:hover:bg-[#193B48] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode switcher tabs (Khusus Guru) / Info Banner (Siswa) */}
        {isTeacher ? (
          <div className="flex rounded-full bg-[#F7F7F5] dark:bg-[#0E242D] p-1 mt-3.5 border border-[#E8ECEE] dark:border-[#214B59]">
            <button
              onClick={() => {
                setMode('create');
                setCreatedClassCode(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-full transition-all cursor-pointer ${
                mode === 'create'
                  ? 'bg-[#163E4B] text-white shadow-xs'
                  : 'text-[#6E828A] hover:text-[#163E4B] dark:text-[#96B2BC]'
              }`}
            >
              Buat Kelas Baru (Guru)
            </button>
            <button
              onClick={() => {
                setMode('join');
                setJoinResult(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-full transition-all cursor-pointer ${
                mode === 'join'
                  ? 'bg-[#163E4B] text-white shadow-xs'
                  : 'text-[#6E828A] hover:text-[#163E4B] dark:text-[#96B2BC]'
              }`}
            >
              Gabung via Kode
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2.5 p-3.5 rounded-[22px] bg-[#FCEADE] dark:bg-[#F4A950]/15 border border-[#F4D3BA] dark:border-[#F4A950]/30 text-xs text-[#163E4B] dark:text-[#FCEADE] mt-3.5">
            <KeyRound className="w-4 h-4 text-[#E59638] shrink-0" />
            <div className="leading-tight">
              <span className="font-extrabold block">Akses Siswa: Masuk Lewat Kode Kelas</span>
              <span className="text-[11px] text-[#5C717A] dark:text-[#C5DBE2] mt-0.5 block">
                Pembuatan kelas dikhususkan untuk Guru. Siswa hanya dapat bergabung melalui kode kelas resmi.
              </span>
            </div>
          </div>
        )}

        {/* Mode: Join with code */}
        {mode === 'join' && (
          <form onSubmit={handleJoin} className="mt-4 space-y-3.5">
            <p className="text-xs text-[#6E828A] dark:text-[#96B2BC]">
              Masukkan <b className="text-[#163E4B] dark:text-white">Kode Kelas</b> yang dibagikan oleh guru mata pelajaran atau wali kelas Anda
              (contoh: <code className="font-mono font-bold text-[#163E4B] dark:text-[#F4A950]">VII-A-701</code> atau <code className="font-mono font-bold text-[#163E4B] dark:text-[#F4A950]">VIII-B-802</code>).
            </p>

            <div>
              <label className="text-xs font-bold text-[#163E4B] dark:text-[#E2EEF2] block mb-1">
                Kode Kelas *
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-3.5 top-3 text-[#8A9BA2]" />
                <input
                  type="text"
                  required
                  placeholder="Contoh: VII-A-701"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm font-mono uppercase tracking-wider rounded-2xl border border-[#DCE4E7] dark:border-[#214B59] bg-[#F7F7F5] dark:bg-[#0E242D] text-[#163E4B] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#F4A950]"
                />
              </div>
            </div>

            {joinResult && (
              <div
                className={`p-3 rounded-2xl text-xs flex items-start gap-2 ${
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
                className="px-4 py-2 text-xs font-bold rounded-full text-[#6E828A] dark:text-[#96B2BC] hover:bg-[#F7F7F5] dark:hover:bg-[#193B48] cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-extrabold rounded-full bg-[#F4A950] hover:bg-[#E59638] text-[#163E4B] shadow-sm cursor-pointer transition-colors"
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
                <div className="w-12 h-12 rounded-full bg-[#FCEADE] text-[#163E4B] flex items-center justify-center mx-auto border border-[#F4D3BA]">
                  <Check className="w-6 h-6 text-[#E59638]" />
                </div>
                <div>
                  <h4 className="font-extrabold text-[#163E4B] dark:text-white text-base">
                    Kelas Berhasil Dibuat!
                  </h4>
                  <p className="text-xs text-[#6E828A] dark:text-[#96B2BC] mt-1">
                    Bagikan kode kelas berikut kepada siswa agar mereka dapat bergabung:
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#163E4B] font-mono text-xl font-black text-[#F4A950] tracking-wider flex items-center justify-center gap-2 tabular-nums">
                  <span>{createdClassCode}</span>
                </div>

                <button
                  onClick={handleCopyCode}
                  className="w-full py-2.5 rounded-full bg-[#F4A950] hover:bg-[#E59638] text-[#163E4B] text-xs font-extrabold shadow-sm flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Kode Berhasil Disalin!' : 'Salin Kode Kelas'}</span>
                </button>

                <button
                  onClick={() => {
                    onClose();
                    setCreatedClassCode(null);
                  }}
                  className="w-full py-2 text-xs font-bold text-[#6E828A] hover:text-[#163E4B] dark:hover:text-white cursor-pointer"
                >
                  Selesai
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreate} className="space-y-3.5">
                <div>
                  <label className="text-xs font-bold text-[#163E4B] dark:text-[#E2EEF2] block mb-1">
                    Nama Kelas *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: VII-A (Tahfidz & Sains) atau VIII-B"
                    value={newClassName}
                    onChange={(e) => setNewClassName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-2xl border border-[#DCE4E7] dark:border-[#214B59] bg-[#F7F7F5] dark:bg-[#0E242D] text-[#163E4B] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#F4A950]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#163E4B] dark:text-[#E2EEF2] block mb-1">
                    Tingkat Kelas MTs
                  </label>
                  <select
                    value={newGradeLevel}
                    onChange={(e) => setNewGradeLevel(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-2xl border border-[#DCE4E7] dark:border-[#214B59] bg-[#F7F7F5] dark:bg-[#0E242D] text-[#163E4B] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#F4A950]"
                  >
                    <option value="Kelas 7">Kelas 7 (Tingkat VII MTs)</option>
                    <option value="Kelas 8">Kelas 8 (Tingkat VIII MTs)</option>
                    <option value="Kelas 9">Kelas 9 (Tingkat IX MTs)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#163E4B] dark:text-[#E2EEF2] block mb-1">
                    Deskripsi Kelas (Opsional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Contoh: Kelas tahfidz dan riset sains MTs tahun ajaran 2026/2027..."
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-2xl border border-[#DCE4E7] dark:border-[#214B59] bg-[#F7F7F5] dark:bg-[#0E242D] text-[#163E4B] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#F4A950] resize-none"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-xs font-bold rounded-full text-[#6E828A] dark:text-[#96B2BC] hover:bg-[#F7F7F5] dark:hover:bg-[#193B48] cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-extrabold rounded-full bg-[#F4A950] hover:bg-[#E59638] text-[#163E4B] shadow-sm cursor-pointer transition-colors"
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
