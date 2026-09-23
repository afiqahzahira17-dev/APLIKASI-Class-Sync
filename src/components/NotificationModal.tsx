import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Bell,
  Clock,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Megaphone,
  BookOpen,
  Sparkles,
  CheckCheck,
  MapPin,
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
        return <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case 'assignment_reminder':
        return <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
      case 'new_assignment':
        return <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />;
      case 'grade_posted':
        return <CheckCircle2 className="w-4 h-4 text-sky-600 dark:text-sky-400" />;
      default:
        return <Megaphone className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
    }
  };

  const formatTimestamp = (ts: string) => {
    try {
      const d = new Date(ts);
      return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
    } catch {
      return ts;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-slate-200 dark:border-slate-700 max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Pusat Notifikasi
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {unreadCount > 0 ? `${unreadCount} belum dibaca` : 'Semua sudah dibaca'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllNotificationsAsRead}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 flex items-center gap-1 p-1"
                title="Tandai semua dibaca"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Tandai Dibaca</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1"
            >
              ✕
            </button>
          </div>
        </div>

        {/* PRD 3.5 Simulator Push Notifications testing bar */}
        <div className="p-3 my-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/80 shrink-0">
          <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            Uji Sistem Notifikasi Otomatis (PRD 3.5):
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            <button
              onClick={() => triggerSimulatedNotification('class_reminder')}
              className="px-2 py-1.5 text-[11px] font-medium rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 truncate text-left"
            >
              🔔 Pengingat Kelas 15m
            </button>
            <button
              onClick={() => triggerSimulatedNotification('assignment_reminder')}
              className="px-2 py-1.5 text-[11px] font-medium rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800 truncate text-left"
            >
              ⏰ Pengingat Tugas 2 Jam
            </button>
            <button
              onClick={() => triggerSimulatedNotification('new_announcement')}
              className="px-2 py-1.5 text-[11px] font-medium rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 truncate text-left col-span-2 sm:col-span-1"
            >
              📢 Broadcast Guru
            </button>
          </div>
        </div>

        {/* Notifications Scroll List */}
        <div className="overflow-y-auto space-y-2 flex-1 pr-1">
          {notifications.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              Belum ada notifikasi baru.
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => markNotificationAsRead(notif.id)}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  notif.isRead
                    ? 'border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 opacity-80'
                    : 'border-indigo-100 dark:border-indigo-900/60 bg-indigo-50/40 dark:bg-indigo-950/30 text-slate-900 dark:text-slate-100 shadow-xs'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <div className="p-1.5 rounded-lg bg-white dark:bg-slate-700 shadow-xs shrink-0 mt-0.5">
                    {getNotifIcon(notif.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="text-xs font-bold truncate">{notif.title}</h4>
                      <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                        {formatTimestamp(notif.timestamp)}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                      {notif.message}
                    </p>

                    {/* Room location or due details */}
                    {notif.roomLocation && (
                      <div className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/70 px-2 py-0.5 rounded-md">
                        <MapPin className="w-3 h-3" />
                        <span>Lokasi: {notif.roomLocation}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="pt-3 border-t border-slate-100 dark:border-slate-700 mt-2 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
