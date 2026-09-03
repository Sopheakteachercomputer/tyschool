import React, { useEffect, useState } from 'react';
import { NotificationItem } from '../types';
import { 
  Bell, 
  X, 
  ArrowRight, 
  Flame, 
  AlertTriangle, 
  CheckCircle2, 
  Info,
  Volume2,
  VolumeX
} from 'lucide-react';
import { playNotificationChime } from '../utils/notificationSound';

export interface ToastNotificationProps {
  notification: NotificationItem | null;
  onDismiss: () => void;
  onViewNotification: (notif: NotificationItem) => void;
  enableSound?: boolean;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({
  notification,
  onDismiss,
  onViewNotification,
  enableSound = true
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (notification) {
      setVisible(true);
      if (enableSound) {
        playNotificationChime(notification.type);
      }

      // Auto dismiss after 6 seconds
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onDismiss, 300);
      }, 6000);

      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [notification, enableSound, onDismiss]);

  if (!notification || !visible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[99999] max-w-md w-full sm:w-96 animate-in slide-in-from-bottom-5 fade-in duration-200 pointer-events-auto">
      <div 
        onClick={() => {
          onViewNotification(notification);
          onDismiss();
        }}
        className="bg-slate-900/98 backdrop-blur-2xl border-2 border-indigo-500/60 rounded-3xl p-4 shadow-2xl shadow-indigo-950/90 hover:border-indigo-400 cursor-pointer transition-all duration-150 group relative overflow-hidden ring-4 ring-indigo-500/20"
      >
        {/* Subtle top indicator bar */}
        <div className={`absolute top-0 left-0 right-0 h-1 ${
          notification.type === 'URGENT' ? 'bg-rose-500' :
          notification.type === 'WARNING' ? 'bg-amber-500' :
          notification.type === 'SUCCESS' ? 'bg-emerald-500' : 'bg-indigo-500'
        }`} />

        <div className="flex items-start space-x-3">
          {/* Avatar or Icon */}
          <div className="shrink-0 mt-0.5">
            {notification.senderAvatar ? (
              <img
                src={notification.senderAvatar}
                alt={notification.senderName || 'Sender'}
                className="w-10 h-10 rounded-2xl object-cover border border-white/20 shadow-md"
              />
            ) : (
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border shadow-md ${
                notification.type === 'URGENT' ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' :
                notification.type === 'WARNING' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                notification.type === 'SUCCESS' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
              }`}>
                {notification.type === 'URGENT' ? <Flame className="w-5 h-5" /> :
                 notification.type === 'WARNING' ? <AlertTriangle className="w-5 h-5" /> :
                 notification.type === 'SUCCESS' ? <CheckCircle2 className="w-5 h-5" /> :
                 <Bell className="w-5 h-5" />}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 pr-6">
            <div className="flex items-center justify-between gap-1">
              <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider font-mono">
                {notification.senderName ? `ពី៖ ${notification.senderName}` : 'ការជូនដំណឹងថ្មី'}
              </span>
              <span className="text-[9px] text-slate-400">{notification.timestamp || 'ឥឡូវនេះ'}</span>
            </div>

            <h4 className="text-xs font-bold text-white font-battambang mt-0.5 line-clamp-1 group-hover:text-indigo-200 transition">
              {notification.title}
            </h4>

            <p className="text-[11px] text-slate-300 font-battambang mt-1 line-clamp-2 leading-snug">
              {notification.message}
            </p>

            <div className="mt-2 flex items-center space-x-1.5 text-[10px] font-bold text-indigo-400 group-hover:text-indigo-300">
              <span>ចុចដើម្បីមើលលម្អិត</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDismiss();
          }}
          className="absolute top-3 right-3 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
          title="បិទ"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
