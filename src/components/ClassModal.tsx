import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ClassRoom } from '../types';
import {
  KeyRound,
  Check,
  Copy,
  AlertCircle,
  X,
  Plus,
  Layers,
  Trash2,
} from 'lucide-react';

interface ClassModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ClassModal: React.FC<ClassModalProps> = ({ isOpen, onClose }) => {
  const {
    currentUser,
    classes,
    allClasses,
    joinMultipleClassesByCodes,
    createMultipleClasses,
  } = useApp();

  const isTeacher = currentUser.role === 'teacher';

  const [mode, setMode] = useState<'join' | 'create'>(isTeacher ? 'create' : 'join');

  // Sync mode if role changes
  React.useEffect(() => {
    if (!isTeacher) {
      setMode('join');
    }
  }, [isTeacher]);

  // Multi-Code Join State (supports 1, 2, or more class codes at once)
  const [codeInputs, setCodeInputs] = useState<string[]>(['', '']);
  const [joinResult, setJoinResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // Multi-Class Creation State for Teacher (supports 1, 2, or more classes at once)
  const [classRows, setClassRows] = useState<
    { name: string; gradeLevel: string; description: string }[]
  >([{ name: '', gradeLevel: 'Kelas 7', description: '' }]);
  const [createdClasses, setCreatedClasses] = useState<ClassRoom[]>([]);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  if (!isOpen) return null;

  const enrolledIdsSet = new Set(classes.map((c) => c.id));

  const toggleQuickSelectClassCode = (code: string) => {
    const upper = code.toUpperCase();
    setJoinResult(null);
    setCodeInputs((prev) => {
      const exists = prev.some((c) => c.trim().toUpperCase() === upper);
      if (exists) {
        const filtered = prev.filter((c) => c.trim().toUpperCase() !== upper);
        return filtered.length < 2
          ? [...filtered, ...Array(2 - filtered.length).fill('')]
          : filtered;
      }
      const emptyIdx = prev.findIndex((c) => !c.trim());
      if (emptyIdx >= 0) {
        const copy = [...prev];
        copy[emptyIdx] = upper;
        return copy;
      }
      return [...prev, upper];
    });
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    const validCodes = codeInputs.map((c) => c.trim()).filter(Boolean);
    if (validCodes.length === 0) {
      setJoinResult({
        success: false,
        message: 'Masukkan atau pilih minimal satu kode kelas terlebih dahulu.',
      });
      return;
    }

    const res = joinMultipleClassesByCodes(validCodes);
    setJoinResult({ success: res.success, message: res.message });

    if (res.success && res.notFoundCodes.length === 0) {
      setTimeout(() => {
        onClose();
        setJoinResult(null);
        setCodeInputs(['', '']);
      }, 1300);
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

    const validRows = classRows.filter((r) => r.name.trim().length > 0);
    if (validRows.length === 0) return;

    const created = createMultipleClasses(validRows);
    if (created.length > 0) {
      setCreatedClasses(created);
    }
  };

  const handleCopyCode = (code: string, idKey: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(idKey);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const handleResetAndClose = () => {
    setCreatedClasses([]);
    setClassRows([{ name: '', gradeLevel: 'Kelas 7', description: '' }]);
    setJoinResult(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B1E25]/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-[#132F3A] rounded-[28px] max-w-lg w-full p-5 shadow-[0_20px_50px_rgba(22,62,75,0.22)] border border-[#E8ECEE] dark:border-[#214B59] animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3.5 border-b border-[#E8ECEE] dark:border-[#214B59]">
          <div>
            <h3 className="font-extrabold text-[#163E4B] dark:text-white text-base">
              {isTeacher
                ? 'Manajemen Multi-Kelas (Guru)'
                : 'Gabung ke Dua Kelas atau Lebih (Siswa)'}
            </h3>
            <p className="text-[11px] text-[#6E828A] dark:text-[#96B2BC]">
              Saat ini Anda tergabung di{' '}
              <b className="text-[#163E4B] dark:text-[#F4A950] tabular-nums">
                {classes.length} kelas
              </b>
              . Anda dapat menambah 2 kelas atau lebih sekaligus.
            </p>
          </div>
          <button
            onClick={handleResetAndClose}
            className="text-[#8A9BA2] hover:text-[#163E4B] dark:hover:text-white p-1.5 rounded-full hover:bg-[#F7F7F5] dark:hover:bg-[#193B48] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode switcher tabs (Khusus Guru) / Info Banner (Siswa) */}
        {isTeacher ? (
          <div className="flex rounded-2xl bg-[#F7F7F5] dark:bg-[#0E242D] p-1 mt-3.5 border border-[#E8ECEE] dark:border-[#214B59]">
            <button
              type="button"
              onClick={() => {
                setMode('create');
                setCreatedClasses([]);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                mode === 'create'
                  ? 'bg-[#163E4B] text-white shadow-xs'
                  : 'text-[#6E828A] hover:text-[#163E4B] dark:text-[#96B2BC]'
              }`}
            >
              Buat Kelas Baru (Bisa 2+)
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('join');
                setJoinResult(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                mode === 'join'
                  ? 'bg-[#163E4B] text-white shadow-xs'
                  : 'text-[#6E828A] hover:text-[#163E4B] dark:text-[#96B2BC]'
              }`}
            >
              Gabung via Kode Kelas
            </button>
          </div>
        ) : (
          <div className="flex items-start gap-2.5 p-3.5 rounded-[22px] bg-[#FCEADE] dark:bg-[#F4A950]/15 border border-[#F4D3BA] dark:border-[#F4A950]/30 text-xs text-[#163E4B] dark:text-[#FCEADE] mt-3.5">
            <Layers className="w-4 h-4 text-[#E59638] shrink-0 mt-0.5" />
            <div className="leading-snug">
              <span className="font-extrabold block">
                Dukungan Multi-Kelas Aktif (2 Kelas atau Lebih)
              </span>
              <span className="text-[11px] text-[#5C717A] dark:text-[#C5DBE2] mt-0.5 block">
                Masukkan satu, dua, atau beberapa kode kelas sekaligus untuk tergabung di banyak mata pelajaran/kelas.
              </span>
            </div>
          </div>
        )}

        {/* ==================== MODE: GABUNG VIA KODE (1, 2, ATAU LEBIH KELAS) ==================== */}
        {mode === 'join' && (
          <form onSubmit={handleJoin} className="mt-4 space-y-3.5">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <label className="text-xs font-bold text-[#163E4B] dark:text-[#E2EEF2]">
                  Masukkan Kode Kelas (Bisa 1, 2, atau Lebih) *
                </label>
                <button
                  type="button"
                  onClick={() => setCodeInputs((prev) => [...prev, ''])}
                  className="text-xs font-extrabold text-[#C87A24] dark:text-[#F4A950] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Kolom Kode</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {codeInputs.map((codeVal, idx) => (
                  <div key={idx} className="relative flex items-center">
                    <KeyRound className="w-4 h-4 absolute left-3 text-[#8A9BA2] pointer-events-none" />
                    <input
                      type="text"
                      placeholder={`Kode Kelas ${idx + 1} (cth: VII-A-701)`}
                      value={codeVal}
                      onChange={(e) => {
                        const nextVal = e.target.value.toUpperCase();
                        setJoinResult(null);
                        setCodeInputs((prev) =>
                          prev.map((item, i) => (i === idx ? nextVal : item))
                        );
                      }}
                      className="w-full pl-9 pr-8 py-2.5 text-xs font-mono uppercase tracking-wider rounded-2xl border border-[#DCE4E7] dark:border-[#214B59] bg-[#F7F7F5] dark:bg-[#0E242D] text-[#163E4B] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#F4A950]"
                    />
                    {codeInputs.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          setCodeInputs((prev) => prev.filter((_, i) => i !== idx))
                        }
                        className="absolute right-2.5 text-[#8A9BA2] hover:text-rose-600 cursor-pointer"
                        title="Hapus kolom kode ini"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Available Classes Directory in School so Users Can Easily Pick 2+ Classes */}
            {allClasses.length > 0 && (
              <div className="p-3.5 rounded-2xl bg-[#F7F7F5] dark:bg-[#0E242D] border border-[#E8ECEE] dark:border-[#214B59] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-[#163E4B] dark:text-white">
                    Kelas Terdaftar di Sekolah ({allClasses.length})
                  </span>
                  <span className="text-[10px] text-[#6E828A] dark:text-[#96B2BC]">
                    Klik untuk pilih cepat
                  </span>
                </div>

                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-0.5">
                  {allClasses.map((cls) => {
                    const isAlreadyJoined = enrolledIdsSet.has(cls.id);
                    const isSelectedCode = codeInputs.some(
                      (c) => c.trim().toUpperCase() === cls.code.toUpperCase()
                    );

                    return (
                      <div
                        key={cls.id}
                        className="p-2.5 rounded-xl bg-white dark:bg-[#132F3A] border border-[#E6EAEB] dark:border-[#214B59] flex items-center justify-between gap-2 text-xs"
                      >
                        <div className="min-w-0">
                          <p className="font-extrabold text-[#163E4B] dark:text-white truncate">
                            {cls.name}
                          </p>
                          <p className="text-[11px] text-[#6E828A] dark:text-[#96B2BC] truncate tabular-nums">
                            {cls.teacherName} · Kode:{' '}
                            <span className="font-mono font-bold text-[#163E4B] dark:text-[#F4A950]">
                              {cls.code}
                            </span>
                          </p>
                        </div>

                        {isAlreadyJoined ? (
                          <span className="px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold shrink-0 flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            <span>Tergabung</span>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => toggleQuickSelectClassCode(cls.code)}
                            className={`px-3 py-1 rounded-xl text-[11px] font-extrabold shrink-0 transition-all cursor-pointer flex items-center gap-1 ${
                              isSelectedCode
                                ? 'bg-[#163E4B] text-white'
                                : 'bg-[#FCEADE] text-[#163E4B] hover:bg-[#F7D9C2]'
                            }`}
                          >
                            {isSelectedCode ? (
                              <>
                                <Check className="w-3 h-3 text-[#F4A950]" />
                                <span>Dipilih</span>
                              </>
                            ) : (
                              <>
                                <Plus className="w-3 h-3 text-[#E59638]" />
                                <span>Pilih</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

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
                onClick={handleResetAndClose}
                className="px-4 py-2 text-xs font-bold rounded-full text-[#6E828A] dark:text-[#96B2BC] hover:bg-[#F7F7F5] dark:hover:bg-[#193B48] cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-extrabold rounded-full bg-[#F4A950] hover:bg-[#E59638] text-[#163E4B] shadow-sm cursor-pointer transition-colors"
              >
                Gabung ke Kelas Terpilih
              </button>
            </div>
          </form>
        )}

        {/* ==================== MODE: BUAT KELAS BARU (GURU — BISA 1, 2, ATAU LEBIH KELAS) ==================== */}
        {mode === 'create' && (
          <div className="mt-4">
            {createdClasses.length > 0 ? (
              <div className="space-y-4 py-1">
                <div className="text-center space-y-1">
                  <div className="w-12 h-12 rounded-full bg-[#FCEADE] text-[#163E4B] flex items-center justify-center mx-auto border border-[#F4D3BA]">
                    <Check className="w-6 h-6 text-[#E59638]" />
                  </div>
                  <h4 className="font-extrabold text-[#163E4B] dark:text-white text-base">
                    {createdClasses.length > 1
                      ? `${createdClasses.length} Kelas Berhasil Dibuat!`
                      : 'Kelas Berhasil Dibuat!'}
                  </h4>
                  <p className="text-xs text-[#6E828A] dark:text-[#96B2BC]">
                    Bagikan kode kelas berikut kepada siswa agar dapat masuk ke masing-masing kelas:
                  </p>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {createdClasses.map((cls) => (
                    <div
                      key={cls.id}
                      className="p-3.5 rounded-2xl bg-[#163E4B] text-white flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-[#FCEADE] block truncate">
                          {cls.name} · {cls.gradeLevel}
                        </span>
                        <span className="font-mono text-lg font-black text-[#F4A950] tracking-wider tabular-nums">
                          {cls.code}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleCopyCode(cls.code, cls.id)}
                        className="px-3.5 py-2 rounded-xl bg-[#F4A950] hover:bg-[#E59638] text-[#163E4B] text-xs font-extrabold flex items-center gap-1.5 shrink-0 cursor-pointer"
                      >
                        {copiedCodeId === cls.id ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Tersalin</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Salin</span>
                          </>
                        )}
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setCreatedClasses([]);
                      setClassRows([{ name: '', gradeLevel: 'Kelas 7', description: '' }]);
                    }}
                    className="flex-1 py-2.5 rounded-full border border-[#DCE4E7] dark:border-[#245363] text-xs font-bold text-[#163E4B] dark:text-white hover:bg-[#F7F7F5] dark:hover:bg-[#193B48] cursor-pointer"
                  >
                    + Buat Kelas Lagi
                  </button>
                  <button
                    type="button"
                    onClick={handleResetAndClose}
                    className="flex-1 py-2.5 rounded-full bg-[#F4A950] hover:bg-[#E59638] text-[#163E4B] text-xs font-extrabold shadow-sm cursor-pointer"
                  >
                    Selesai & Buka Kelas
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreate} className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#6E828A] dark:text-[#96B2BC]">
                    Anda dapat membuat 1, 2, atau lebih kelas sekaligus:
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setClassRows((prev) => [
                        ...prev,
                        { name: '', gradeLevel: 'Kelas 8', description: '' },
                      ])
                    }
                    className="text-xs font-extrabold text-[#C87A24] dark:text-[#F4A950] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Kelas Kedua / Lainnya</span>
                  </button>
                </div>

                <div className="space-y-3 max-h-72 overflow-y-auto pr-0.5">
                  {classRows.map((row, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-[#F7F7F5] dark:bg-[#0E242D] border border-[#E4E8E9] dark:border-[#214B59] space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-[#163E4B] dark:text-[#F4A950]">
                          Kelas #{idx + 1}
                        </span>
                        {classRows.length > 1 && (
                          <button
                            type="button"
                            onClick={() =>
                              setClassRows((prev) => prev.filter((_, i) => i !== idx))
                            }
                            className="text-[11px] font-bold text-rose-600 hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Hapus</span>
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div className="sm:col-span-2">
                          <label className="text-[11px] font-bold text-[#163E4B] dark:text-[#E2EEF2] block mb-1">
                            Nama Kelas *
                          </label>
                          <input
                            type="text"
                            required={idx === 0}
                            placeholder={
                              idx === 0 ? 'Contoh: VII-A (Tahfidz)' : 'Contoh: VIII-B (Sains)'
                            }
                            value={row.name}
                            onChange={(e) => {
                              const val = e.target.value;
                              setClassRows((prev) =>
                                prev.map((r, i) => (i === idx ? { ...r, name: val } : r))
                              );
                            }}
                            className="w-full px-3 py-2 text-xs rounded-xl border border-[#DCE4E7] dark:border-[#214B59] bg-white dark:bg-[#132F3A] text-[#163E4B] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#F4A950]"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-[#163E4B] dark:text-[#E2EEF2] block mb-1">
                            Tingkat
                          </label>
                          <select
                            value={row.gradeLevel}
                            onChange={(e) => {
                              const val = e.target.value;
                              setClassRows((prev) =>
                                prev.map((r, i) => (i === idx ? { ...r, gradeLevel: val } : r))
                              );
                            }}
                            className="w-full px-2.5 py-2 text-xs rounded-xl border border-[#DCE4E7] dark:border-[#214B59] bg-white dark:bg-[#132F3A] text-[#163E4B] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#F4A950]"
                          >
                            <option value="Kelas 7">Kelas 7</option>
                            <option value="Kelas 8">Kelas 8</option>
                            <option value="Kelas 9">Kelas 9</option>
                            <option value="Kelas 10">Kelas 10</option>
                            <option value="Kelas 11">Kelas 11</option>
                            <option value="Kelas 12">Kelas 12</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-[#163E4B] dark:text-[#E2EEF2] block mb-1">
                          Deskripsi Singkat (Opsional)
                        </label>
                        <input
                          type="text"
                          placeholder="Contoh: Kelas unggulan semester ganjil 2026/2027"
                          value={row.description}
                          onChange={(e) => {
                            const val = e.target.value;
                            setClassRows((prev) =>
                              prev.map((r, i) => (i === idx ? { ...r, description: val } : r))
                            );
                          }}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-[#DCE4E7] dark:border-[#214B59] bg-white dark:bg-[#132F3A] text-[#163E4B] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#F4A950]"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={handleResetAndClose}
                    className="px-4 py-2 text-xs font-bold rounded-full text-[#6E828A] dark:text-[#96B2BC] hover:bg-[#F7F7F5] dark:hover:bg-[#193B48] cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-extrabold rounded-full bg-[#F4A950] hover:bg-[#E59638] text-[#163E4B] shadow-sm cursor-pointer transition-colors"
                  >
                    {classRows.filter((r) => r.name.trim()).length > 1
                      ? `Buat ${classRows.filter((r) => r.name.trim()).length} Kelas Sekaligus`
                      : 'Buat & Dapatkan Kode'}
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
