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
  CalendarCheck2,
  Trash2,
  CheckCircle,
  Check,
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
    classes,
    isAllClassesView,
    announcements,
    addAnnouncement,
    deleteAnnouncement,
    toggleLikeAnnouncement,
  } = useApp();

  const [activeFilter, setActiveFilter] = useState<'all' | 'announcements' | 'agenda'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState<'urgent' | 'info' | 'agenda'>('info');
  const [isNonKbmAgenda, setIsNonKbmAgenda] = useState(false);
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [location, setLocation] = useState('');
  const [selectedTargetClassIds, setSelectedTargetClassIds] = useState<string[]>([]);

  const classMap = React.useMemo(() => new Map(classes.map((c) => [c.id, c])), [classes]);
  const enrolledClassIds = React.useMemo(() => new Set(classes.map((c) => c.id)), [classes]);
  const isCombinedMultiClass = isAllClassesView && classes.length >= 2;

  const classAnnouncements = announcements
    .filter((a) => {
      if (!activeClass) return false;
      return isCombinedMultiClass ? enrolledClassIds.has(a.classId) : a.classId === activeClass.id;
    })
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

    const targets =
      selectedTargetClassIds.length > 0 ? selectedTargetClassIds : [activeClass.id];

    addAnnouncement(
      title.trim(),
      content.trim(),
      type,
      isNonKbmAgenda,
      location.trim() || undefined,
      eventDate || undefined,
      eventTime.trim() || undefined,
      targets
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
      {/* Top Banner in Deep Petrol #163E4B */}
      <div className="bg-[#163E4B] rounded-[28px] p-5 text-white shadow-[0_14px_34px_rgba(22,62,75,0.2)] flex items-center justify-between gap-3 flex-wrap relative overflow-hidden">
        <div className="w-32 h-32 rounded-full border-[6px] border-white/[0.05] absolute -right-8 -bottom-10 pointer-events-none" />

        <div className="space-y-0.5 relative z-10">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-white/12 text-[#F4A950]">
              <Megaphone className="w-4 h-4" />
            </div>
            <h3 className="font-extrabold text-sm sm:text-base text-white tracking-tight">
              Pengumuman & <span className="text-[#F4A950]">Agenda Harian</span>
            </h3>
          </div>
          <p className="text-xs text-white/75">
            {currentUser.role === 'teacher'
              ? 'Bagikan pengumuman cepat KBM dan agenda kegiatan sekolah'
              : 'Informasi resmi dari guru pengampu dan jadwal agenda sekolah'}
          </p>
        </div>

        {currentUser.role === 'teacher' && (
          <button
            id="create-announcement-btn"
            onClick={() => {
              setSelectedTargetClassIds(activeClass ? [activeClass.id] : []);
              setShowCreateModal(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#F4A950] hover:bg-[#E59638] text-white rounded-full text-xs font-bold shadow-[0_6px_16px_rgba(244,169,80,0.35)] transition-colors shrink-0 cursor-pointer relative z-10 whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Buat Info/Agenda</span>
          </button>
        )}
      </div>

      {/* Tabs Filter */}
      <div className="flex items-center gap-1 bg-white dark:bg-[#13313C] p-1 rounded-full border border-[#ECECE6] dark:border-[#214B59] shadow-2xs">
        {[
          { id: 'all' as const, label: 'Semua Informasi' },
          { id: 'announcements' as const, label: 'Pengumuman KBM' },
          { id: 'agenda' as const, label: 'Agenda Non-KBM' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id)}
            className={`flex-1 py-2 px-2.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap truncate ${
              activeFilter === tab.id
                ? 'bg-[#163E4B] text-white shadow-xs'
                : 'text-[#6E828A] dark:text-[#9CB7C0] hover:text-[#163E4B] dark:hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Announcements List */}
      {displayedList.length === 0 ? (
        <div className="bg-white dark:bg-[#13313C] rounded-[26px] p-8 border border-dashed border-[#D8E0E3] dark:border-[#245363] text-center space-y-2 shadow-[0_8px_24px_rgba(22,62,75,0.04)]">
          <Megaphone className="w-10 h-10 mx-auto text-[#B5C4C9] dark:text-[#577C89]" />
          <p className="text-sm font-bold text-[#163E4B] dark:text-white">
            Belum ada pengumuman atau agenda.
          </p>
          <p className="text-xs text-[#7B8D93] dark:text-[#98B4BE]">
            Semua pemberitahuan broadcast dari guru akan tampil secara real-time di sini.
          </p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {displayedList.map((item, idx) => {
            const isUrgent = item.type === 'urgent';
            const isAgenda = item.isNonKbmAgenda;
            const isPeachCard = !isUrgent && (isAgenda || idx % 2 === 1);

            return (
              <div
                key={item.id}
                id={`announcement-card-${item.id}`}
                className={`rounded-[26px] p-4 sm:p-5 border transition-all relative overflow-hidden ${
                  isUrgent
                    ? 'bg-rose-50/70 dark:bg-rose-950/20 border-rose-300 dark:border-rose-800'
                    : isPeachCard
                    ? 'bg-[#FCEADE] dark:bg-[#193D4A] border-[#F4D3BA] dark:border-[#2A596A] shadow-[0_8px_24px_rgba(22,62,75,0.04)]'
                    : 'bg-white dark:bg-[#13313C] border-[#ECECE6] dark:border-[#214B59] shadow-[0_8px_26px_rgba(22,62,75,0.05)]'
                }`}
              >
                {isPeachCard && (
                  <div className="w-28 h-28 rounded-full border-[6px] border-[#F2C9A8]/45 dark:border-white/[0.04] absolute -right-8 -bottom-8 pointer-events-none" />
                )}

                <div className="flex items-start justify-between gap-3 relative z-10">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                        isUrgent
                          ? 'bg-rose-600 text-white'
                          : 'bg-[#163E4B] text-[#F4A950]'
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
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-xs sm:text-sm text-[#163E4B] dark:text-white">
                          {item.createdByName}
                        </span>
                        {classes.length >= 2 && classMap.get(item.classId) && (
                          <span className="text-[11px] font-bold text-[#163E4B] dark:text-[#FCEADE]">
                            · {classMap.get(item.classId)?.name}
                          </span>
                        )}
                        {isUrgent && (
                          <span className="text-[11px] font-extrabold text-rose-600 dark:text-rose-400">
                            · Penting / Segera
                          </span>
                        )}
                        {isAgenda && (
                          <span className="text-[11px] font-bold text-[#E59638]">
                            · Agenda Non-KBM
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#7B8D93]">{formatDate(item.createdAt)}</p>
                    </div>
                  </div>

                  {currentUser.role === 'teacher' && (
                    <button
                      onClick={() => {
                        if (confirm(`Hapus pengumuman "${item.title}"?`)) {
                          deleteAnnouncement(item.id);
                        }
                      }}
                      className="text-[#6E828A] hover:text-rose-600 p-2 rounded-xl hover:bg-white/70 dark:hover:bg-[#112B35] transition-colors cursor-pointer"
                      title="Hapus Pengumuman"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="mt-3 space-y-1.5 relative z-10">
                  <h4 className="text-base font-extrabold text-[#163E4B] dark:text-white tracking-tight">
                    {item.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-[#587079] dark:text-[#C5DBE2] leading-relaxed whitespace-pre-line">
                    {item.content}
                  </p>
                </div>

                {isAgenda && (
                  <div className="mt-3 p-3 rounded-2xl bg-white/85 dark:bg-[#0E262F] border border-[#ECECE6] dark:border-[#245363] flex flex-wrap items-center gap-3 text-xs relative z-10">
                    {item.eventDate && (
                      <div className="flex items-center gap-1.5 text-[#163E4B] dark:text-white font-bold">
                        <Calendar className="w-3.5 h-3.5 text-[#F4A950]" />
                        <span>{formatDate(item.eventDate)}</span>
                      </div>
                    )}
                    {item.eventTime && (
                      <div className="flex items-center gap-1.5 text-[#6E828A] dark:text-[#9CB7C0] font-semibold">
                        <Clock className="w-3.5 h-3.5 text-[#F4A950]" />
                        <span>{item.eventTime}</span>
                      </div>
                    )}
                    {item.location && (
                      <div className="flex items-center gap-1.5 text-[#163E4B] dark:text-white font-semibold">
                        <MapPin className="w-3.5 h-3.5 text-[#E59638]" />
                        <span>{item.location}</span>
                      </div>
                    )}
                  </div>
                )}

                <div
                  className={`mt-4 pt-3 border-t flex items-center justify-between text-xs relative z-10 ${
                    isPeachCard
                      ? 'border-[#F0CCA9]/60 dark:border-white/10'
                      : 'border-[#F0F0EC] dark:border-[#214B59]'
                  }`}
                >
                  <button
                    onClick={() => toggleLikeAnnouncement(item.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 dark:bg-[#0E262F] hover:bg-white text-[#163E4B] dark:text-white font-bold transition-colors cursor-pointer"
                  >
                    <Heart className="w-3.5 h-3.5 fill-[#F4A950] text-[#F4A950]" />
                    <span className="tabular-nums">{item.likesCount || 0} Siswa Mengetahui</span>
                  </button>

                  <div className="flex items-center gap-1 text-[11px] text-[#6E828A] dark:text-[#9CB7C0] font-semibold">
                    <CheckCircle className="w-3.5 h-3.5 text-[#E59638]" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0D242C]/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#13313C] rounded-[28px] max-w-lg w-full p-5 shadow-2xl border border-[#ECECE6] dark:border-[#245363] max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0F0EC] dark:border-[#214B59]">
              <h3 className="font-extrabold text-[#163E4B] dark:text-white text-base">
                Buat Pengumuman / Agenda Sekolah
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-[#7B8D93] hover:text-[#163E4B] dark:hover:text-white text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="mt-4 space-y-3.5">
              {classes.length >= 2 && (
                <div className="p-3 rounded-2xl bg-[#FCEADE]/60 dark:bg-[#0E262F] border border-[#F4D3BA] dark:border-[#245363] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-[#163E4B] dark:text-white">
                      Broadcast ke Kelas (Bisa 2 Kelas atau Lebih) *
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedTargetClassIds(
                          selectedTargetClassIds.length === classes.length
                            ? [activeClass.id]
                            : classes.map((c) => c.id)
                        )
                      }
                      className="text-[11px] font-bold text-[#C87A24] dark:text-[#F4A950] hover:underline cursor-pointer"
                    >
                      {selectedTargetClassIds.length === classes.length
                        ? 'Hanya Kelas Aktif'
                        : 'Pilih Semua Kelas'}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {classes.map((cls) => {
                      const checked = selectedTargetClassIds.includes(cls.id);
                      return (
                        <button
                          key={cls.id}
                          type="button"
                          onClick={() => {
                            setSelectedTargetClassIds((prev) => {
                              if (prev.includes(cls.id)) {
                                return prev.length > 1 ? prev.filter((id) => id !== cls.id) : prev;
                              }
                              return [...prev, cls.id];
                            });
                          }}
                          className={`px-3 py-1 rounded-xl text-xs font-bold border flex items-center gap-1 cursor-pointer transition-all ${
                            checked
                              ? 'bg-[#163E4B] border-[#163E4B] text-white'
                              : 'bg-white dark:bg-[#13313C] border-[#DCE3E6] dark:border-[#275668] text-[#6E828A] dark:text-[#B2CBD4]'
                          }`}
                        >
                          {checked && <Check className="w-3 h-3 text-[#F4A950]" />}
                          <span>{cls.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-[#163E4B] dark:text-[#E5F0F3] block mb-1">
                  Kategori Informasi
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'info' as const, label: 'Pengumuman', isNonKbm: false },
                    { id: 'urgent' as const, label: 'Penting', isNonKbm: false },
                    { id: 'agenda' as const, label: 'Agenda Non-KBM', isNonKbm: true },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setType(t.id);
                        setIsNonKbmAgenda(t.isNonKbm);
                      }}
                      className={`py-2 px-1.5 text-xs rounded-2xl border text-center font-bold transition-all cursor-pointer ${
                        type === t.id
                          ? 'border-[#163E4B] bg-[#163E4B] text-white'
                          : 'border-[#DCE3E6] dark:border-[#275668] text-[#6E828A] dark:text-[#B2CBD4]'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#163E4B] dark:text-[#E5F0F3] block mb-1">
                  Judul Pengumuman *
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    isNonKbmAgenda
                      ? 'Contoh: Peringatan Hari Besar / Kerja Bakti Kelas'
                      : 'Contoh: Hari ini Kuis di Ruang Lab'
                  }
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-2xl border border-[#DCE3E6] dark:border-[#275668] bg-[#F7F7F5] dark:bg-[#0E262F] text-[#163E4B] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#F4A950]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#163E4B] dark:text-[#E5F0F3] block mb-1">
                  Isi / Pesan Pengumuman *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Tuliskan instruksi atau rincian agenda lengkap untuk siswa..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-2xl border border-[#DCE3E6] dark:border-[#275668] bg-[#F7F7F5] dark:bg-[#0E262F] text-[#163E4B] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#F4A950] resize-none"
                />
              </div>

              {isNonKbmAgenda && (
                <div className="p-3.5 rounded-2xl bg-[#FCEADE]/60 dark:bg-[#0E262F] border border-[#F4D3BA] dark:border-[#245363] space-y-2.5">
                  <p className="text-xs font-extrabold text-[#163E4B] dark:text-[#F4A950]">
                    Rincian Agenda Kegiatan:
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-bold text-[#163E4B] dark:text-[#E5F0F3] block mb-0.5">
                        Tanggal Acara
                      </label>
                      <input
                        type="date"
                        value={eventDate}
                        onChange={(e) => setEventDate(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs rounded-xl border border-[#DCE3E6] dark:border-[#275668] bg-white dark:bg-[#13313C] text-[#163E4B] dark:text-white font-mono tabular-nums"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-[#163E4B] dark:text-[#E5F0F3] block mb-0.5">
                        Waktu / Jam Acara
                      </label>
                      <input
                        type="text"
                        placeholder="07:30 - 09:00 WITA"
                        value={eventTime}
                        onChange={(e) => setEventTime(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs rounded-xl border border-[#DCE3E6] dark:border-[#275668] bg-white dark:bg-[#13313C] text-[#163E4B] dark:text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-[#163E4B] dark:text-[#E5F0F3] block mb-0.5">
                      Lokasi / Tempat Acara
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Aula Utama Madrasah"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-xl border border-[#DCE3E6] dark:border-[#275668] bg-white dark:bg-[#13313C] text-[#163E4B] dark:text-white"
                    />
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-[#F0F0EC] dark:border-[#214B59] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-bold rounded-full text-[#6E828A] hover:bg-[#F7F7F5] dark:hover:bg-[#1B4250] cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-full bg-[#F4A950] hover:bg-[#E59638] text-white shadow-[0_6px_18px_rgba(244,169,80,0.35)] cursor-pointer"
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
