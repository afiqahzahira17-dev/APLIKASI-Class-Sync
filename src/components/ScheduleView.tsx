import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { ScheduleItem } from '../types';
import { EmptyClassState } from './EmptyClassState';
import { WeeklyGridView } from './WeeklyGridView';
import { CalendarImportExportModal } from './CalendarImportExportModal';
import { TeacherPhoneVerificationModal } from './TeacherPhoneVerificationModal';
import {
  calculateClassProgress,
  timeToMinutes,
  minutesToTimeString,
} from '../utils/witaTime';
import {
  Clock,
  MapPin,
  UserCheck,
  Plus,
  Edit2,
  Trash2,
  Sparkles,
  Info,
  Calendar,
  AlertCircle,
  Radio,
  BookOpen,
  CheckCircle2,
  Filter,
  LayoutGrid,
  CalendarDays,
  FileSpreadsheet,
  MessageCircle,
  ShieldCheck,
  ExternalLink,
  RotateCcw,
  Zap,
} from 'lucide-react';

interface ScheduleViewProps {
  onOpenClassModal?: () => void;
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({ onOpenClassModal }) => {
  const {
    activeClass,
    schedules,
    currentUser,
    addScheduleItem,
    updateScheduleItem,
    deleteScheduleItem,
    simulatedDay,
    setSimulatedDay,
    simulatedTime,
    setSimulatedTime,
    privacySettings,
    witaTimeInfo,
    isRealTimeWita,
    setIsRealTimeWita,
    syncToCurrentWitaTime,
    activeLiveClass,
    createLiveScheduleNow,
  } = useApp();

  const [viewMode, setViewMode] = useState<'daily' | 'weekly_grid'>('daily');
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number>(
    isRealTimeWita ? witaTimeInfo.dayOfWeek : simulatedDay
  );
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<ScheduleItem | null>(null);

  // Form states for Add / Edit Schedule
  const [subjectName, setSubjectName] = useState('');
  const [teacherName, setTeacherName] = useState(
    currentUser.role === 'teacher' ? currentUser.name : ''
  );
  const [startTime, setStartTime] = useState('07:30');
  const [endTime, setEndTime] = useState('09:00');
  const [roomLocation, setRoomLocation] = useState('Ruang 7-A (Lantai 1)');
  const [colorTheme, setColorTheme] = useState('blue');
  const [notes, setNotes] = useState('');

  const days = [
    { id: 1, label: 'Senin', short: 'Sen' },
    { id: 2, label: 'Selasa', short: 'Sel' },
    { id: 3, label: 'Rabu', short: 'Rab' },
    { id: 4, label: 'Kamis', short: 'Kam' },
    { id: 5, label: 'Jumat', short: 'Jum' },
    { id: 6, label: 'Sabtu', short: 'Sab' },
    { id: 7, label: 'Minggu', short: 'Min' },
  ];

  const effectiveDay = isRealTimeWita ? witaTimeInfo.dayOfWeek : simulatedDay;
  const effectiveMinutes = isRealTimeWita
    ? witaTimeInfo.totalMinutes
    : timeToMinutes(simulatedTime);
  const effectiveSeconds = isRealTimeWita ? witaTimeInfo.seconds : 0;

  // Filter schedules for the current active class and selected day, sorted chronologically
  const daySchedules = useMemo(() => {
    if (!activeClass) return [];
    return schedules
      .filter((s) => s.classId === activeClass.id && s.dayOfWeek === selectedDay)
      .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
  }, [schedules, activeClass, selectedDay]);

  // Automatically select today's day when real-time WITA is active
  React.useEffect(() => {
    if (isRealTimeWita) {
      setSelectedDay(witaTimeInfo.dayOfWeek);
    }
  }, [isRealTimeWita, witaTimeInfo.dayOfWeek]);

  // Determine if there is ANY live class right now in WITA for this class
  const liveClassToday = useMemo(() => {
    if (!activeClass) return null;
    return (
      schedules
        .filter((s) => s.classId === activeClass.id && s.dayOfWeek === effectiveDay)
        .find((s) => {
          const startMin = timeToMinutes(s.startTime);
          const endMin = timeToMinutes(s.endTime);
          return effectiveMinutes >= startMin && effectiveMinutes < endMin;
        }) || null
    );
  }, [schedules, activeClass, effectiveDay, effectiveMinutes]);

  // Real-time progress with seconds precision
  const liveClassProgress = useMemo(() => {
    if (!liveClassToday) return null;
    return calculateClassProgress(
      liveClassToday.startTime,
      liveClassToday.endTime,
      effectiveMinutes,
      effectiveSeconds
    );
  }, [liveClassToday, effectiveMinutes, effectiveSeconds]);

  // Next upcoming class on today's effective day
  const upcomingClass = useMemo(() => {
    if (!activeClass) return null;
    return (
      schedules
        .filter((s) => s.classId === activeClass.id && s.dayOfWeek === effectiveDay)
        .filter((s) => timeToMinutes(s.startTime) > effectiveMinutes)
        .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime))[0] || null
    );
  }, [schedules, activeClass, effectiveDay, effectiveMinutes]);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setSubjectName('');
    setTeacherName(currentUser.role === 'teacher' ? currentUser.name : '');
    setStartTime('07:30');
    setEndTime('09:00');
    setRoomLocation('Ruang 7-A (Lantai 1)');
    setColorTheme('blue');
    setNotes('');
    setShowAddModal(true);
  };

  const handleOpenEdit = (item: ScheduleItem) => {
    setEditingItem(item);
    setSubjectName(item.subjectName);
    setTeacherName(item.teacherName);
    setStartTime(item.startTime);
    setEndTime(item.endTime);
    setRoomLocation(item.roomLocation);
    setColorTheme(item.colorTheme || 'blue');
    setNotes(item.notes || '');
    setShowAddModal(true);
  };

  const handleSubmitSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeClass || !subjectName.trim() || !roomLocation.trim()) return;

    if (editingItem) {
      updateScheduleItem(editingItem.id, {
        subjectName,
        teacherName,
        startTime,
        endTime,
        roomLocation,
        colorTheme,
        notes,
      });
    } else {
      addScheduleItem({
        classId: activeClass.id,
        dayOfWeek: selectedDay,
        subjectName,
        teacherName,
        startTime,
        endTime,
        roomLocation,
        colorTheme,
        notes,
      });
    }
    setShowAddModal(false);
  };

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'red':
        return {
          bg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/60',
          badge: 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300',
          accent: 'border-l-rose-500',
        };
      case 'emerald':
      case 'teal':
        return {
          bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/60',
          badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
          accent: 'border-l-emerald-500',
        };
      case 'amber':
      case 'orange':
        return {
          bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/60',
          badge: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
          accent: 'border-l-amber-500',
        };
      case 'purple':
      case 'violet':
        return {
          bg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-900/60',
          badge: 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300',
          accent: 'border-l-purple-500',
        };
      case 'cyan':
        return {
          bg: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-200 dark:border-cyan-900/60',
          badge: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300',
          accent: 'border-l-cyan-500',
        };
      default:
        return {
          bg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900/60',
          badge: 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300',
          accent: 'border-l-blue-500',
        };
    }
  };

  if (!activeClass) {
    return (
      <EmptyClassState
        onOpenClassModal={onOpenClassModal}
        message="Anda belum memiliki kelas. Buat kelas pertama untuk mulai menyusun jadwal pelajaran harian."
      />
    );
  }

  return (
    <div className="space-y-4 pb-24">
      {/* Real-time WITA Date & Clock Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-300 flex items-center justify-center font-bold shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                Waktu Indonesia Tengah (WITA, UTC+8)
              </span>
              <span
                className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isRealTimeWita
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                }`}
              >
                <Radio
                  className={`w-2.5 h-2.5 ${isRealTimeWita ? 'text-emerald-600 animate-pulse' : 'text-amber-600'}`}
                />
                {isRealTimeWita ? 'Sinkron Waktu Nyata Otomatis' : 'Mode Simulasi Manual'}
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 font-medium flex items-center gap-1.5 flex-wrap">
              <span>{witaTimeInfo.formattedDate}</span>
              <span>•</span>
              <span className="font-mono font-bold text-sky-600 dark:text-sky-400 text-sm">
                {witaTimeInfo.formattedTimeWithSeconds} WITA
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isRealTimeWita ? (
            <button
              onClick={syncToCurrentWitaTime}
              className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Kembalikan ke WITA Nyata</span>
            </button>
          ) : (
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-xl border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Kelas Terhubung ke Jam Nyata WITA</span>
            </span>
          )}
        </div>
      </div>

      {/* Top Banner: Sedang Berlangsung Hari Ini di WITA */}
      {liveClassToday ? (
        <div className="rounded-2xl bg-gradient-to-r from-emerald-500/15 via-emerald-500/10 to-teal-500/15 border-2 border-emerald-500/90 p-4 sm:p-5 text-slate-900 dark:text-slate-100 shadow-md ring-2 ring-emerald-500/20 animate-in fade-in">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="space-y-1.5 flex-1 min-w-[240px]">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-extrabold uppercase tracking-wider shadow-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
                <span>SEDANG BERLANGSUNG SEKARANG (WITA)</span>
              </div>
              <h2 className="text-lg sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white pt-0.5">
                {liveClassToday.subjectName}
              </h2>
              <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400 flex-wrap">
                <span className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                  {liveClassToday.teacherName}
                </span>
                <span className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
                  <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  {privacySettings.hideSpecificLocations
                    ? 'Ruang Kelas'
                    : liveClassToday.roomLocation}
                </span>
              </div>
            </div>

            <div className="text-right shrink-0">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border-2 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-mono text-xs font-black shadow-xs">
                <Clock className="w-4 h-4 text-emerald-600" />
                {liveClassToday.startTime} - {liveClassToday.endTime} WITA
              </div>
              <div className="text-xs font-black text-emerald-700 dark:text-emerald-400 mt-1">
                Sisa {liveClassProgress?.formattedRemaining || 'Sedang Berjalan'}
              </div>
            </div>
          </div>

          {/* Real-time Session Progress Bar */}
          <div className="mt-3.5 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
              <span className="flex items-center gap-1">
                <Radio className="w-3 h-3 text-emerald-600 animate-pulse" />
                Waktu Nyata WITA: {witaTimeInfo.formattedTimeWithSeconds} WITA
              </span>
              <span>Progres Sesi: {liveClassProgress?.percent || 0}% Selesai</span>
            </div>
            <div className="w-full bg-emerald-950/20 dark:bg-emerald-900/40 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-emerald-600 h-full rounded-full transition-all duration-1000 ease-linear shadow-xs"
                style={{ width: `${liveClassProgress?.percent || 0}%` }}
              />
            </div>
          </div>

          {/* Footer actions inside live banner */}
          <div className="mt-3.5 pt-3 border-t border-emerald-200/60 dark:border-emerald-800/60 flex items-center justify-between gap-3 flex-wrap text-xs">
            {/* WhatsApp direct link to teacher if verified */}
            {(() => {
              const teacherPhone =
                liveClassToday.teacherPhone ||
                activeClass?.teacherPhone ||
                (liveClassToday.teacherName === currentUser.name ? currentUser.phone : undefined);
              const isVerified =
                liveClassToday.isTeacherVerified ??
                activeClass?.isTeacherVerified ??
                (liveClassToday.teacherName === currentUser.name && currentUser.isPhoneVerified);

              if (isVerified && teacherPhone) {
                const cleanedPhone = teacherPhone.replace(/[^0-9]/g, '');
                const waPhone = cleanedPhone.startsWith('0')
                  ? '62' + cleanedPhone.slice(1)
                  : cleanedPhone;
                const msg = encodeURIComponent(
                  `Halo ${liveClassToday.teacherName}, saya ${currentUser.name} (${currentUser.role === 'teacher' ? 'Rekan Guru' : 'Siswa'}) dari kelas ${activeClass?.name || 'ClassyWork'}. Saya ingin berkoordinasi mengenai mata pelajaran ${liveClassToday.subjectName} yang sedang berlangsung saat ini.`
                );
                return (
                  <a
                    href={`https://wa.me/${waPhone}?text=${msg}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Tanya Guru via WhatsApp</span>
                    <ExternalLink className="w-3 h-3 opacity-80" />
                  </a>
                );
              }
              return (
                <span className="text-slate-500 text-[11px]">
                  Terhubung ke Waktu Nyata WITA (Asia/Makassar, UTC+8)
                </span>
              );
            })()}

            {selectedDay !== effectiveDay && (
              <button
                onClick={() => setSelectedDay(effectiveDay)}
                className="text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:underline cursor-pointer ml-auto"
              >
                Lihat Jadwal Hari Ini ({witaTimeInfo.dayName}) →
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Status Info when no class is live right now */
        <div className="rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 p-4 space-y-3">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300 text-xs">
              <div className="w-8 h-8 rounded-xl bg-sky-100 dark:bg-sky-950/80 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold block text-slate-900 dark:text-white text-xs">
                  Status KBM Real-time (WITA): Di Luar Jam Pelajaran / Waktu Istirahat
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Saat ini pukul{' '}
                  <b className="font-mono text-slate-800 dark:text-slate-200">
                    {witaTimeInfo.formattedTimeWithSeconds} WITA
                  </b>
                  . Sistem secara otomatis menyalakan status "Sedang Berlangsung" saat jam jadwal KBM tiba.
                </span>
              </div>
            </div>

            {selectedDay !== effectiveDay && (
              <button
                onClick={() => setSelectedDay(effectiveDay)}
                className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
              >
                Ke Hari Ini ({witaTimeInfo.dayName})
              </button>
            )}
          </div>

          {/* Next upcoming class alert */}
          {upcomingClass && (
            <div className="p-3 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 flex items-center justify-between gap-3 text-xs flex-wrap">
              <span className="text-sky-900 dark:text-sky-200">
                🔔 <b>Pelajaran Berikutnya Hari Ini:</b> {upcomingClass.subjectName} pada pukul{' '}
                <span className="font-mono font-bold">{upcomingClass.startTime} WITA</span> di{' '}
                {upcomingClass.roomLocation}.
              </span>
              <span className="font-mono font-bold text-sky-700 dark:text-sky-300 text-xs">
                Mulai dalam {timeToMinutes(upcomingClass.startTime) - effectiveMinutes} menit lagi
              </span>
            </div>
          )}

          {/* Teacher quick helper to test live class with real-time WITA */}
          {currentUser.role === 'teacher' && activeClass && (
            <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between gap-2 flex-wrap text-xs">
              <span className="text-slate-500 text-[11px]">
                Guru dapat memasang jadwal tepat di jam WITA sekarang ({witaTimeInfo.formattedTime}):
              </span>
              <button
                onClick={() => createLiveScheduleNow('Matematika Terapan')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                title="Pasang jadwal otomatis di jam sekarang untuk menguji status Sedang Berlangsung"
              >
                <Zap className="w-3.5 h-3.5 text-amber-300" />
                <span>Buat Jadwal Sedang Berlangsung Sekarang (WITA)</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Top Action & View Mode Switcher */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setViewMode('daily')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              viewMode === 'daily'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Mode Harian</span>
          </button>
          <button
            onClick={() => setViewMode('weekly_grid')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              viewMode === 'weekly_grid'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Grid Mingguan (Overlap)</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCalendarModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold transition-colors"
            title="Impor atau ekspor jadwal dengan Google Calendar / .ics"
          >
            <CalendarDays className="w-3.5 h-3.5 text-indigo-500" />
            <span>Kalender .ics</span>
          </button>

          {currentUser.role === 'teacher' && (
            <button
              id="add-schedule-btn"
              onClick={handleOpenAdd}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Jadwal</span>
            </button>
          )}
        </div>
      </div>

      {/* RENDER VIEW: Weekly Grid vs Daily List */}
      {viewMode === 'weekly_grid' ? (
        <WeeklyGridView onOpenScheduleEdit={handleOpenEdit} />
      ) : (
        <>
          {/* Days of Week Tab Slider */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-2 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between mb-2 px-1">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">
                  Jadwal KBM Harian
                </h3>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                {activeClass.name} • {daySchedules.length} Sesi
              </span>
            </div>

            <div className="grid grid-cols-6 gap-1">
              {days.map((d) => {
                const isSelected = selectedDay === d.id;
                const isToday = simulatedDay === d.id;
                return (
                  <button
                    key={d.id}
                    id={`day-tab-${d.id}`}
                    onClick={() => setSelectedDay(d.id)}
                    className={`py-2 px-1 rounded-xl text-center transition-all relative ${
                      isSelected
                        ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/20 scale-[1.02]'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium'
                    }`}
                  >
                    <span className="block text-[11px] sm:text-xs">{d.short}</span>
                    <span className="block text-[10px] opacity-80 sm:hidden">
                      {d.label.slice(0, 3)}
                    </span>
                    {isToday && (
                      <span
                        className={`absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full ${
                          isSelected ? 'bg-white' : 'bg-emerald-500'
                        }`}
                        title="Hari Ini"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Teacher Action bar */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {days.find((d) => d.id === selectedDay)?.label}
              </span>
              {selectedDay === simulatedDay && (
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <Radio className="w-3 h-3 animate-pulse" /> Hari Ini
                </span>
              )}
            </div>
          </div>

      {/* Schedule Items List */}
      {daySchedules.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-dashed border-slate-300 dark:border-slate-800 text-center space-y-3">
          <BookOpen className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Tidak ada mata pelajaran di hari {days.find((d) => d.id === selectedDay)?.label}.
          </p>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Libur kegiatan belajar mengajar atau belum ada jadwal yang ditambahkan untuk hari ini.
          </p>
          {currentUser.role === 'teacher' && (
            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-medium"
            >
              <Plus className="w-4 h-4" />
              Tambah Mata Pelajaran
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {daySchedules.map((item, idx) => {
            const startMin = timeToMinutes(item.startTime);
            const endMin = timeToMinutes(item.endTime);

            const isToday = selectedDay === effectiveDay;
            const isLive = isToday && effectiveMinutes >= startMin && effectiveMinutes < endMin;
            const isCompleted = isToday && effectiveMinutes >= endMin;
            const isUpcoming = isToday && effectiveMinutes < startMin;
            const cardProgress = isLive
              ? calculateClassProgress(
                  item.startTime,
                  item.endTime,
                  effectiveMinutes,
                  effectiveSeconds
                )
              : null;

            const theme = getColorClasses(item.colorTheme);

            return (
              <div
                key={item.id}
                id={`schedule-item-${item.id}`}
                className={`bg-white dark:bg-slate-900 rounded-2xl p-4 border transition-all duration-150 ${
                  isLive
                    ? 'border-2 border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/20 shadow-md ring-2 ring-emerald-500/20'
                    : 'border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 flex-1">
                      {/* Time slot & status badge */}
                      <div className="flex items-center flex-wrap gap-2">
                        <span className="inline-flex items-center gap-1 font-mono text-xs font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-lg">
                          <Clock className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                          {item.startTime} - {item.endTime} WITA
                        </span>

                        {/* Indikator Status PRD 3.2 */}
                        {isLive && (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 px-2.5 py-0.5 rounded-full ring-1 ring-emerald-500/40 animate-pulse">
                            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
                            Sedang Berlangsung Sekarang (WITA)
                            {cardProgress && (
                              <span className="text-[10px] font-mono font-bold opacity-90">
                                • Sisa {cardProgress.formattedRemaining}
                              </span>
                            )}
                          </span>
                        )}
                        {isCompleted && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3 text-slate-400" />
                            Selesai
                          </span>
                        )}
                        {isUpcoming && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-sky-700 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/50 px-2 py-0.5 rounded-full">
                            Akan Datang ({startMin - effectiveMinutes} mnt lagi)
                          </span>
                        )}
                      </div>

                      {/* Live Mini Progress Bar on Card */}
                      {isLive && cardProgress && (
                        <div className="w-full bg-emerald-200/60 dark:bg-emerald-900/40 rounded-full h-1.5 mt-2 overflow-hidden">
                          <div
                            className="bg-emerald-600 h-full rounded-full transition-all duration-1000"
                            style={{ width: `${cardProgress.percent}%` }}
                          />
                        </div>
                      )}

                      {/* Subject Name */}
                      <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white pt-0.5">
                        {item.subjectName}
                      </h4>

                      {/* Teacher name & WhatsApp Verified Link */}
                      <div className="flex items-center gap-2 flex-wrap pt-0.5">
                        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium">
                          <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                          <span>{item.teacherName}</span>
                        </p>

                        {(() => {
                          const teacherPhone =
                            item.teacherPhone ||
                            activeClass?.teacherPhone ||
                            (item.teacherName === currentUser.name ? currentUser.phone : undefined);
                          const isVerified =
                            item.isTeacherVerified ||
                            activeClass?.isTeacherVerified ||
                            (item.teacherName === currentUser.name
                              ? currentUser.isPhoneVerified
                              : false);

                          if (teacherPhone && isVerified) {
                            const clean = teacherPhone.replace(/[^0-9]/g, '');
                            const formatted = clean.startsWith('0') ? '62' + clean.slice(1) : clean;
                            const text = encodeURIComponent(
                              `Assalamu'alaikum Bapak/Ibu Guru ${item.teacherName}, saya siswa kelas ${
                                activeClass?.name || ''
                              } ingin bertanya mengenai mata pelajaran ${item.subjectName}...`
                            );
                            return (
                              <a
                                href={`https://wa.me/${formatted}?text=${text}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 transition-colors shadow-2xs"
                                title={`Hubungi ${item.teacherName} secara langsung via WhatsApp`}
                              >
                                <MessageCircle className="w-3 h-3 text-emerald-600" />
                                <span>Chat WA Guru</span>
                                <span className="text-[9px] bg-emerald-200/80 dark:bg-emerald-900/80 px-1 rounded-sm">
                                  Resmi ✅
                                </span>
                              </a>
                            );
                          }

                          if (currentUser.role === 'teacher') {
                            return (
                              <button
                                onClick={() => setShowPhoneModal(true)}
                                className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-1"
                              >
                                <ShieldCheck className="w-3 h-3" />
                                <span>Verifikasi No. WA</span>
                              </button>
                            );
                          }

                          return (
                            <span className="text-[10px] text-slate-400 italic">
                              (Kontak Guru Belum Diverifikasi)
                            </span>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Teacher Edit & Delete Controls */}
                    {currentUser.role === 'teacher' && (
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Edit Jadwal"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Hapus jadwal ${item.subjectName}?`)) {
                              deleteScheduleItem(item.id);
                            }
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Hapus Jadwal"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Room Location & Notes - PRD: Informasi Ruang Kelas */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                    <div className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/50">
                      <MapPin className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      <span>
                        {privacySettings.hideSpecificLocations ? 'Ruang Kelas' : item.roomLocation}
                      </span>
                    </div>

                    {item.notes && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 italic max-w-sm truncate">
                        Catatan: {item.notes}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  )}

      {/* Add / Edit Schedule Modal (Guru) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 dark:border-slate-700 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                {editingItem ? 'Edit Jadwal Pelajaran' : 'Tambah Jadwal Pelajaran'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitSchedule} className="mt-4 space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Mata Pelajaran *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Al-Qur'an Hadits, Fiqih, IPA Terpadu"
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-transparent text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Guru Pengampu *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nama lengkap guru & gelar"
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-transparent text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  Waktu KBM (WITA)
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const nowM = witaTimeInfo.totalMinutes;
                    setStartTime(witaTimeInfo.formattedTime);
                    setEndTime(minutesToTimeString(nowM + 90));
                    setSelectedDay(witaTimeInfo.dayOfWeek);
                  }}
                  className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Zap className="w-3 h-3 text-amber-500" />
                  <span>Set ke Jam WITA Sekarang ({witaTimeInfo.formattedTime})</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Jam Mulai *
                  </label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-transparent text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Jam Selesai *
                  </label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-transparent text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Lokasi / Ruang Kelas (PRD Spesifikasi) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Ruang 7-A, Lab IPA Terpadu, Lab Agama, Masjid MTs"
                  value={roomLocation}
                  onChange={(e) => setRoomLocation(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-transparent text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Instruksi / Catatan Siswa (Opsional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Membawa kalkulator saintifik & jas lab..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-transparent text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Tema Warna Label
                </label>
                <div className="flex gap-2">
                  {[
                    { id: 'blue', label: 'Biru' },
                    { id: 'emerald', label: 'Hijau' },
                    { id: 'purple', label: 'Ungu' },
                    { id: 'amber', label: 'Kuning' },
                    { id: 'red', label: 'Merah' },
                  ].map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setColorTheme(c.id)}
                      className={`text-[11px] py-1 px-2.5 rounded-lg border capitalize font-medium ${
                        colorTheme === c.id
                          ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20"
                >
                  {editingItem ? 'Simpan Perubahan' : 'Terbitkan Jadwal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Calendar Import / Export Modal */}
      <CalendarImportExportModal
        isOpen={showCalendarModal}
        onClose={() => setShowCalendarModal(false)}
      />

      {/* Teacher Phone Verification Modal */}
      <TeacherPhoneVerificationModal
        isOpen={showPhoneModal}
        onClose={() => setShowPhoneModal(false)}
      />
    </div>
  );
};
