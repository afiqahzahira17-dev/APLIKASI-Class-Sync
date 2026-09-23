import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { ScheduleItem } from '../types';
import { EmptyClassState } from './EmptyClassState';
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
  } = useApp();

  const [selectedDay, setSelectedDay] = useState<number>(simulatedDay);
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
  ];

  // Helper to parse "HH:mm" to total minutes
  const timeToMinutes = (timeStr: string): number => {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };

  const currentMinutes = timeToMinutes(simulatedTime);

  // Filter schedules for the current active class and selected day, sorted chronologically
  const daySchedules = useMemo(() => {
    if (!activeClass) return [];
    return schedules
      .filter((s) => s.classId === activeClass.id && s.dayOfWeek === selectedDay)
      .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
  }, [schedules, activeClass, selectedDay]);

  // Determine which class is currently live right now on today's simulated day
  const liveClass = useMemo(() => {
    if (!activeClass || selectedDay !== simulatedDay) return null;
    return daySchedules.find((s) => {
      const startMin = timeToMinutes(s.startTime);
      const endMin = timeToMinutes(s.endTime);
      return currentMinutes >= startMin && currentMinutes < endMin;
    });
  }, [daySchedules, selectedDay, simulatedDay, currentMinutes, activeClass]);

  // Next upcoming class on today's simulated day
  const upcomingClass = useMemo(() => {
    if (!activeClass || selectedDay !== simulatedDay) return null;
    return daySchedules.find((s) => timeToMinutes(s.startTime) > currentMinutes);
  }, [daySchedules, selectedDay, simulatedDay, currentMinutes, activeClass]);

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
      {/* Top Banner: Sedang Berlangsung (Live) */}
      {selectedDay === simulatedDay && liveClass && (
        <div className="rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 p-4 text-slate-900 dark:text-slate-100">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                <span>Sedang Berlangsung</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                {liveClass.subjectName}
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1.5 font-medium">
                <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                {liveClass.teacherName}
              </p>
            </div>

            <div className="text-right shrink-0">
              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-mono text-xs font-bold">
                <Clock className="w-3.5 h-3.5" />
                {liveClass.startTime} - {liveClass.endTime}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Sisa <span className="font-semibold text-emerald-700 dark:text-emerald-400">{Math.max(0, timeToMinutes(liveClass.endTime) - currentMinutes)} menit</span>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-emerald-200/60 dark:border-emerald-800/60 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-1.5 font-medium">
              <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Lokasi: {liveClass.roomLocation}</span>
            </div>
            {liveClass.notes && (
              <p className="text-[11px] text-slate-500 italic truncate max-w-[200px] sm:max-w-xs">
                "{liveClass.notes}"
              </p>
            )}
          </div>
        </div>
      )}

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

            const isToday = selectedDay === simulatedDay;
            const isLive = isToday && currentMinutes >= startMin && currentMinutes < endMin;
            const isCompleted = isToday && currentMinutes >= endMin;
            const isUpcoming = isToday && currentMinutes < startMin;

            const theme = getColorClasses(item.colorTheme);

            return (
              <div
                key={item.id}
                id={`schedule-item-${item.id}`}
                className={`bg-white dark:bg-slate-900 rounded-2xl p-4 border transition-all duration-150 ${
                  isLive
                    ? 'border-emerald-500/80 bg-emerald-50/20 dark:bg-emerald-950/20 shadow-xs'
                    : 'border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      {/* Time slot & status badge */}
                      <div className="flex items-center flex-wrap gap-2">
                        <span className="inline-flex items-center gap-1 font-mono text-xs font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg">
                          <Clock className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                          {item.startTime} - {item.endTime}
                        </span>

                        {/* Indikator Status PRD 3.2 */}
                        {isLive && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/70 px-2 py-0.5 rounded-full animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                            Sedang Berlangsung
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
                            Akan Datang ({startMin - currentMinutes} mnt lagi)
                          </span>
                        )}
                      </div>

                      {/* Subject Name */}
                      <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white pt-0.5">
                        {item.subjectName}
                      </h4>

                      {/* Teacher name */}
                      <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium">
                        <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                        {item.teacherName}
                      </p>
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
                      <span>{item.roomLocation}</span>
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
    </div>
  );
};
