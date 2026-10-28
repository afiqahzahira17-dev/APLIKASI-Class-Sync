import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Bell,
  Clock,
  CheckCircle2,
  AlertCircle,
  Megaphone,
  BookOpen,
  Sparkles,
  CheckCheck,
  MapPin,
  X,
} from 'lucide-react';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({ isOpen, onClose }) => {
  const {
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    triggerSimulatedNotification,
  } = useApp();

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'class_reminder':
        return <Clock className="w-4 h-4 text-[#163E4B] dark:text-[#F4A950]" />;
      case 'assignment_reminder':
        return <AlertCircle className="w-4 h-4 text-[#E59638]" />;
      case 'new_assignment':
        return <BookOpen className="w-4 h-4 text-[#163E4B] dark:text-[#9BBAC4]" />;
      case 'grade_posted':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      default:
        return <Megaphone className="w-4 h-4 text-[#C87A24] dark:text-[#F4A950]" />;
    }
  };

  const formatTimestamp = (ts: string) => {
    try {
      const d = new Date(ts);
      return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WITA';
    } catch {
      return ts;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B1E25]/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-[#132F3A] rounded-[28px] max-w-lg w-full p-5 shadow-[0_20px_50px_rgba(22,62,75,0.2)] border border-[#E8ECEE] dark:border-[#214B59] max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-[#E8ECEE] dark:border-[#214B59] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="relative w-10 h-10 rounded-2xl bg-[#163E4B] text-white flex items-center justify-center">
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#F4A950] ring-2 ring-white dark:ring-[#132F3A]" />
              )}
            </div>
            <div>
              <h3 className="font-extrabold text-[#163E4B] dark:text-white text-base">
                Pusat Notifikasi
              </h3>
              <p className="text-[11px] text-[#6E828A] dark:text-[#96B2BC]">
                {unreadCount > 0 ? `${unreadCount} belum dibaca` : 'Semua sudah dibaca'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllNotificationsAsRead}
                className="text-xs font-bold text-[#163E4B] hover:text-[#E59638] dark:text-[#F4A950] flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FCEADE] dark:bg-[#F4A950]/15 transition-colors cursor-pointer"
                title="Tandai semua dibaca"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Tandai Dibaca</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="text-[#8A9BA2] hover:text-[#163E4B] dark:hover:text-white p-1.5 rounded-full hover:bg-[#F7F7F5] dark:hover:bg-[#193B48] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Simulator Push Notifications testing bar */}
        <div className="p-3.5 my-3 rounded-[22px] bg-[#F7F7F5] dark:bg-[#0E242D] border border-[#E8ECEE] dark:border-[#214B59] shrink-0">
          <p className="text-[11px] font-bold text-[#163E4B] dark:text-[#E2EEF2] uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#E59638]" />
            Uji Sistem Pengingat Otomatis:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            <button
              onClick={() => triggerSimulatedNotification('class_reminder')}
              className="px-2.5 py-1.5 text-[11px] font-bold rounded-full bg-white hover:bg-[#FCEADE] text-[#163E4B] dark:bg-[#132F3A] dark:hover:bg-[#193B48] dark:text-white border border-[#E8ECEE] dark:border-[#214B59] truncate text-center transition-colors cursor-pointer"
            >
              Pengingat Kelas 15m
            </button>
            <button
              onClick={() => triggerSimulatedNotification('assignment_reminder')}
              className="px-2.5 py-1.5 text-[11px] font-bold rounded-full bg-[#FCEADE] hover:bg-[#F7DEC9] text-[#8A4F14] dark:bg-[#F4A950]/15 dark:text-[#F4A950] border border-[#F4D3BA] dark:border-[#F4A950]/30 truncate text-center transition-colors cursor-pointer"
            >
              Pengingat Tugas 2j
            </button>
            <button
              onClick={() => triggerSimulatedNotification('new_announcement')}
              className="px-2.5 py-1.5 text-[11px] font-bold rounded-full bg-[#163E4B] hover:bg-[#1D4E5E] text-white truncate text-center col-span-2 sm:col-span-1 transition-colors cursor-pointer"
            >
              Broadcast Guru
            </button>
          </div>
        </div>

        {/* Notifications Scroll List */}
        <div className="overflow-y-auto space-y-2.5 flex-1 pr-1">
          {notifications.length === 0 ? (
            <div className="py-12 text-center text-[#8A9BA2] text-xs">
              Belum ada notifikasi baru.
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => markNotificationAsRead(notif.id)}
                className={`p-3.5 rounded-[22px] border transition-all cursor-pointer ${
                  notif.isRead
                    ? 'border-[#E8ECEE] dark:border-[#214B59] bg-white dark:bg-[#132F3A]/60 text-[#6E828A] dark:text-[#96B2BC] opacity-85'
                    : 'border-[#F4D3BA] dark:border-[#F4A950]/35 bg-[#FCEADE]/65 dark:bg-[#F4A950]/10 text-[#163E4B] dark:text-white shadow-[0_6px_18px_rgba(22,62,75,0.05)]'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <div className="p-2 rounded-xl bg-white dark:bg-[#193B48] border border-[#E8ECEE] dark:border-[#214B59] shrink-0 mt-0.5">
                    {getNotifIcon(notif.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="text-xs font-extrabold truncate text-[#163E4B] dark:text-white">
                        {notif.title}
                      </h4>
                      <span className="text-[10px] text-[#7A8E96] shrink-0 font-mono tabular-nums">
                        {formatTimestamp(notif.timestamp)}
                      </span>
                    </div>

                    <p className="text-xs text-[#4B636D] dark:text-[#C5DBE2] mt-1 leading-relaxed">
                      {notif.message}
                    </p>

                    {/* Room location or due details */}
                    {notif.roomLocation && (
                      <div className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-[#163E4B] dark:text-[#F4A950] bg-white dark:bg-[#193B48] border border-[#E8ECEE] dark:border-[#214B59] px-2.5 py-0.5 rounded-full">
                        <MapPin className="w-3 h-3 text-[#E59638]" />
                        <span>Lokasi: {notif.roomLocation}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="pt-3 border-t border-[#E8ECEE] dark:border-[#214B59] mt-2 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-extrabold rounded-full bg-[#F4A950] hover:bg-[#E59638] text-[#163E4B] transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
