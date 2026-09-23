import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { EmptyClassState } from './EmptyClassState';
import {
  Megaphone,
  Plus,
  Calendar,
  MapPin,
  Clock,
  Heart,
  AlertTriangle,
  Info,
  CalendarCheck2,
  Trash2,
  CheckCircle,
  Radio,
  Share2,
} from 'lucide-react';

interface AgendaAnnouncementViewProps {
  onOpenClassModal?: () => void;
}

export const AgendaAnnouncementView: React.FC<AgendaAnnouncementViewProps> = ({
  onOpenClassModal,
}) => {
  const {
    currentUser,
    activeClass,
    announcements,
    addAnnouncement,
    deleteAnnouncement,
    toggleLikeAnnouncement,
  } = useApp();

  const [activeFilter, setActiveFilter] = useState<'all' | 'announcements' | 'agenda'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState<'urgent' | 'info' | 'agenda'>('info');
  const [isNonKbmAgenda, setIsNonKbmAgenda] = useState(false);
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [location, setLocation] = useState('');

  // Filter announcements for active class
  const classAnnouncements = announcements
    .filter((a) => activeClass && a.classId === activeClass.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const displayedList = classAnnouncements.filter((item) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'announcements') return !item.isNonKbmAgenda;
    if (activeFilter === 'agenda') return item.isNonKbmAgenda;
    return true;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeClass || !title.trim() || !content.trim()) return;

    addAnnouncement(
      title.trim(),
      content.trim(),
      type,
      isNonKbmAgenda,
      location.trim() || undefined,
      eventDate || undefined,
      eventTime.trim() || undefined
    );

    setShowCreateModal(false);
    setTitle('');
    setContent('');
    setType('info');
    setIsNonKbmAgenda(false);
    setEventDate('');
    setEventTime('');
    setLocation('');
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  if (!activeClass) {
    return (
      <EmptyClassState
        onOpenClassModal={onOpenClassModal}
        message="Belum ada kelas aktif. Buat kelas baru untuk membagikan pengumuman atau agenda madrasah."
      />
    );
  }

  return (
    <div className="space-y-4 pb-24">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5">
            <Megaphone className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-bold text-sm sm:text-base text-slate-800 dark:text-slate-100">
              Pengumuman & Agenda Harian
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {currentUser.role === 'teacher'
              ? 'Bagikan pengumuman cepat KBM dan agenda kegiatan sekolah'
              : 'Informasi resmi dari guru pengampu dan jadwal agenda sekolah'}
          </p>
        </div>

        {currentUser.role === 'teacher' && (
          <button
            id="create-announcement-btn"
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Buat Info/Agenda</span>
          </button>
        )}
      </div>

      {/* Tabs Filter */}
      <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
        {[
          { id: 'all' as const, label: 'Semua Informasi' },
          { id: 'announcements' as const, label: 'Pengumuman KBM' },
          { id: 'agenda' as const, label: 'Agenda Non-KBM 📅' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id)}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
              activeFilter === tab.id
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Announcements List */}
      {displayedList.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-dashed border-slate-300 dark:border-slate-800 text-center space-y-2">
          <Megaphone className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Belum ada pengumuman atau agenda.
          </p>
          <p className="text-xs text-slate-400">
            Semua pemberitahuan broadcast dari guru akan tampil secara real-time di sini.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayedList.map((item) => {
            const isUrgent = item.type === 'urgent';
            const isAgenda = item.isNonKbmAgenda;

            return (
              <div
                key={item.id}
                id={`announcement-card-${item.id}`}
                className={`bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border transition-all shadow-xs ${
                  isUrgent
                    ? 'border-rose-400/80 dark:border-rose-800/80 bg-rose-50/20 dark:bg-rose-950/10'
                    : isAgenda
                    ? 'border-indigo-200 dark:border-indigo-900/60'
                    : 'border-slate-200/80 dark:border-slate-800'
                }`}
              >
                {/* Header author & badges */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isUrgent
                          ? 'bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400'
                          : isAgenda
                          ? 'bg-sky-100 text-sky-600 dark:bg-sky-950 dark:text-sky-400'
                          : 'bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400'
                      }`}
                    >
                      {isUrgent ? (
                        <AlertTriangle className="w-5 h-5" />
                      ) : isAgenda ? (
                        <CalendarCheck2 className="w-5 h-5" />
                      ) : (
                        <Megaphone className="w-5 h-5" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                          {item.createdByName}
                        </span>
                        {isUrgent && (
                          <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-rose-500 text-white animate-pulse">
                            PENTING / SEGERA
                          </span>
                        )}
                        {isAgenda && (
                          <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300">
                            Agenda Non-KBM
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400">
                        {formatDate(item.createdAt)}
                      </p>
                    </div>
                  </div>

                  {currentUser.role === 'teacher' && (
                    <button
                      onClick={() => {
                        if (confirm(`Hapus pengumuman "${item.title}"?`)) {
                          deleteAnnouncement(item.id);
                        }
                      }}
                      className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Hapus Pengumuman"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Content */}
                <div className="mt-3 space-y-1.5">
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">
                    {item.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                    {item.content}
                  </p>
                </div>

                {/* Non-KBM Agenda Details Pill (Date, Time, Location) */}
                {isAgenda && (
                  <div className="mt-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex flex-wrap items-center gap-3 text-xs">
                    {item.eventDate && (
                      <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-semibold">
                        <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                        <span>{formatDate(item.eventDate)}</span>
                      </div>
                    )}
                    {item.eventTime && (
                      <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                        <Clock className="w-3.5 h-3.5 text-indigo-500" />
                        <span>{item.eventTime}</span>
                      </div>
                    )}
                    {item.location && (
                      <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-rose-500" />
                        <span>{item.location}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Bottom interaction bar */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                  <button
                    onClick={() => toggleLikeAnnouncement(item.id)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                  >
                    <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                    <span>{item.likesCount || 0} Siswa Mengetahui</span>
                  </button>

                  <div className="flex items-center gap-1 text-[11px] text-slate-400">
                    <CheckCircle className="w-3 h-3 text-emerald-500" />
                    <span>Terbaca Otomatis</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Teacher Create Announcement / Agenda Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-slate-200 dark:border-slate-700 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Buat Pengumuman / Agenda Sekolah
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="mt-4 space-y-3.5">
              {/* Type selector */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Kategori Informasi
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'info' as const, label: 'Pengumuman Biasa', isNonKbm: false },
                    { id: 'urgent' as const, label: '🚨 Sangat Penting', isNonKbm: false },
                    { id: 'agenda' as const, label: '📅 Agenda Non-KBM', isNonKbm: true },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setType(t.id);
                        setIsNonKbmAgenda(t.isNonKbm);
                      }}
                      className={`py-2 px-1 text-xs rounded-xl border text-center font-medium transition-all ${
                        type === t.id
                          ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Judul Pengumuman *
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    isNonKbmAgenda
                      ? 'Contoh: Upacara Bendera HUT RI / Kerja Bakti Kelas'
                      : 'Contoh: Hari ini Kuis mendadak di Ruang Lab'
                  }
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-transparent text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Isi / Pesan Pengumuman *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Tuliskan instruksi atau rincian agenda lengkap untuk siswa..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-transparent text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              {/* Extra fields for Non-KBM Agenda */}
              {isNonKbmAgenda && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 space-y-2.5">
                  <p className="text-xs font-bold text-indigo-600">Rincian Agenda Kegiatan:</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-medium text-slate-600 dark:text-slate-400 block mb-0.5">
                        Tanggal Acara
                      </label>
                      <input
                        type="date"
                        value={eventDate}
                        onChange={(e) => setEventDate(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-slate-600 dark:text-slate-400 block mb-0.5">
                        Waktu / Jam Acara
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: 07:00 - 08:30 WIB"
                        value={eventTime}
                        onChange={(e) => setEventTime(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-600 dark:text-slate-400 block mb-0.5">
                      Lokasi / Tempat Acara
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Lapangan Upacara Utama, Ruang CBT Lab 1"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                    />
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20"
                >
                  Broadcast ke Siswa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
