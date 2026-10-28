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
  Calendar,
  Radio,
  BookOpen,
  CheckCircle2,
  LayoutGrid,
  CalendarDays,
  MessageCircle,
  ShieldCheck,
  ExternalLink,
  RotateCcw,
  Zap,
  Sun,
} from 'lucide-react';

interface ScheduleViewProps {
  onOpenClassModal?: () => void;
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({ onOpenClassModal }) => {
  const {
    activeClass,
    classes,
    isAllClassesView,
    schedules,
    currentUser,
    simulatedDay,
    simulatedTime,
    addScheduleItem,
    updateScheduleItem,
    deleteScheduleItem,
    privacySettings,
    witaTimeInfo,
    isRealTimeWita,
    syncToCurrentWitaTime,
    createLiveScheduleNow,
    setActiveTab,
  } = useApp();

  const [viewMode, setViewMode] = useState<'daily' | 'weekly_grid'>('daily');
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number>(
    (isRealTimeWita ? witaTimeInfo.dayOfWeek : simulatedDay) === 7
      ? 1
      : isRealTimeWita
      ? witaTimeInfo.dayOfWeek
      : simulatedDay
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
  const [colorTheme, setColorTheme] = useState('amber');
  const [notes, setNotes] = useState('');
  const [targetScheduleClassId, setTargetScheduleClassId] = useState<string>('');

  const days = [
    { id: 1, label: 'Senin', short: 'Sen' },
    { id: 2, label: 'Selasa', short: 'Sel' },
    { id: 3, label: 'Rabu', short: 'Rab' },
    { id: 4, label: 'Kamis', short: 'Kam' },
    { id: 5, label: 'Jumat', short: 'Jum' },
    { id: 6, label: 'Sabtu', short: 'Sab' },
  ];

  const effectiveDay = isRealTimeWita ? witaTimeInfo.dayOfWeek : simulatedDay;
  const isSundayToday = effectiveDay === 7;
  const effectiveMinutes = isRealTimeWita
    ? witaTimeInfo.totalMinutes
    : timeToMinutes(simulatedTime);
  const effectiveSeconds = isRealTimeWita ? witaTimeInfo.seconds : 0;

  const classMap = useMemo(() => new Map(classes.map((c) => [c.id, c])), [classes]);
  const enrolledClassIds = useMemo(() => new Set(classes.map((c) => c.id)), [classes]);
  const isCombinedMultiClass = isAllClassesView && classes.length >= 2;

  // Filter schedules for the current active class (or all enrolled classes) and selected day
  const daySchedules = useMemo(() => {
    if (!activeClass) return [];
    return schedules
      .filter((s) => {
        const classMatch = isCombinedMultiClass
          ? enrolledClassIds.has(s.classId)
          : s.classId === activeClass.id;
        return classMatch && s.dayOfWeek === selectedDay;
      })
      .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
  }, [schedules, activeClass, isCombinedMultiClass, enrolledClassIds, selectedDay]);

  // Automatically select today's day when real-time WITA is active (default Monday if Sunday)
  React.useEffect(() => {
    if (isRealTimeWita) {
      setSelectedDay(witaTimeInfo.dayOfWeek === 7 ? 1 : witaTimeInfo.dayOfWeek);
    }
  }, [isRealTimeWita, witaTimeInfo.dayOfWeek]);

  // Determine if there is ANY live class right now in WITA for this class (or combined classes)
  const liveClassToday = useMemo(() => {
    if (!activeClass) return null;
    return (
      schedules
        .filter((s) => {
          const classMatch = isCombinedMultiClass
            ? enrolledClassIds.has(s.classId)
            : s.classId === activeClass.id;
          return classMatch && s.dayOfWeek === effectiveDay;
        })
        .find((s) => {
          const startMin = timeToMinutes(s.startTime);
          const endMin = timeToMinutes(s.endTime);
          return effectiveMinutes >= startMin && effectiveMinutes < endMin;
        }) || null
    );
  }, [schedules, activeClass, isCombinedMultiClass, enrolledClassIds, effectiveDay, effectiveMinutes]);

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

  // Daily schedule completion percentage for the circular ring when no live class is running
  const dailyCompletionPercent = useMemo(() => {
    if (!activeClass) return 0;
    const todayItems = schedules.filter((s) => {
      const classMatch = isCombinedMultiClass
        ? enrolledClassIds.has(s.classId)
        : s.classId === activeClass.id;
      return classMatch && s.dayOfWeek === (effectiveDay === 7 ? 1 : effectiveDay);
    });
    if (todayItems.length === 0) return 0;
    if (effectiveDay === 7) return 100;
    const doneCount = todayItems.filter((s) => effectiveMinutes >= timeToMinutes(s.endTime)).length;
    return Math.round((doneCount / todayItems.length) * 100);
  }, [schedules, activeClass, isCombinedMultiClass, enrolledClassIds, effectiveDay, effectiveMinutes]);

  // Next upcoming class on today's effective day
  const upcomingClass = useMemo(() => {
    if (!activeClass) return null;
    return (
      schedules
        .filter((s) => {
          const classMatch = isCombinedMultiClass
            ? enrolledClassIds.has(s.classId)
            : s.classId === activeClass.id;
          return classMatch && s.dayOfWeek === effectiveDay;
        })
        .filter((s) => timeToMinutes(s.startTime) > effectiveMinutes)
        .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime))[0] || null
    );
  }, [schedules, activeClass, isCombinedMultiClass, enrolledClassIds, effectiveDay, effectiveMinutes]);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setSubjectName('');
    setTeacherName(currentUser.role === 'teacher' ? currentUser.name : '');
    setStartTime('07:30');
    setEndTime('09:00');
    setRoomLocation('Ruang 7-A (Lantai 1)');
    setColorTheme('amber');
    setNotes('');
    setTargetScheduleClassId(activeClass?.id || (classes[0]?.id ?? ''));
    setShowAddModal(true);
  };

  const handleOpenEdit = (item: ScheduleItem) => {
    setEditingItem(item);
    setSubjectName(item.subjectName);
    setTeacherName(item.teacherName);
    setStartTime(item.startTime);
    setEndTime(item.endTime);
    setRoomLocation(item.roomLocation);
    setColorTheme(item.colorTheme || 'amber');
    setNotes(item.notes || '');
    setTargetScheduleClassId(item.classId);
    setSelectedDay(item.dayOfWeek === 7 ? 1 : item.dayOfWeek);
    setShowAddModal(true);
  };

  const handleSubmitSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeClass || !subjectName.trim() || !roomLocation.trim()) return;

    const chosenClassId = targetScheduleClassId || activeClass.id;
    const safeDay = Math.min(6, Math.max(1, selectedDay === 7 ? 1 : selectedDay));
    if (editingItem) {
      updateScheduleItem(editingItem.id, {
        classId: chosenClassId,
        dayOfWeek: safeDay,
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
        classId: chosenClassId,
        dayOfWeek: safeDay,
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

  // Circular SVG progress ring helper matching the 80% ring in the reference design
  const renderCircularRing = (percent: number, sublabel?: string) => {
    const radius = 30;
    const circumference = 2 * Math.PI * radius;
    const clamped = Math.min(100, Math.max(0, percent));
    const offset = circumference - (clamped / 100) * circumference;

    return (
      <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
        <svg className="w-20 h-20 -rotate-90" viewBox="0 0 76 76">
          <circle
            cx="38"
            cy="38"
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.16)"
            strokeWidth="7"
          />
          <circle
            cx="38"
            cy="38"
            r={radius}
            fill="none"
            stroke="#F4A950"
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-sm font-extrabold text-white tabular-nums leading-none">
            {clamped}%
          </span>
          {sublabel && (
            <span className="text-[8px] font-semibold text-[#FCEADE]/80 mt-0.5">{sublabel}</span>
          )}
        </div>
      </div>
    );
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
      <div className="bg-white dark:bg-[#13313C] rounded-[24px] p-4 border border-[#ECECE6] dark:border-[#214B59] shadow-[0_8px_26px_rgba(22,62,75,0.05)] flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#FCEADE] dark:bg-[#1D4654] text-[#163E4B] dark:text-[#F4A950] flex items-center justify-center font-bold shrink-0">
            <Clock className="w-5 h-5 text-[#E59638]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs sm:text-sm font-extrabold text-[#163E4B] dark:text-white">
                Waktu Indonesia <span className="text-[#E69D45]">Tengah (WITA)</span>
              </span>
              <span className="text-[11px] font-semibold text-[#6E828A] dark:text-[#98B4BE]">
                · {isRealTimeWita ? 'Sinkron Otomatis' : 'Simulasi Manual'}
              </span>
            </div>
            <p className="text-xs text-[#6E828A] dark:text-[#9CB7C0] mt-0.5 font-medium flex items-center gap-1.5 flex-wrap">
              <span>{witaTimeInfo.formattedDate}</span>
              <span>·</span>
              <span className="font-mono tabular-nums font-bold text-[#163E4B] dark:text-[#F4A950] text-sm">
                {witaTimeInfo.formattedTimeWithSeconds} WITA
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isRealTimeWita ? (
            <button
              onClick={syncToCurrentWitaTime}
              className="px-3.5 py-1.5 rounded-full bg-[#F4A950] hover:bg-[#E59638] text-white text-xs font-bold flex items-center gap-1.5 shadow-[0_4px_12px_rgba(244,169,80,0.3)] transition-colors cursor-pointer whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Kembalikan ke WITA Nyata</span>
            </button>
          ) : (
            <span className="text-[11px] text-[#163E4B] dark:text-[#FCEADE] font-bold flex items-center gap-1.5 bg-[#FCEADE] dark:bg-[#1D4654] px-3 py-1 rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#E59638]" />
              <span>Jam Nyata Aktif</span>
            </span>
          )}
        </div>
      </div>

      {/* Sunday Holiday Notice */}
      {isSundayToday && (
        <div className="rounded-[24px] bg-[#FCEADE] dark:bg-[#1C3B47] border border-[#F2CFAF] dark:border-[#F4A950]/40 p-4 text-[#163E4B] dark:text-[#FCEADE] shadow-xs flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white dark:bg-[#13313C] text-[#E59638] flex items-center justify-center font-bold shrink-0 shadow-2xs">
              <Sun className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-extrabold text-[#163E4B] dark:text-white">
                  Hari Minggu — Libur KBM Madrasah
                </span>
                <span className="text-[11px] text-[#6E828A] dark:text-[#FCEADE]/80 font-medium">
                  · KBM Aktif Senin - Sabtu
                </span>
              </div>
              <p className="text-xs text-[#546D76] dark:text-[#D5E6EC] mt-0.5">
                Kegiatan Belajar Mengajar tidak dijadwalkan pada hari Minggu. Jadwal hari Senin dimuat otomatis untuk persiapan esok hari.
              </p>
            </div>
          </div>
          <button
            onClick={() => setSelectedDay(1)}
            className="px-4 py-1.5 rounded-full bg-[#163E4B] hover:bg-[#10303B] text-white text-xs font-bold transition-colors cursor-pointer shadow-xs ml-auto whitespace-nowrap"
          >
            Buka Jadwal Senin →
          </button>
        </div>
      )}

      {/* Hero Card styled after the Deep Petrol #163E4B + #F4A950 Circular Ring card in reference image */}
      {liveClassToday ? (
        <div className="rounded-[28px] bg-[#163E4B] p-5 sm:p-6 text-white shadow-[0_16px_38px_rgba(22,62,75,0.24)] relative overflow-hidden">
          {/* Subtle Concentric Rings matching reference dark petrol card */}
          <div className="w-40 h-40 rounded-full border-[8px] border-white/[0.04] absolute -right-10 -bottom-12 pointer-events-none" />
          <div className="w-24 h-24 rounded-full border-[5px] border-white/[0.04] absolute -right-2 -bottom-4 pointer-events-none" />

          <div className="flex items-center justify-between gap-4 relative z-10">
            <div className="space-y-2 flex-1 min-w-0">
              <div className="inline-flex items-center gap-2 text-[11px] font-bold text-[#F4A950]">
                <Radio className="w-3.5 h-3.5 text-[#F4A950]" />
                <span>Sedang Berlangsung Sekarang (WITA)</span>
              </div>

              <h2 className="text-lg sm:text-2xl font-extrabold tracking-tight text-white truncate">
                {liveClassToday.subjectName}
              </h2>

              <p className="text-xs text-white/80 flex items-center gap-2 flex-wrap">
                <span>{liveClassToday.teacherName}</span>
                <span>·</span>
                <span className="font-mono tabular-nums text-[#FCEADE]">
                  {liveClassToday.startTime} - {liveClassToday.endTime}
                </span>
                <span>·</span>
                <span>
                  {privacySettings.hideSpecificLocations ? 'Ruang Kelas' : liveClassToday.roomLocation}
                </span>
              </p>

              <div className="pt-2 flex items-center gap-2.5 flex-wrap">
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
                      `Halo ${liveClassToday.teacherName}, saya ${currentUser.name} (${
                        currentUser.role === 'teacher' ? 'Rekan Guru' : 'Siswa'
                      }) dari kelas ${activeClass?.name || 'ClassyWork'}. Saya ingin berkoordinasi mengenai mata pelajaran ${liveClassToday.subjectName} yang sedang berlangsung saat ini.`
                    );
                    return (
                      <a
                        href={`https://wa.me/${waPhone}?text=${msg}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#F4A950] hover:bg-[#E59638] text-white font-bold text-xs shadow-[0_6px_16px_rgba(244,169,80,0.35)] transition-colors cursor-pointer whitespace-nowrap"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Tanya Guru via WA</span>
                        <ExternalLink className="w-3 h-3 opacity-85" />
                      </a>
                    );
                  }
                  return (
                    <button
                      onClick={() => setActiveTab('tugas')}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#F4A950] hover:bg-[#E59638] text-white font-bold text-xs shadow-[0_6px_16px_rgba(244,169,80,0.35)] transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <span>Lihat Tugas Kelas</span>
                    </button>
                  );
                })()}

                {selectedDay !== effectiveDay && !isSundayToday && (
                  <button
                    onClick={() => setSelectedDay(effectiveDay)}
                    className="text-xs font-bold text-[#FCEADE] hover:underline cursor-pointer whitespace-nowrap"
                  >
                    Lihat Hari Ini ({witaTimeInfo.dayName}) →
                  </button>
                )}
              </div>
            </div>

            {/* Circular Progress Ring matching 80% ring in reference mockup */}
            {renderCircularRing(liveClassProgress?.percent || 0, 'Berjalan')}
          </div>
        </div>
      ) : (
        /* Status Info when no class is live right now — styled in matching Deep Petrol #163E4B Hero Card */
        <div className="rounded-[28px] bg-[#163E4B] p-5 sm:p-6 text-white shadow-[0_16px_38px_rgba(22,62,75,0.2)] relative overflow-hidden space-y-3.5">
          <div className="w-40 h-40 rounded-full border-[8px] border-white/[0.04] absolute -right-10 -bottom-12 pointer-events-none" />
          <div className="w-24 h-24 rounded-full border-[5px] border-white/[0.04] absolute -right-2 -bottom-4 pointer-events-none" />

          <div className="flex items-center justify-between gap-4 relative z-10">
            <div className="space-y-2 flex-1 min-w-0">
              <p className="text-sm sm:text-base font-bold text-white leading-snug">
                {upcomingClass
                  ? `Pelajaran berikutnya: ${upcomingClass.subjectName}`
                  : 'Rencana belajar hari ini berjalan lancar'}
              </p>
              <p className="text-xs text-white/75 leading-relaxed">
                Saat ini pukul{' '}
                <span className="font-mono tabular-nums font-bold text-[#FCEADE]">
                  {witaTimeInfo.formattedTimeWithSeconds} WITA
                </span>{' '}
                (di luar sesi aktif).
                {upcomingClass && (
                  <>
                    {' '}
                    Dimulai pukul{' '}
                    <span className="font-mono tabular-nums font-bold text-[#F4A950]">
                      {upcomingClass.startTime} WITA
                    </span>{' '}
                    di {upcomingClass.roomLocation}.
                  </>
                )}
              </p>

              <div className="pt-1 flex items-center gap-2.5 flex-wrap">
                <button
                  onClick={() => setActiveTab('tugas')}
                  className="px-4 py-2 rounded-full bg-[#F4A950] hover:bg-[#E59638] text-white text-xs font-bold shadow-[0_6px_18px_rgba(244,169,80,0.35)] transition-all cursor-pointer whitespace-nowrap"
                >
                  Lihat Tugas
                </button>

                {currentUser.role === 'teacher' && activeClass && (
                  <button
                    onClick={() => createLiveScheduleNow('Matematika Terapan')}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/12 hover:bg-white/20 text-[#FCEADE] font-bold text-xs transition-colors cursor-pointer whitespace-nowrap"
                    title="Pasang jadwal otomatis di jam sekarang untuk menguji status Sedang Berlangsung"
                  >
                    <Zap className="w-3.5 h-3.5 text-[#F4A950]" />
                    <span>Uji Kelas Live Sekarang</span>
                  </button>
                )}

                {selectedDay !== effectiveDay && !isSundayToday && (
                  <button
                    onClick={() => setSelectedDay(effectiveDay)}
                    className="text-xs font-bold text-[#FCEADE] hover:underline cursor-pointer whitespace-nowrap"
                  >
                    Ke Hari Ini ({witaTimeInfo.dayName})
                  </button>
                )}
              </div>
            </div>

            {renderCircularRing(dailyCompletionPercent, 'Tuntas')}
          </div>
        </div>
      )}

      {/* Top Action & View Mode Switcher */}
      <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
        <div className="flex items-center gap-1 bg-white dark:bg-[#13313C] p-1 rounded-full border border-[#ECECE6] dark:border-[#214B59] shadow-2xs">
          <button
            onClick={() => setViewMode('daily')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              viewMode === 'daily'
                ? 'bg-[#163E4B] text-white shadow-xs'
                : 'text-[#6E828A] dark:text-[#9CB7C0] hover:text-[#163E4B] dark:hover:text-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Mode Harian</span>
          </button>
          <button
            onClick={() => setViewMode('weekly_grid')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              viewMode === 'weekly_grid'
                ? 'bg-[#163E4B] text-white shadow-xs'
                : 'text-[#6E828A] dark:text-[#9CB7C0] hover:text-[#163E4B] dark:hover:text-white'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Grid Mingguan</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCalendarModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#FCEADE] hover:bg-[#F9DEC8] dark:bg-[#1A3F4D] dark:hover:bg-[#214D5D] text-[#163E4B] dark:text-[#FCEADE] rounded-full text-xs font-bold transition-colors cursor-pointer whitespace-nowrap"
            title="Impor atau ekspor jadwal dengan Google Calendar / .ics"
          >
            <CalendarDays className="w-3.5 h-3.5 text-[#E59638]" />
            <span>Kalender .ics</span>
          </button>

          {currentUser.role === 'teacher' && (
            <button
              id="add-schedule-btn"
              onClick={handleOpenAdd}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#F4A950] hover:bg-[#E59638] text-white rounded-full text-xs font-bold shadow-[0_6px_16px_rgba(244,169,80,0.35)] transition-colors cursor-pointer whitespace-nowrap"
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
          {/* Days of Week Calendar Card styled after the Deep Petrol #163E4B Calendar Block on right phone */}
          <div className="bg-[#163E4B] rounded-[28px] p-4 sm:p-5 text-white shadow-[0_14px_34px_rgba(22,62,75,0.18)] relative overflow-hidden">
            <div className="w-32 h-32 rounded-full border-[6px] border-white/[0.05] absolute -right-8 -top-8 pointer-events-none" />

            <div className="flex items-center justify-between mb-3.5 px-1 relative z-10">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#F4A950]" />
                <h3 className="font-extrabold text-sm sm:text-base text-white tracking-tight">
                  Jadwal KBM Harian
                </h3>
              </div>
              <span className="text-xs text-[#FCEADE]/90 font-semibold tabular-nums">
                {isCombinedMultiClass ? `Semua (${classes.length} Kelas)` : activeClass.name} ·{' '}
                {daySchedules.length} Sesi
              </span>
            </div>

            <div className="grid grid-cols-6 gap-1.5 relative z-10">
              {days.map((d) => {
                const isSelected = selectedDay === d.id;
                const isToday = effectiveDay === d.id;
                return (
                  <button
                    key={d.id}
                    id={`day-tab-${d.id}`}
                    onClick={() => setSelectedDay(d.id)}
                    className={`py-2.5 px-1 rounded-2xl text-center transition-all relative cursor-pointer ${
                      isSelected
                        ? 'bg-[#F4A950] text-white font-extrabold shadow-[0_6px_16px_rgba(244,169,80,0.4)]'
                        : 'hover:bg-white/10 text-white/75 hover:text-white font-semibold'
                    }`}
                  >
                    <span className="block text-[11px] sm:text-xs">{d.short}</span>
                    <span className="block text-[10px] opacity-85 mt-0.5 hidden sm:block">
                      {d.label}
                    </span>
                    {isToday && (
                      <span
                        className={`block mx-auto mt-1 w-1.5 h-1.5 rounded-full ${
                          isSelected ? 'bg-white' : 'bg-[#F4A950]'
                        }`}
                        title="Hari Ini"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section Heading matching "Today's Schedule" / "Friday, 24th" in reference image */}
          <div className="flex items-center justify-between gap-2 pt-1 px-1">
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-extrabold text-[#163E4B] dark:text-white tracking-tight">
                Jadwal Hari {days.find((d) => d.id === selectedDay)?.label}
              </h3>
              {selectedDay === effectiveDay && (
                <span className="text-xs font-bold text-[#E69D45]">· Hari Ini</span>
              )}
            </div>
          </div>

          {/* Schedule Items List */}
          {daySchedules.length === 0 ? (
            <div className="bg-white dark:bg-[#13313C] rounded-[26px] p-8 border border-dashed border-[#D8E0E3] dark:border-[#245363] text-center space-y-3 shadow-[0_8px_24px_rgba(22,62,75,0.04)]">
              <BookOpen className="w-10 h-10 mx-auto text-[#B5C4C9] dark:text-[#577C89]" />
              <p className="text-sm font-bold text-[#163E4B] dark:text-white">
                Tidak ada mata pelajaran di hari {days.find((d) => d.id === selectedDay)?.label}.
              </p>
              <p className="text-xs text-[#7B8D93] dark:text-[#98B4BE] max-w-xs mx-auto">
                Libur kegiatan belajar mengajar atau belum ada jadwal yang ditambahkan untuk hari ini.
              </p>
              {currentUser.role === 'teacher' && (
                <button
                  onClick={handleOpenAdd}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#F4A950] hover:bg-[#E59638] text-white rounded-full text-xs font-bold shadow-[0_6px_16px_rgba(244,169,80,0.35)] cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Tambah Mata Pelajaran
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3.5">
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

                // Alternate / map card surfaces to Soft Warm Peach (#FCEADE) & Crisp White (#FFFFFF) like reference image
                const isPeachCard =
                  !isLive &&
                  (item.colorTheme === 'amber' ||
                    item.colorTheme === 'orange' ||
                    item.colorTheme === 'red' ||
                    idx % 2 === 1);

                return (
                  <React.Fragment key={item.id}>
                    {/* Warm Amber timeline divider line o---------------- before live or next upcoming session */}
                    {isLive && (
                      <div className="flex items-center gap-2 py-0.5 px-1">
                        <span className="w-2.5 h-2.5 rounded-full border-2 border-[#F4A950] bg-[#F7F7F5] dark:bg-[#0B1E25] shrink-0" />
                        <div className="h-[1.5px] flex-1 bg-[#F4A950]/70 rounded-full" />
                        <span className="text-[10px] font-mono tabular-nums font-bold text-[#E59638]">
                          {witaTimeInfo.formattedTime} WITA
                        </span>
                      </div>
                    )}

                    <div
                      id={`schedule-item-${item.id}`}
                      className={`rounded-[26px] p-4 sm:p-5 border transition-all duration-150 relative overflow-hidden ${
                        isLive
                          ? 'bg-[#163E4B] border-[#163E4B] text-white shadow-[0_14px_34px_rgba(22,62,75,0.22)]'
                          : isPeachCard
                          ? 'bg-[#FCEADE] dark:bg-[#193D4A] border-[#F4D3BA] dark:border-[#2A596A] text-[#163E4B] dark:text-white shadow-[0_8px_24px_rgba(22,62,75,0.04)]'
                          : 'bg-white dark:bg-[#13313C] border-[#ECECE6] dark:border-[#214B59] text-[#163E4B] dark:text-white shadow-[0_8px_26px_rgba(22,62,75,0.05)]'
                      }`}
                    >
                      {/* Subtle Concentric Ring Motif on Peach & Live Cards matching reference screenshot */}
                      {(isPeachCard || isLive) && (
                        <div
                          className={`w-28 h-28 rounded-full border-[6px] absolute -right-8 -bottom-8 pointer-events-none ${
                            isLive
                              ? 'border-white/[0.05]'
                              : 'border-[#F2C9A8]/45 dark:border-white/[0.04]'
                          }`}
                        />
                      )}

                      <div className="relative z-10">
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1 flex-1 min-w-0">
                            {/* Time slot & clean status text */}
                            <div className="flex items-center flex-wrap gap-2 text-xs">
                              <span
                                className={`inline-flex items-center gap-1.5 font-mono tabular-nums font-bold ${
                                  isLive
                                    ? 'text-[#F4A950]'
                                    : 'text-[#6E828A] dark:text-[#A5C0C9]'
                                }`}
                              >
                                <Clock className="w-3.5 h-3.5 text-[#F4A950]" />
                                {item.startTime} - {item.endTime} WITA
                              </span>

                              {classes.length >= 2 && classMap.get(item.classId) && (
                                <span
                                  className={`text-[11px] font-extrabold ${
                                    isLive ? 'text-[#FCEADE]' : 'text-[#163E4B] dark:text-[#F4A950]'
                                  }`}
                                >
                                  · {classMap.get(item.classId)?.name}
                                </span>
                              )}

                              {isLive && (
                                <span className="text-[11px] font-bold text-[#FCEADE]">
                                  · Sedang Berlangsung
                                  {cardProgress && ` (Sisa ${cardProgress.formattedRemaining})`}
                                </span>
                              )}
                              {isCompleted && (
                                <span className="text-[11px] font-semibold text-[#7B8D93] dark:text-[#8BA6B0]">
                                  · Selesai
                                </span>
                              )}
                              {isUpcoming && (
                                <span className="text-[11px] font-bold text-[#E59638]">
                                  · Mulai {startMin - effectiveMinutes} mnt lagi
                                </span>
                              )}
                            </div>

                            {/* Live Mini Progress Bar on Card */}
                            {isLive && cardProgress && (
                              <div className="w-full bg-white/15 rounded-full h-1.5 mt-2 overflow-hidden">
                                <div
                                  className="bg-[#F4A950] h-full rounded-full transition-all duration-1000"
                                  style={{ width: `${cardProgress.percent}%` }}
                                />
                              </div>
                            )}

                            {/* Subject Name */}
                            <h4
                              className={`text-base sm:text-lg font-extrabold pt-0.5 tracking-tight ${
                                isLive ? 'text-white' : 'text-[#163E4B] dark:text-white'
                              }`}
                            >
                              {item.subjectName}
                            </h4>

                            {/* Teacher name & WhatsApp Verified Link */}
                            <div className="flex items-center gap-2.5 flex-wrap pt-0.5">
                              <p
                                className={`text-xs flex items-center gap-1.5 font-semibold ${
                                  isLive
                                    ? 'text-white/85'
                                    : 'text-[#5A717A] dark:text-[#B8CFD7]'
                                }`}
                              >
                                <UserCheck className="w-3.5 h-3.5 text-[#F4A950]" />
                                <span>{item.teacherName}</span>
                              </p>

                              {(() => {
                                const teacherPhone =
                                  item.teacherPhone ||
                                  activeClass?.teacherPhone ||
                                  (item.teacherName === currentUser.name
                                    ? currentUser.phone
                                    : undefined);
                                const isVerified =
                                  item.isTeacherVerified ||
                                  activeClass?.isTeacherVerified ||
                                  (item.teacherName === currentUser.name
                                    ? currentUser.isPhoneVerified
                                    : false);

                                if (teacherPhone && isVerified) {
                                  const clean = teacherPhone.replace(/[^0-9]/g, '');
                                  const formatted = clean.startsWith('0')
                                    ? '62' + clean.slice(1)
                                    : clean;
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
                                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-colors whitespace-nowrap ${
                                        isLive
                                          ? 'bg-[#F4A950] text-white hover:bg-[#E59638]'
                                          : 'bg-[#163E4B] text-white hover:bg-[#10303B]'
                                      }`}
                                      title={`Hubungi ${item.teacherName} secara langsung via WhatsApp`}
                                    >
                                      <MessageCircle className="w-3 h-3 text-[#F4A950]" />
                                      <span>Chat WA Guru</span>
                                    </a>
                                  );
                                }

                                if (currentUser.role === 'teacher') {
                                  return (
                                    <button
                                      onClick={() => setShowPhoneModal(true)}
                                      className={`text-[11px] font-bold hover:underline flex items-center gap-1 cursor-pointer ${
                                        isLive ? 'text-[#F4A950]' : 'text-[#E59638]'
                                      }`}
                                    >
                                      <ShieldCheck className="w-3 h-3" />
                                      <span>Verifikasi No. WA</span>
                                    </button>
                                  );
                                }

                                return (
                                  <span
                                    className={`text-[11px] ${
                                      isLive ? 'text-white/60' : 'text-[#899CA4]'
                                    }`}
                                  >
                                    · Kontak belum diverifikasi
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
                                className={`p-2 rounded-xl transition-colors cursor-pointer ${
                                  isLive
                                    ? 'text-white/75 hover:text-white hover:bg-white/10'
                                    : 'text-[#6E828A] hover:text-[#163E4B] hover:bg-white/70 dark:hover:bg-[#112B35]'
                                }`}
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
                                className={`p-2 rounded-xl transition-colors cursor-pointer ${
                                  isLive
                                    ? 'text-white/75 hover:text-rose-300 hover:bg-white/10'
                                    : 'text-[#6E828A] hover:text-rose-600 hover:bg-white/70 dark:hover:bg-[#112B35]'
                                }`}
                                title="Hapus Jadwal"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Room Location & Notes */}
                        <div
                          className={`mt-3 pt-2.5 border-t flex flex-wrap items-center justify-between gap-2 ${
                            isLive
                              ? 'border-white/15'
                              : isPeachCard
                              ? 'border-[#F0CCA9]/60 dark:border-white/10'
                              : 'border-[#F0F0EC] dark:border-[#214B59]'
                          }`}
                        >
                          <div
                            className={`inline-flex items-center gap-1.5 text-xs font-bold ${
                              isLive ? 'text-[#FCEADE]' : 'text-[#163E4B] dark:text-[#FCEADE]'
                            }`}
                          >
                            <MapPin className="w-3.5 h-3.5 text-[#F4A950]" />
                            <span>
                              {privacySettings.hideSpecificLocations
                                ? 'Ruang Kelas'
                                : item.roomLocation}
                            </span>
                          </div>

                          {item.notes && (
                            <p
                              className={`text-[11px] max-w-sm truncate ${
                                isLive
                                  ? 'text-white/75'
                                  : 'text-[#6E828A] dark:text-[#9CB7C0]'
                              }`}
                            >
                              Catatan: {item.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Teacher Add / Edit Schedule Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0D242C]/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#13313C] rounded-[28px] max-w-md w-full p-5 shadow-2xl border border-[#ECECE6] dark:border-[#245363] max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0F0EC] dark:border-[#214B59]">
              <h3 className="font-extrabold text-[#163E4B] dark:text-white text-base">
                {editingItem ? 'Edit Jadwal Mata Pelajaran' : 'Tambah Jadwal Pelajaran'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-[#7B8D93] hover:text-[#163E4B] dark:hover:text-white text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitSchedule} className="mt-4 space-y-3.5">
              {classes.length >= 2 && (
                <div>
                  <label className="text-xs font-bold text-[#163E4B] dark:text-[#E5F0F3] block mb-1">
                    Pilih Kelas Tujuan *
                  </label>
                  <select
                    value={targetScheduleClassId || activeClass.id}
                    onChange={(e) => setTargetScheduleClassId(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs font-bold rounded-2xl border border-[#DCE3E6] dark:border-[#275668] bg-[#F7F7F5] dark:bg-[#0E262F] text-[#163E4B] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#F4A950]"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.gradeLevel})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-[#163E4B] dark:text-[#E5F0F3] block mb-1">
                  Mata Pelajaran *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Al-Qur'an Hadits, Fiqih, IPA Terpadu"
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-2xl border border-[#DCE3E6] dark:border-[#275668] bg-[#F7F7F5] dark:bg-[#0E262F] text-[#163E4B] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#F4A950]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#163E4B] dark:text-[#E5F0F3] block mb-1">
                  Guru Pengampu *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nama lengkap guru & gelar"
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-2xl border border-[#DCE3E6] dark:border-[#275668] bg-[#F7F7F5] dark:bg-[#0E262F] text-[#163E4B] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#F4A950]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#163E4B] dark:text-[#E5F0F3] block mb-1">
                  Hari KBM (Senin - Sabtu) *
                </label>
                <div className="grid grid-cols-6 gap-1">
                  {days.map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setSelectedDay(d.id)}
                      className={`py-2 px-1 text-center text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                        selectedDay === d.id
                          ? 'bg-[#163E4B] border-[#163E4B] text-white shadow-xs'
                          : 'border-[#DCE3E6] dark:border-[#275668] text-[#163E4B] dark:text-[#D5E6EC] hover:bg-[#FCEADE]/50'
                      }`}
                    >
                      {d.short}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#6E828A] dark:text-[#98B4BE]">
                  Waktu KBM (WITA)
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const nowM = witaTimeInfo.totalMinutes;
                    setStartTime(witaTimeInfo.formattedTime);
                    setEndTime(minutesToTimeString(nowM + 90));
                    setSelectedDay(witaTimeInfo.dayOfWeek === 7 ? 1 : witaTimeInfo.dayOfWeek);
                  }}
                  className="text-[11px] font-bold text-[#E59638] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Zap className="w-3 h-3 text-[#F4A950]" />
                  <span>Set ke Jam WITA Sekarang ({witaTimeInfo.formattedTime})</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-[#163E4B] dark:text-[#E5F0F3] block mb-1">
                    Jam Mulai *
                  </label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-2xl border border-[#DCE3E6] dark:border-[#275668] bg-[#F7F7F5] dark:bg-[#0E262F] text-[#163E4B] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#F4A950] font-mono tabular-nums"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#163E4B] dark:text-[#E5F0F3] block mb-1">
                    Jam Selesai *
                  </label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-2xl border border-[#DCE3E6] dark:border-[#275668] bg-[#F7F7F5] dark:bg-[#0E262F] text-[#163E4B] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#F4A950] font-mono tabular-nums"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#163E4B] dark:text-[#E5F0F3] block mb-1">
                  Lokasi / Ruang Kelas *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Ruang 7-A, Lab IPA Terpadu, Masjid MTs"
                  value={roomLocation}
                  onChange={(e) => setRoomLocation(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-2xl border border-[#DCE3E6] dark:border-[#275668] bg-[#F7F7F5] dark:bg-[#0E262F] text-[#163E4B] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#F4A950]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#163E4B] dark:text-[#E5F0F3] block mb-1">
                  Instruksi / Catatan Siswa (Opsional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Membawa buku paket & alat tulis..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-2xl border border-[#DCE3E6] dark:border-[#275668] bg-[#F7F7F5] dark:bg-[#0E262F] text-[#163E4B] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#F4A950] resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#163E4B] dark:text-[#E5F0F3] block mb-1">
                  Gaya Kartu Jadwal
                </label>
                <div className="flex gap-2 flex-wrap">
                  {[
                    { id: 'amber', label: 'Peach Hangat' },
                    { id: 'blue', label: 'Putih Bersih' },
                    { id: 'emerald', label: 'Hijau' },
                    { id: 'purple', label: 'Ungu' },
                    { id: 'red', label: 'Merah' },
                  ].map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setColorTheme(c.id)}
                      className={`text-[11px] py-1.5 px-3 rounded-full border font-bold cursor-pointer transition-colors ${
                        colorTheme === c.id
                          ? 'border-[#163E4B] bg-[#163E4B] text-white'
                          : 'border-[#DCE3E6] dark:border-[#275668] text-[#6E828A] dark:text-[#B2CBD4]'
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-[#F0F0EC] dark:border-[#214B59] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-bold rounded-full text-[#6E828A] hover:bg-[#F7F7F5] dark:hover:bg-[#1B4250] cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-full bg-[#F4A950] hover:bg-[#E59638] text-white shadow-[0_6px_18px_rgba(244,169,80,0.35)] cursor-pointer"
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
