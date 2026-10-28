import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { ScheduleItem } from '../types';
import {
  Clock,
  MapPin,
  UserCheck,
  AlertTriangle,
  Calendar,
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

  const classSchedules = useMemo(() => {
    if (!activeClass) return [];
    return schedules.filter((s) => s.classId === activeClass.id);
  }, [schedules, activeClass]);

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

    Object.keys(map).forEach((d) => {
      const dayNum = Number(d);
      map[dayNum].sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
    });

    return map;
  }, [classSchedules]);

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

          if (startA < endB && startB < endA) {
            overlapSet.add(itemA.id);
            overlapSet.add(itemB.id);
          }
        }
      }
    });

    return overlapSet;
  }, [schedulesByDay]);

  return (
    <div className="space-y-4">
      {overlappingScheduleIds.size > 0 && (
        <div className="p-4 rounded-[24px] bg-rose-50 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-800 flex items-start gap-3 text-xs text-rose-900 dark:text-rose-200">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-bold">
              Terdeteksi {overlappingScheduleIds.size / 2} Jadwal Bentrok (Overlap Waktu)
            </p>
            <p className="text-[11px] text-rose-700 dark:text-rose-300">
              Ada mata pelajaran dengan jam mulai dan selesai bersamaan di hari yang sama.
            </p>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-[#13313C] rounded-[28px] border border-[#ECECE6] dark:border-[#214B59] shadow-[0_10px_30px_rgba(22,62,75,0.06)] overflow-hidden">
        <div className="p-4 bg-[#163E4B] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#F4A950]" />
            <h3 className="font-extrabold text-sm">
              Visualisasi Grid Mingguan KBM
            </h3>
          </div>
          <span className="text-xs text-[#FCEADE] font-semibold tabular-nums">
            Total {classSchedules.length} Sesi
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 divide-y md:divide-y-0 md:divide-x divide-[#F0F0EC] dark:divide-[#214B59]">
          {days.map((day) => {
            const dayItems = schedulesByDay[day.id] || [];
            const isToday = effectiveDay === day.id;

            return (
              <div
                key={day.id}
                className={`p-3.5 space-y-2.5 min-h-[260px] transition-colors ${
                  isToday
                    ? 'bg-[#FCEADE]/30 dark:bg-[#193E4C]/50'
                    : 'bg-white dark:bg-[#13313C]'
                }`}
              >
                <div
                  className={`pb-2 border-b flex items-center justify-between ${
                    isToday
                      ? 'border-[#F4A950]'
                      : 'border-[#F0F0EC] dark:border-[#214B59]'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`font-extrabold text-xs ${
                        isToday
                          ? 'text-[#E59638]'
                          : 'text-[#163E4B] dark:text-white'
                      }`}
                    >
                      {day.label}
                    </span>
                    {isToday && (
                      <span className="text-[10px] font-bold text-[#163E4B] dark:text-[#FCEADE]">
                        · Hari Ini
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-mono tabular-nums text-[#7B8D93]">
                    {dayItems.length} Mapel
                  </span>
                </div>

                {dayItems.length === 0 ? (
                  <div className="py-8 text-center text-[11px] text-[#8DA0A6]">
                    Libur / Kosong
                  </div>
                ) : (
                  <div className="space-y-2">
                    {dayItems.map((item, idx) => {
                      const isOverlap = overlappingScheduleIds.has(item.id);
                      const startMin = timeToMinutes(item.startTime);
                      const endMin = timeToMinutes(item.endTime);
                      const isLive =
                        isToday &&
                        effectiveMinutes >= startMin &&
                        effectiveMinutes < endMin;
                      const isPeach = idx % 2 === 0;

                      return (
                        <div
                          key={item.id}
                          onClick={() => {
                            if (currentUser.role === 'teacher' && onOpenScheduleEdit) {
                              onOpenScheduleEdit(item);
                            }
                          }}
                          className={`p-3 rounded-2xl border text-xs transition-all relative ${
                            isOverlap
                              ? 'border-2 border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-100'
                              : isLive
                              ? 'border-[#163E4B] bg-[#163E4B] text-white shadow-md'
                              : isPeach
                              ? 'bg-[#FCEADE] border-[#F4D3BA] text-[#163E4B] dark:bg-[#193E4C] dark:border-[#2B5A6B] dark:text-white'
                              : 'bg-[#F7F7F5] border-[#EAEAE4] text-[#163E4B] dark:bg-[#0F2730] dark:border-[#214B59] dark:text-white'
                          } ${
                            currentUser.role === 'teacher'
                              ? 'cursor-pointer hover:-translate-y-0.5'
                              : ''
                          }`}
                        >
                          {isLive && (
                            <span className="inline-block mb-1 text-[10px] font-bold text-[#F4A950]">
                              Sedang Berlangsung (WITA)
                            </span>
                          )}

                          {isOverlap && (
                            <span className="inline-flex items-center gap-1 mb-1 px-1.5 py-0.5 rounded bg-rose-600 text-white font-bold text-[9px]">
                              <AlertTriangle className="w-2.5 h-2.5" />
                              Bentrok
                            </span>
                          )}

                          <h4 className="font-extrabold text-xs leading-snug">
                            {item.subjectName}
                          </h4>

                          <p
                            className={`text-[11px] flex items-center gap-1 mt-1 truncate ${
                              isLive ? 'text-white/80' : 'text-[#5E747D] dark:text-[#AFC8D0]'
                            }`}
                          >
                            <UserCheck className="w-3 h-3 text-[#F4A950] shrink-0" />
                            <span className="truncate">{item.teacherName}</span>
                          </p>

                          <p
                            className={`text-[10px] font-mono tabular-nums flex items-center gap-1 mt-1 ${
                              isLive ? 'text-[#FCEADE]' : 'text-[#7B8D93] dark:text-[#98B4BE]'
                            }`}
                          >
                            <Clock className="w-3 h-3 text-[#F4A950] shrink-0" />
                            <span>
                              {item.startTime} - {item.endTime}
                            </span>
                          </p>

                          {!privacySettings.hideSpecificLocations && item.roomLocation && (
                            <p
                              className={`text-[10px] flex items-center gap-1 mt-0.5 truncate ${
                                isLive ? 'text-white/75' : 'text-[#7B8D93] dark:text-[#98B4BE]'
                              }`}
                            >
                              <MapPin className="w-3 h-3 text-[#F4A950] shrink-0" />
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
