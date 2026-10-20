import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { ScheduleItem } from '../types';
import {
  Clock,
  MapPin,
  UserCheck,
  AlertTriangle,
  Calendar,
  Radio,
  Sparkles,
} from 'lucide-react';

interface WeeklyGridViewProps {
  onOpenScheduleEdit?: (item: ScheduleItem) => void;
}

export const WeeklyGridView: React.FC<WeeklyGridViewProps> = ({
  onOpenScheduleEdit,
}) => {
  const {
    activeClass,
    schedules,
    simulatedDay,
    simulatedTime,
    privacySettings,
    currentUser,
    witaTimeInfo,
    isRealTimeWita,
  } = useApp();

  const days = [
    { id: 1, label: 'Senin', short: 'Sen' },
    { id: 2, label: 'Selasa', short: 'Sel' },
    { id: 3, label: 'Rabu', short: 'Rab' },
    { id: 4, label: 'Kamis', short: 'Kam' },
    { id: 5, label: 'Jumat', short: 'Jum' },
    { id: 6, label: 'Sabtu', short: 'Sab' },
  ];

  const timeToMinutes = (timeStr: string): number => {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };

  const effectiveDay = isRealTimeWita ? witaTimeInfo.dayOfWeek : simulatedDay;
  const effectiveMinutes = isRealTimeWita
    ? witaTimeInfo.totalMinutes
    : timeToMinutes(simulatedTime);

  // Filter schedules for the current active class
  const classSchedules = useMemo(() => {
    if (!activeClass) return [];
    return schedules.filter((s) => s.classId === activeClass.id);
  }, [schedules, activeClass]);

  // Group schedules by day of week and sort by start time
  const schedulesByDay = useMemo(() => {
    const map: Record<number, ScheduleItem[]> = {
      1: [],
      2: [],
      3: [],
      4: [],
      5: [],
      6: [],
    };
    classSchedules.forEach((s) => {
      if (map[s.dayOfWeek]) {
        map[s.dayOfWeek].push(s);
      }
    });

    // Sort each day
    Object.keys(map).forEach((d) => {
      const dayNum = Number(d);
      map[dayNum].sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
    });

    return map;
  }, [classSchedules]);

  // Overlap Detection: Find any schedules that collide in time on the same day
  const overlappingScheduleIds = useMemo(() => {
    const overlapSet = new Set<string>();

    Object.values(schedulesByDay).forEach((dayItems) => {
      for (let i = 0; i < dayItems.length; i++) {
        for (let j = i + 1; j < dayItems.length; j++) {
          const itemA = dayItems[i];
          const itemB = dayItems[j];
          const startA = timeToMinutes(itemA.startTime);
          const endA = timeToMinutes(itemA.endTime);
          const startB = timeToMinutes(itemB.startTime);
          const endB = timeToMinutes(itemB.endTime);

          // Overlap condition: startA < endB && startB < endA
          if (startA < endB && startB < endA) {
            overlapSet.add(itemA.id);
            overlapSet.add(itemB.id);
          }
        }
      }
    });

    return overlapSet;
  }, [schedulesByDay]);

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'red':
        return 'bg-rose-50 border-rose-200 dark:bg-rose-950/40 dark:border-rose-900/60 text-rose-900 dark:text-rose-100';
      case 'emerald':
      case 'teal':
        return 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-900/60 text-emerald-900 dark:text-emerald-100';
      case 'amber':
      case 'orange':
        return 'bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:border-amber-900/60 text-amber-900 dark:text-amber-100';
      case 'purple':
      case 'violet':
        return 'bg-purple-50 border-purple-200 dark:bg-purple-950/40 dark:border-purple-900/60 text-purple-900 dark:text-purple-100';
      case 'cyan':
        return 'bg-cyan-50 border-cyan-200 dark:bg-cyan-950/40 dark:border-cyan-900/60 text-cyan-900 dark:text-cyan-100';
      default:
        return 'bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:border-blue-900/60 text-blue-900 dark:text-blue-100';
    }
  };

  return (
    <div className="space-y-4">
      {/* Overlap alert banner if any collision detected */}
      {overlappingScheduleIds.size > 0 && (
        <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-800 flex items-start gap-3 text-xs text-rose-900 dark:text-rose-200 animate-in fade-in">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-bold">
              Terdeteksi {overlappingScheduleIds.size / 2} Jadwal Bentrok (Overlap Waktu)!
            </p>
            <p className="text-[11px] text-rose-700 dark:text-rose-300">
              Ada mata pelajaran yang memiliki jam mulai dan selesai bersamaan di hari yang sama. Jadwal yang bertabrakan ditandai dengan garis merah tebal di bawah.
            </p>
          </div>
        </div>
      )}

      {/* Grid Table Container */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        {/* Header Grid Summary */}
        <div className="p-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Visualisasi Grid Mingguan KBM
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Total {classSchedules.length} Sesi Terjadwal
          </span>
        </div>

        {/* 6-Column Responsive Weekly Matrix (Senin - Sabtu) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-800/80">
          {days.map((day) => {
            const dayItems = schedulesByDay[day.id] || [];
            const isToday = effectiveDay === day.id;

            return (
              <div
                key={day.id}
                className={`p-3 space-y-2.5 min-h-[300px] transition-colors ${
                  isToday
                    ? 'bg-indigo-50/20 dark:bg-indigo-950/10'
                    : 'bg-white dark:bg-slate-900'
                }`}
              >
                {/* Column Day Header */}
                <div
                  className={`pb-2 border-b flex items-center justify-between ${
                    isToday
                      ? 'border-indigo-300 dark:border-indigo-800'
                      : 'border-slate-100 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`font-bold text-xs ${
                        isToday
                          ? 'text-indigo-600 dark:text-indigo-400'
                          : 'text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {day.label}
                    </span>
                    {isToday && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 text-[9px] font-bold">
                        <Radio className="w-2 h-2 animate-pulse" /> Hari Ini
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    {dayItems.length} Mapel
                  </span>
                </div>

                {/* Day Items List */}
                {dayItems.length === 0 ? (
                  <div className="py-8 text-center text-[11px] text-slate-400 italic">
                    Libur / Kosong
                  </div>
                ) : (
                  <div className="space-y-2">
                    {dayItems.map((item) => {
                      const isOverlap = overlappingScheduleIds.has(item.id);
                      const startMin = timeToMinutes(item.startTime);
                      const endMin = timeToMinutes(item.endTime);
                      const isLive =
                        isToday &&
                        effectiveMinutes >= startMin &&
                        effectiveMinutes < endMin;

                      return (
                        <div
                          key={item.id}
                          onClick={() => {
                            if (currentUser.role === 'teacher' && onOpenScheduleEdit) {
                              onOpenScheduleEdit(item);
                            }
                          }}
                          className={`p-2.5 rounded-xl border text-xs transition-all relative ${
                            isOverlap
                              ? 'border-2 border-rose-500 bg-rose-50/60 dark:bg-rose-950/40 shadow-xs ring-2 ring-rose-500/20'
                              : isLive
                              ? 'border-2 border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40 shadow-md ring-2 ring-emerald-500/20'
                              : getColorClasses(item.colorTheme)
                          } ${
                            currentUser.role === 'teacher' ? 'cursor-pointer hover:scale-[1.02]' : ''
                          }`}
                        >
                          {/* Live Ongoing Indicator */}
                          {isLive && (
                            <span className="inline-flex items-center gap-1 mb-1 px-1.5 py-0.5 rounded bg-emerald-600 text-white font-extrabold text-[9px] uppercase tracking-wider animate-pulse shadow-xs">
                              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                              Sedang Berlangsung (WITA)
                            </span>
                          )}

                          {/* Overlap Badge */}
                          {isOverlap && (
                            <span className="inline-flex items-center gap-1 mb-1 px-1.5 py-0.2 rounded bg-rose-600 text-white font-bold text-[9px] uppercase tracking-wider">
                              <AlertTriangle className="w-2.5 h-2.5" />
                              Bentrok
                            </span>
                          )}

                          {/* Live indicator badge */}
                          {isLive && !isOverlap && (
                            <span className="inline-flex items-center gap-1 mb-1 px-1.5 py-0.2 rounded bg-emerald-600 text-white font-bold text-[9px] uppercase tracking-wider">
                              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                              Sedang KBM
                            </span>
                          )}

                          {/* Subject Title */}
                          <h4 className="font-bold text-xs text-slate-900 dark:text-white leading-tight">
                            {item.subjectName}
                          </h4>

                          {/* Teacher Name */}
                          <p className="text-[11px] text-slate-600 dark:text-slate-300 flex items-center gap-1 mt-1 truncate">
                            <UserCheck className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{item.teacherName}</span>
                          </p>

                          {/* Time Slot */}
                          <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
                            <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>
                              {item.startTime} - {item.endTime}
                            </span>
                          </p>

                          {/* Room Location (respect privacy setting) */}
                          {!privacySettings.hideSpecificLocations && item.roomLocation && (
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5 truncate">
                              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="truncate">{item.roomLocation}</span>
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
