import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { apiRequest, getWorkingApiBaseUrl } from '../services/api';
import { SafeStorage } from '../services/storage';
import { useAuth } from './AuthContext';
import { playExecutiveNotificationSound } from '../utils/sound';

export interface AppNotification {
  id: string;
  userId: string;
  actorId?: string;
  actorName?: string;
  type:
    | 'CONNECTION_REQUEST'
    | 'CONNECTION_ACCEPTED'
    | 'INTRO_REQUEST'
    | 'INTRO_ACCEPTED'
    | 'COMPANY_INVITE'
    | 'SYSTEM_ALERT'
    | 'MEETING_INVITE'
    | 'MESSAGE_NEW'
    | string;
  title: string;
  body: string;
  actionUrl?: string;
  metadata?: string | Record<string, any>;
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
  loading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  showToast: (toast: { title?: string; message?: string; type?: ToastItem['type']; actionUrl?: string }) => void;
  dismissToast: () => void;
}

const NotificationContext = createContext<NotificationContextType>({} as NotificationContextType);

// Initial mock notifications (marked read so they never trigger toasts on launch)
const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-initial-1',
    userId: 'current-user',
    type: 'MEETING_INVITE',
    title: 'Google Meet Synchronization Dispatched',
    body: 'Commercial Partnership Synchronization invite confirmed and synchronized to your calendar.',
    read: true,
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    actionUrl: '/app/messages',
  },
  {
    id: 'notif-initial-2',
    userId: 'current-user',
    type: 'CONNECTION_ACCEPTED',
    title: 'Verified Connection Established',
    body: 'Rajiv Mehra confirmed your direct bilateral communication corridor.',
    read: true,
    createdAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    actionUrl: '/app/connections',
  },
  {
    id: 'notif-initial-3',
    userId: 'current-user',
    type: 'SYSTEM_ALERT',
    title: 'Executive Firewall Active',
    body: 'Zero cold outreach and spam filtering actively protecting your executive inbox.',
    read: true,
    createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    actionUrl: '/app/dashboard',
  },
];

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const insets = useSafeAreaInsets();
  const { user, token, isAuthenticated } = useAuth();

  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [activeToast, setActiveToast] = useState<ToastItem | null>(null);

  const isInitialLoadRef = useRef(true);
  const seenIdsRef = useRef<Set<string>>(new Set(INITIAL_NOTIFICATIONS.map((n) => n.id)));
  const translateY = useRef(new Animated.Value(-120)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const dismissTimerRef = useRef<any>(null);

  // Load persisted seen notifications from storage on mount
  useEffect(() => {
    SafeStorage.getItem('@meshvi_seen_notifications').then((raw) => {
      if (raw) {
        try {
          const ids: string[] = JSON.parse(raw);
          ids.forEach((id) => seenIdsRef.current.add(id));
        } catch {}
      }
    });
  }, []);

  const saveSeenIds = useCallback((newId?: string) => {
    if (newId) {
      seenIdsRef.current.add(newId);
    }
    const arr = Array.from(seenIdsRef.current).slice(-200); // keep last 200 seen IDs
    SafeStorage.setItem('@meshvi_seen_notifications', JSON.stringify(arr)).catch(() => {});
  }, []);

  const dismissToast = useCallback(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -120,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setActiveToast(null);
    });
  }, [translateY, opacity]);

  const showToast = useCallback(
    (toastInput: { title?: string; message?: string; type?: ToastItem['type']; actionUrl?: string }) => {
      const title =
        (toastInput.title && toastInput.title.trim()) ||
        'MESHVI Notification';
      const message =
        (toastInput.message && toastInput.message.trim()) ||
        'New executive alert received.';

      if (dismissTimerRef.current) {
        clearTimeout(dismissTimerRef.current);
      }

      // Play premium executive notification chime
      playExecutiveNotificationSound().catch(() => {});

      const newToast: ToastItem = {
        id: `toast-${Date.now()}`,
        title,
        message,
        type: toastInput.type || 'info',
        actionUrl: toastInput.actionUrl,
      };

      setActiveToast(newToast);

      // Slide in
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 70,
          friction: 9,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto dismiss after 4.5s
      dismissTimerRef.current = setTimeout(() => {
        dismissToast();
      }, 4500);
    },
    [dismissToast, translateY, opacity]
  );

  // Fetch notifications from server
  const fetchNotifications = useCallback(async () => {
    if (!token && !isAuthenticated) return;
    try {
      setLoading(true);
      const res = await apiRequest<{ notifications: AppNotification[]; unreadCount: number }>('/notifications', {
        method: 'GET',
        token,
      });

      if (res.success && res.data) {
        const serverList = res.data.notifications || [];
        const serverUnread = typeof res.data.unreadCount === 'number' ? res.data.unreadCount : 0;

        if (isInitialLoadRef.current) {
          // Initial load: populate seen IDs so existing unread notifications do NOT trigger old toasts on refresh
          serverList.forEach((notif) => {
            seenIdsRef.current.add(notif.id);
          });
          saveSeenIds();
          isInitialLoadRef.current = false;
        } else {
          // Subsequent poll: only fire toast for genuine newly arrived notifications
          serverList.forEach((notif) => {
            if (!seenIdsRef.current.has(notif.id)) {
              seenIdsRef.current.add(notif.id);
              saveSeenIds(notif.id);

              if (!notif.read) {
                showToast({
                  title: notif.title || 'Executive Corridor Notification',
                  message: notif.body || 'New message or partnership proposal received.',
                  type: notif.type?.includes('MEET') ? 'opportunity' : 'info',
                  actionUrl: notif.actionUrl,
                });
              }
            }
          });
        }

        setNotifications((prev) => {
          const map = new Map<string, AppNotification>();
          serverList.forEach((n) => map.set(n.id, n));
          prev.forEach((n) => {
            if (!map.has(n.id)) map.set(n.id, n);
          });
          return Array.from(map.values()).sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        });

        setUnreadCount(serverUnread);
      }
    } catch {
      // Graceful fallback
    } finally {
      setLoading(false);
    }
  }, [token, isAuthenticated, showToast, saveSeenIds]);

  // Mark single as read
  const markAsRead = useCallback(
    async (id: string) => {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));

      if (token) {
        await apiRequest(`/notifications/${id}/read`, {
          method: 'PATCH',
          token,
        }).catch(() => {});
      }
    },
    [token]
  );

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);

    if (token) {
      await apiRequest('/notifications/mark-all-read', {
        method: 'POST',
        token,
      }).catch(() => {});
    }
  }, [token]);

  // Active polling & SSE connection
  useEffect(() => {
    fetchNotifications();

    const interval = setInterval(() => {
      fetchNotifications();
    }, 6000);

    // EventSource real-time stream
    let es: any = null;
    if (typeof EventSource !== 'undefined' && token) {
      getWorkingApiBaseUrl().then((baseUrl) => {
        try {
          es = new EventSource(`${baseUrl}/notifications/stream`);
          es.onmessage = (event: any) => {
            try {
              const parsed = JSON.parse(event.data);
              const data = parsed.data || parsed;
              if (data && data.type !== 'HEARTBEAT' && data.id) {
                if (!seenIdsRef.current.has(data.id)) {
                  seenIdsRef.current.add(data.id);
                  saveSeenIds(data.id);
                  setNotifications((prev) => [data, ...prev.filter((n) => n.id !== data.id)]);
                  setUnreadCount((c) => c + 1);
                  showToast({
                    title: data.title || 'New Live Notification',
                    message: data.body || 'A new transaction accord or message has arrived.',
                    type: data.type?.includes('MEET') ? 'opportunity' : 'info',
                    actionUrl: data.actionUrl,
                  });
                }
              }
            } catch {
              // Ignore non-json heartbeats
            }
          };
        } catch {
          // SSE not supported in current environment
        }
      });
    }

    return () => {
      clearInterval(interval);
      if (es) {
        es.close();
      }
      if (dismissTimerRef.current) {
        clearTimeout(dismissTimerRef.current);
      }
    };
  }, [fetchNotifications, token, saveSeenIds, showToast]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        showToast,
        dismissToast,
      }}
    >
      {children}

      {/* Floating Real-Time In-App Toast Banner */}
      {activeToast && (
        <Animated.View
          style={[
            styles.toastContainer,
            {
              top: Math.max(insets.top + 6, 16),
              transform: [{ translateY }],
              opacity,
            },
          ]}
        >
          <View style={styles.toastCard}>
            <View style={styles.toastIconBox}>
              <MaterialCommunityIcons
                name={
                  activeToast.type === 'opportunity'
                    ? 'video-check-outline'
                    : activeToast.type === 'success'
                    ? 'check-decagram'
                    : 'bell-ring-outline'
                }
                size={18}
                color="#38BDF8"
              />
            </View>

            <View style={styles.toastContent}>
              <View style={styles.toastHeaderRow}>
                <Text style={styles.toastPlatformBadge}>MESHVI REAL-TIME ALERT</Text>
                <Text style={styles.toastTimeText}>Now</Text>
              </View>
              <Text style={styles.toastTitle} numberOfLines={1}>
                {activeToast.title}
              </Text>
              <Text style={styles.toastMessage} numberOfLines={2}>
                {activeToast.message}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.toastCloseBtn}
              onPress={dismissToast}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Feather name="x" size={14} color="#94A3B8" />
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}
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

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    left: 14,
    right: 14,
    zIndex: 99999,
    elevation: 20,
    ...Platform.select({
      web: {
        maxWidth: 420,
        alignSelf: 'center',
        marginHorizontal: 'auto',
      },
    }),
  },
  toastCard: {
    backgroundColor: '#0F172A',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#334155',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
  },
  toastIconBox: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 2,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
  },
  toastContent: {
    flex: 1,
    paddingRight: 6,
  },
  toastHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  toastPlatformBadge: {
    fontSize: 9,
    fontWeight: '800',
    color: '#38BDF8',
    letterSpacing: 0.6,
  },
  toastTimeText: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '500',
  },
  toastTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 2,
  },
  toastMessage: {
    fontSize: 11,
    lineHeight: 16,
    color: '#CBD5E1',
    fontWeight: '400',
  },
  toastCloseBtn: {
    padding: 4,
    marginLeft: 4,
  },
});
