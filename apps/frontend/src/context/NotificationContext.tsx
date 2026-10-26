import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import {
  Sparkles,
  X,
  ArrowRight,
} from 'lucide-react';
import { playExecutiveNotificationSound } from '../utils/sound';

export interface AppNotification {
  id: string;
  userId: string;
  actorId?: string;
  actorName?: string;
  type: 'CONNECTION_REQUEST' | 'CONNECTION_ACCEPTED' | 'INTRO_REQUEST' | 'INTRO_ACCEPTED' | 'COMPANY_INVITE' | 'SYSTEM_ALERT';
  title: string;
  body: string;
  actionUrl?: string;
  metadata?: string;
  read: boolean;
  createdAt: string;
}

export interface ToastItem {
  id: string;
  title: string;
  message: string;
  type?: 'success' | 'info' | 'warning' | 'opportunity' | 'error';
  actionUrl?: string;
}

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  showToast: (toast: Omit<ToastItem, 'id'>) => void;
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const isInitialLoadRef = useRef(true);
  const seenIdsRef = useRef<Set<string>>(new Set());

  // Load seen notifications from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem('setu_seen_notifications');
      if (raw) {
        const ids: string[] = JSON.parse(raw);
        ids.forEach((id) => seenIdsRef.current.add(id));
      }
    } catch {}
  }, []);

  const saveSeenIds = useCallback((newId?: string) => {
    if (newId) {
      seenIdsRef.current.add(newId);
    }
    try {
      const arr = Array.from(seenIdsRef.current).slice(-200);
      localStorage.setItem('setu_seen_notifications', JSON.stringify(arr));
    } catch {}
  }, []);

  const showToast = useCallback((toast: any) => {
    if (!toast) return;
    const title = toast.title || toast.subject || (toast.type === 'error' ? 'Notice' : 'MESHVI Alert');
    const message = toast.message || toast.body || toast.text || toast.description || '';
    if (!title && !message) return; // Prevent empty blank toasts

    // Play executive chime sound
    playExecutiveNotificationSound();

    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [
      ...prev,
      {
        id,
        title,
        message,
        type: toast.type || 'opportunity',
        actionUrl: toast.actionUrl,
      },
    ]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 6000);
  }, []);

  const fetchNotifications = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/v1/notifications', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        return;
      }
      const data = await res.json().catch(() => null);
      if (res.ok && data?.success) {
        const fetchedList: AppNotification[] = data.data.notifications || [];
        const count: number = data.data.unreadCount || 0;

        if (isInitialLoadRef.current) {
          // On initial fetch/refresh, mark all existing notifications as seen so old toasts never replay
          fetchedList.forEach((notif) => {
            seenIdsRef.current.add(notif.id);
          });
          saveSeenIds();
          isInitialLoadRef.current = false;
        } else {
          // Subsequent background poll: only trigger toast for newly arrived unread notifications
          fetchedList.forEach((notif) => {
            if (!seenIdsRef.current.has(notif.id)) {
              seenIdsRef.current.add(notif.id);
              saveSeenIds(notif.id);

              if (!notif.read) {
                showToast({
                  title: notif.title,
                  message: notif.body,
                  type: 'opportunity',
                  actionUrl: notif.actionUrl,
                });
              }
            }
          });
        }

        setNotifications(fetchedList);
        setUnreadCount(count);
      }
    } catch {
      // Background poll fail silent
    }
  }, [token, showToast, saveSeenIds]);

  const markAsRead = async (id: string) => {
    if (!token) return;
    try {
      await fetch(`/api/v1/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // Non-fatal
    }
  };

  const markAllAsRead = async () => {
    if (!token) return;
    try {
      await fetch('/api/v1/notifications/mark-all-read', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {
      // Non-fatal
    }
  };

  // Real-time reactive SSE stream + polling fallback
  useEffect(() => {
    if (!token || !user) return;
    fetchNotifications();

    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource(`/api/v1/notifications/stream?token=${encodeURIComponent(token)}`);
      eventSource.onmessage = (event) => {
        try {
          const raw = JSON.parse(event.data);
          if (raw.type === 'HEARTBEAT') return;
          const newNotif = (raw.data && typeof raw.data === 'object') ? raw.data : raw;
          const notifItem: AppNotification = {
            id: newNotif.id || `notif-${Date.now()}`,
            userId: newNotif.userId || user.id,
            actorId: newNotif.actorId,
            actorName: newNotif.actorName,
            type: newNotif.type || 'SYSTEM_ALERT',
            title: newNotif.title || 'Notification',
            body: newNotif.body || newNotif.message || '',
            actionUrl: newNotif.actionUrl,
            read: false,
            createdAt: newNotif.createdAt || new Date().toISOString(),
          };

          if (!seenIdsRef.current.has(notifItem.id)) {
            seenIdsRef.current.add(notifItem.id);
            saveSeenIds(notifItem.id);

            setNotifications((prev) => [notifItem, ...prev.filter((n) => n.id !== notifItem.id)]);
            setUnreadCount((prev) => prev + 1);
            showToast({
              title: notifItem.title,
              message: notifItem.body,
              type: 'opportunity',
              actionUrl: notifItem.actionUrl,
            });
          }
        } catch {
          // JSON parse fallback
        }
      };
      eventSource.onerror = () => {
        // EventSource auto retry
      };
    } catch {
      // Non-fatal
    }

    const interval = setInterval(() => {
      fetchNotifications();
    }, 8000);

    return () => {
      clearInterval(interval);
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [token, user, fetchNotifications, saveSeenIds, showToast]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        showToast,
        drawerOpen,
        setDrawerOpen,
      }}
    >
      {children}

      {/* Floating Modern Toast Stack */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none max-w-sm w-full">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-2xl transition-all duration-300 animate-in slide-in-from-bottom-5 bg-[#0F172A] border border-slate-700/80 text-white"
          >
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 shrink-0 mt-0.5 border border-sky-500/20">
              <Sparkles className="w-4 h-4" />
            </div>

            <div className="flex-1 min-w-0 pr-1">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-sky-400">
                  REAL-TIME ACCORD
                </span>
              </div>
              <h4 className="text-sm font-semibold text-white leading-snug truncate">
                {toast.title}
              </h4>
              <p className="text-xs text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                {toast.message}
              </p>
              {toast.actionUrl && (
                <a
                  href={toast.actionUrl}
                  className="inline-flex items-center gap-1 text-xs text-sky-400 hover:text-sky-300 font-medium mt-2 group"
                >
                  Review Update <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </a>
              )}
            </div>

            <button
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className="text-slate-400 hover:text-white p-1 rounded-md transition-colors shrink-0"
              aria-label="Dismiss toast"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
