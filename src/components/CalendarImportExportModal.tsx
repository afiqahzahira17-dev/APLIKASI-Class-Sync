import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Calendar,
  Download,
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  X,
  Clock,
  MapPin,
  Sparkles,
  ArrowRight,
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
  const [fileContent, setFileContent] = useState<string>('');
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
          // select all by default
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
          dayOfWeek: c.dayOfWeek,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl p-5 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <span>Integrasi Kalender Otomatis</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                  Google Calendar & .ics
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Impor atau ekspor jadwal KBM {activeClass ? `(${activeClass.name})` : ''} tanpa repot
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

        {/* Tab Switcher */}
        <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
          <button
            onClick={() => setActiveTab('import')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'import'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Impor dari Google Cal / .ics</span>
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'export'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
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
              <div className="p-4 rounded-xl border border-dashed text-center text-xs text-slate-500">
                Pilih atau buat kelas terlebih dahulu sebelum mengimpor jadwal.
              </div>
            ) : (
              <>
                {/* Upload zone */}
                <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-5 text-center hover:border-indigo-400 transition-colors bg-slate-50/50 dark:bg-slate-800/40">
                  <Upload className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Pilih File Kalender (.ics)
                  </p>
                  <p className="text-[11px] text-slate-400 max-w-sm mx-auto mt-0.5">
                    Dapat berupa file export dari <b>Google Calendar</b>, <b>Apple Calendar</b>, atau jadwal kalender sekolah.
                  </p>

                  <label className="inline-flex items-center gap-1.5 mt-3 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-xs">
                    <span>Pilih File .ics</span>
                    <input
                      type="file"
                      accept=".ics,text/calendar"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>

                  {fileName && (
                    <p className="text-xs font-mono text-indigo-600 dark:text-indigo-400 mt-2 font-medium">
                      File terpilih: {fileName}
                    </p>
                  )}
                </div>

                {/* Error feedback */}
                {errorMsg && (
                  <div className="p-3 rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Success feedback */}
                {importSuccessCount !== null && (
                  <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs flex items-center gap-2">
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
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        Ditemukan {parsedCandidates.length} Jadwal:
                      </span>
                      <button
                        onClick={handleSelectAll}
                        className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                      >
                        {selectedIndices.size === parsedCandidates.length
                          ? 'Batalkan Semua'
                          : 'Pilih Semua'}
                      </button>
                    </div>

                    <div className="max-h-48 overflow-y-auto space-y-1.5 border border-slate-200 dark:border-slate-800 rounded-xl p-2 bg-slate-50/50 dark:bg-slate-900/50">
                      {parsedCandidates.map((c, idx) => {
                        const isChecked = selectedIndices.has(idx);
                        return (
                          <div
                            key={idx}
                            onClick={() => handleToggleSelect(idx)}
                            className={`p-2 rounded-lg border text-xs flex items-center justify-between gap-2 cursor-pointer transition-all ${
                              isChecked
                                ? 'bg-indigo-50/60 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800'
                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 opacity-60'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {}} // handled by div click
                                className="rounded text-indigo-600 focus:ring-0"
                              />
                              <div className="min-w-0">
                                <p className="font-bold text-slate-800 dark:text-slate-200 truncate">
                                  {c.subjectName}
                                </p>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                                  {c.teacherName} • {c.roomLocation}
                                </p>
                              </div>
                            </div>

                            <div className="text-right shrink-0">
                              <span className="inline-block px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-bold text-[10px] text-slate-700 dark:text-slate-300">
                                {daysLabel[c.dayOfWeek] || 'Senin'}
                              </span>
                              <p className="text-[10px] font-mono text-slate-500 mt-0.5">
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
                      className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
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
              <div className="p-4 rounded-xl border border-dashed text-center text-xs text-slate-500">
                Pilih kelas terlebih dahulu untuk mengekspor jadwal.
              </div>
            ) : (
              <>
                <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 space-y-2">
                  <div className="flex items-center gap-2">
                    <Download className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      Ekspor Jadwal {activeClass.name} ({classSchedules.length} Sesi)
                    </h4>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    File <b>.ics</b> berulang mingguan ini kompatibel 100% dengan:
                  </p>
                  <ul className="grid grid-cols-2 gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-200">
                    <li className="flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Google Calendar (Android/Web)</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Apple Calendar (iPhone/iPad/Mac)</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Microsoft Outlook</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Kalender bawaan HP Xiaomi / Samsung</span>
                    </li>
                  </ul>
                </div>

                <button
                  onClick={handleExportIcs}
                  disabled={classSchedules.length === 0}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  <span>
                    {classSchedules.length === 0
                      ? 'Belum Ada Jadwal untuk Diekspor'
                      : `Unduh File Kalender (${classSchedules.length} Jadwal .ics)`}
                  </span>
                </button>

                <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl space-y-1 text-xs text-slate-600 dark:text-slate-300">
                  <p className="font-bold text-slate-800 dark:text-slate-100">
                    Cara Pasang di Google Calendar HP:
                  </p>
                  <ol className="list-decimal list-inside space-y-0.5 text-[11px] text-slate-500 dark:text-slate-400">
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
