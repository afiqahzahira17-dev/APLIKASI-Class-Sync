import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Calendar,
  Download,
  Upload,
  CheckCircle,
  AlertCircle,
  X,
  Sparkles,
} from 'lucide-react';
import {
  generateIcsCalendar,
  downloadIcsFile,
  parseIcsContent,
  ParsedScheduleCandidate,
} from '../utils/icsCalendar';

interface CalendarImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CalendarImportExportModal: React.FC<CalendarImportExportModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { activeClass, schedules, importScheduleItemsBatch } = useApp();
  const [activeTab, setActiveTab] = useState<'import' | 'export'>('import');

  // Import state
  const [, setFileContent] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [parsedCandidates, setParsedCandidates] = useState<ParsedScheduleCandidate[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  const [isImporting, setIsImporting] = useState(false);
  const [importSuccessCount, setImportSuccessCount] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Filter current active class schedules
  const classSchedules = activeClass
    ? schedules.filter((s) => s.classId === activeClass.id)
    : [];

  const daysLabel: Record<number, string> = {
    1: 'Senin',
    2: 'Selasa',
    3: 'Rabu',
    4: 'Kamis',
    5: 'Jumat',
    6: 'Sabtu',
  };

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg('');
    setImportSuccessCount(null);
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setFileContent(content);

      try {
        const candidates = parseIcsContent(content);
        if (candidates.length === 0) {
          setErrorMsg(
            'Tidak ditemukan event jadwal dalam file .ics ini. Pastikan file valid dari Google Calendar atau iCalendar.'
          );
          setParsedCandidates([]);
          setSelectedIndices(new Set());
        } else {
          setParsedCandidates(candidates);
          setSelectedIndices(new Set(candidates.map((_, i) => i)));
        }
      } catch (err: any) {
        setErrorMsg('Gagal membaca format kalender: ' + (err.message || 'File tidak valid'));
      }
    };
    reader.readAsText(file);
  };

  const handleToggleSelect = (idx: number) => {
    setSelectedIndices((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) {
        next.delete(idx);
      } else {
        next.add(idx);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedIndices.size === parsedCandidates.length) {
      setSelectedIndices(new Set());
    } else {
      setSelectedIndices(new Set(parsedCandidates.map((_, i) => i)));
    }
  };

  const handleExecuteImport = async () => {
    if (!activeClass || selectedIndices.size === 0) return;
    setIsImporting(true);
    setErrorMsg('');

    try {
      const toImport = parsedCandidates
        .filter((_, idx) => selectedIndices.has(idx))
        .map((c) => ({
          classId: activeClass.id,
          subjectName: c.subjectName,
          teacherName: c.teacherName,
          dayOfWeek: c.dayOfWeek === 7 ? 1 : c.dayOfWeek,
          startTime: c.startTime,
          endTime: c.endTime,
          roomLocation: c.roomLocation,
          colorTheme: c.colorTheme,
          notes: c.notes || 'Diimpor dari kalender .ics',
        }));

      const count = await importScheduleItemsBatch(toImport);
      setImportSuccessCount(count);
      setParsedCandidates([]);
      setSelectedIndices(new Set());
      setFileName('');
      setFileContent('');
    } catch (err: any) {
      setErrorMsg('Gagal mengimpor jadwal: ' + err.message);
    } finally {
      setIsImporting(false);
    }
  };

  const handleExportIcs = () => {
    if (!activeClass) return;
    const icsString = generateIcsCalendar(activeClass.name, classSchedules);
    const safeName = `Jadwal_${activeClass.name.replace(/[^a-zA-Z0-9]/g, '_')}`;
    downloadIcsFile(safeName, icsString);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 bg-[#0B1E25]/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#132F3A] border border-[#E8ECEE] dark:border-[#214B59] rounded-[28px] w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-[0_20px_50px_rgba(22,62,75,0.2)] p-5 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#163E4B] text-[#F4A950] flex items-center justify-center font-bold">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[#163E4B] dark:text-white flex items-center gap-2 flex-wrap">
                <span>Integrasi Kalender Otomatis</span>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#FCEADE] text-[#8A4F14] dark:bg-[#F4A950]/20 dark:text-[#F4A950]">
                  Google Calendar & .ics
                </span>
              </h3>
              <p className="text-xs text-[#6E828A] dark:text-[#96B2BC]">
                Impor atau ekspor jadwal KBM {activeClass ? `(${activeClass.name})` : ''} tanpa repot
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#8A9BA2] hover:text-[#163E4B] dark:hover:text-white rounded-full hover:bg-[#F7F7F5] dark:hover:bg-[#193B48] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-full bg-[#F7F7F5] dark:bg-[#0E242D] p-1 border border-[#E8ECEE] dark:border-[#214B59]">
          <button
            onClick={() => setActiveTab('import')}
            className={`flex-1 py-2 text-xs font-bold rounded-full transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'import'
                ? 'bg-[#163E4B] text-white shadow-xs'
                : 'text-[#6E828A] hover:text-[#163E4B] dark:text-[#96B2BC]'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Impor dari Google Cal / .ics</span>
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={`flex-1 py-2 text-xs font-bold rounded-full transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'export'
                ? 'bg-[#163E4B] text-white shadow-xs'
                : 'text-[#6E828A] hover:text-[#163E4B] dark:text-[#96B2BC]'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor ke Kalender HP (.ics)</span>
          </button>
        </div>

        {/* TAB 1: IMPORT */}
        {activeTab === 'import' && (
          <div className="space-y-3.5">
            {!activeClass ? (
              <div className="p-4 rounded-2xl border border-dashed border-[#D5DFE3] dark:border-[#214B59] text-center text-xs text-[#6E828A]">
                Pilih atau buat kelas terlebih dahulu sebelum mengimpor jadwal.
              </div>
            ) : (
              <>
                {/* Upload zone */}
                <div className="border-2 border-dashed border-[#D5DFE3] dark:border-[#214B59] rounded-[24px] p-5 text-center hover:border-[#F4A950] transition-colors bg-[#F7F7F5] dark:bg-[#0E242D]">
                  <Upload className="w-8 h-8 text-[#E59638] mx-auto mb-2" />
                  <p className="text-xs font-extrabold text-[#163E4B] dark:text-white">
                    Pilih File Kalender (.ics)
                  </p>
                  <p className="text-[11px] text-[#6E828A] dark:text-[#96B2BC] max-w-sm mx-auto mt-0.5">
                    Dapat berupa file export dari <b>Google Calendar</b>, <b>Apple Calendar</b>, atau jadwal kalender sekolah.
                  </p>

                  <label className="inline-flex items-center gap-1.5 mt-3 px-5 py-2 bg-[#F4A950] hover:bg-[#E59638] text-[#163E4B] rounded-full text-xs font-extrabold cursor-pointer transition-colors shadow-xs">
                    <span>Pilih File .ics</span>
                    <input
                      type="file"
                      accept=".ics,text/calendar"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>

                  {fileName && (
                    <p className="text-xs font-mono text-[#163E4B] dark:text-[#F4A950] mt-2 font-bold">
                      File terpilih: {fileName}
                    </p>
                  )}
                </div>

                {/* Error feedback */}
                {errorMsg && (
                  <div className="p-3 rounded-2xl bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Success feedback */}
                {importSuccessCount !== null && (
                  <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    <span>
                      Berhasil mengimpor {importSuccessCount} mata pelajaran ke kelas {activeClass.name}!
                    </span>
                  </div>
                )}

                {/* Candidate preview table */}
                {parsedCandidates.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#163E4B] dark:text-white">
                        Ditemukan {parsedCandidates.length} Jadwal:
                      </span>
                      <button
                        onClick={handleSelectAll}
                        className="text-[#C87A24] dark:text-[#F4A950] font-bold hover:underline cursor-pointer"
                      >
                        {selectedIndices.size === parsedCandidates.length
                          ? 'Batalkan Semua'
                          : 'Pilih Semua'}
                      </button>
                    </div>

                    <div className="max-h-48 overflow-y-auto space-y-1.5 border border-[#E8ECEE] dark:border-[#214B59] rounded-2xl p-2 bg-[#F7F7F5] dark:bg-[#0E242D]">
                      {parsedCandidates.map((c, idx) => {
                        const isChecked = selectedIndices.has(idx);
                        return (
                          <div
                            key={idx}
                            onClick={() => handleToggleSelect(idx)}
                            className={`p-2.5 rounded-xl border text-xs flex items-center justify-between gap-2 cursor-pointer transition-all ${
                              isChecked
                                ? 'bg-[#FCEADE] dark:bg-[#F4A950]/15 border-[#F4D3BA] dark:border-[#F4A950]/35'
                                : 'bg-white dark:bg-[#132F3A] border-[#E8ECEE] dark:border-[#214B59] opacity-60'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {}}
                                className="rounded accent-[#163E4B]"
                              />
                              <div className="min-w-0">
                                <p className="font-bold text-[#163E4B] dark:text-white truncate">
                                  {c.subjectName}
                                </p>
                                <p className="text-[10px] text-[#6E828A] dark:text-[#96B2BC] truncate">
                                  {c.teacherName} • {c.roomLocation}
                                </p>
                              </div>
                            </div>

                            <div className="text-right shrink-0">
                              <span className="inline-block px-2 py-0.5 rounded-full bg-[#163E4B] text-white font-bold text-[10px]">
                                {daysLabel[c.dayOfWeek] || 'Senin'}
                              </span>
                              <p className="text-[10px] font-mono tabular-nums text-[#6E828A] dark:text-[#96B2BC] mt-0.5">
                                {c.startTime} - {c.endTime}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <button
                      onClick={handleExecuteImport}
                      disabled={isImporting || selectedIndices.size === 0}
                      className="w-full py-2.5 rounded-full bg-[#F4A950] hover:bg-[#E59638] text-[#163E4B] text-xs font-extrabold shadow-sm transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>
                        {isImporting
                          ? 'Mengimpor Jadwal...'
                          : `Impor ${selectedIndices.size} Jadwal ke ${activeClass.name}`}
                      </span>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* TAB 2: EXPORT */}
        {activeTab === 'export' && (
          <div className="space-y-4">
            {!activeClass ? (
              <div className="p-4 rounded-2xl border border-dashed border-[#D5DFE3] dark:border-[#214B59] text-center text-xs text-[#6E828A]">
                Pilih kelas terlebih dahulu untuk mengekspor jadwal.
              </div>
            ) : (
              <>
                <div className="p-4 rounded-[24px] bg-[#FCEADE] dark:bg-[#F4A950]/15 border border-[#F4D3BA] dark:border-[#F4A950]/30 space-y-2">
                  <div className="flex items-center gap-2">
                    <Download className="w-5 h-5 text-[#E59638]" />
                    <h4 className="font-extrabold text-sm text-[#163E4B] dark:text-[#FCEADE]">
                      Ekspor Jadwal {activeClass.name} ({classSchedules.length} Sesi)
                    </h4>
                  </div>
                  <p className="text-xs text-[#4B636D] dark:text-[#D2E2E8] leading-relaxed">
                    File <b>.ics</b> berulang mingguan ini kompatibel 100% dengan:
                  </p>
                  <ul className="grid grid-cols-2 gap-1.5 text-xs font-bold text-[#163E4B] dark:text-white">
                    <li className="flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-[#E59638]" />
                      <span>Google Calendar (Android/Web)</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-[#E59638]" />
                      <span>Apple Calendar (iPhone/iPad/Mac)</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-[#E59638]" />
                      <span>Microsoft Outlook</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-[#E59638]" />
                      <span>Kalender bawaan HP</span>
                    </li>
                  </ul>
                </div>

                <button
                  onClick={handleExportIcs}
                  disabled={classSchedules.length === 0}
                  className="w-full py-2.5 rounded-full bg-[#F4A950] hover:bg-[#E59638] text-[#163E4B] text-xs font-extrabold shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>
                    {classSchedules.length === 0
                      ? 'Belum Ada Jadwal untuk Diekspor'
                      : `Unduh File Kalender (${classSchedules.length} Jadwal .ics)`}
                  </span>
                </button>

                <div className="bg-[#F7F7F5] dark:bg-[#0E242D] p-3.5 rounded-[22px] border border-[#E8ECEE] dark:border-[#214B59] space-y-1 text-xs text-[#4B636D] dark:text-[#C5DBE2]">
                  <p className="font-extrabold text-[#163E4B] dark:text-white">
                    Cara Pasang di Google Calendar HP:
                  </p>
                  <ol className="list-decimal list-inside space-y-0.5 text-[11px] text-[#6E828A] dark:text-[#96B2BC]">
                    <li>Klik <b>Unduh File Kalender</b> di atas.</li>
                    <li>Buka file hasil unduhan langsung di HP Anda.</li>
                    <li>Pilih <b>"Tambahkan Semua ke Kalender"</b>.</li>
                    <li>Jadwal KBM akan otomatis muncul lengkap dengan pengingat waktu!</li>
                  </ol>
                </div>
              </>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="pt-2 flex justify-end border-t border-[#E8ECEE] dark:border-[#214B59]">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#F7F7F5] hover:bg-[#E8ECEE] dark:bg-[#0E242D] dark:hover:bg-[#193B48] text-[#163E4B] dark:text-white rounded-full text-xs font-bold cursor-pointer transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
