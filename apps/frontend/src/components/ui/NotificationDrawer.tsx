import React from 'react';
import { useNotifications, AppNotification } from '../../context/NotificationContext';
import { Drawer } from './Drawer';
import {
  Bell,
  Sparkles,
  Users,
  Building2,
  ArrowRight,
  Compass,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const NotificationDrawer: React.FC = () => {
  const {
    notifications,
    unreadCount,
    drawerOpen,
    setDrawerOpen,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  const getIconForType = (type: AppNotification['type'], title: string = '') => {
    if (title.includes('Weekly') || title.includes('Recommendations')) {
      return <Compass className="w-4 h-4 text-[#078BCC]" />;
    }
    switch (type) {
      case 'CONNECTION_REQUEST':
        return <Users className="w-4 h-4 text-primary" />;
      case 'INTRO_REQUEST':
      case 'INTRO_ACCEPTED':
        return <Sparkles className="w-4 h-4 text-purple-600" />;
      case 'COMPANY_INVITE':
        return <Building2 className="w-4 h-4 text-indigo-600" />;
      default:
        return <Bell className="w-4 h-4 text-amber-500" />;
    }
  };

  return (
    <Drawer
      isOpen={drawerOpen}
      onClose={() => setDrawerOpen(false)}
      title="Notification Hub"
      subtitle={`${unreadCount} unread business alert${unreadCount === 1 ? '' : 's'}`}
      width="md"
      footer={
        <div className="flex justify-between items-center w-full">
          <button
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            className="text-xs font-semibold text-primary hover:underline disabled:opacity-40"
          >
            Mark all as read
          </button>
          <span className="text-[10px] text-text-muted">Synced in Real-Time</span>
        </div>
      }
    >
      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-surface-muted text-text-muted flex items-center justify-center mx-auto">
              <Bell className="w-5 h-5" />
            </div>
            <div className="text-xs font-bold text-navy">All Caught Up</div>
            <p className="text-[11px] text-text-muted max-w-xs mx-auto">
              No new connection requests or business introductions at this moment.
            </p>
          </div>
        ) : (
          notifications.map((n) => {
            const isWeekly = n.title?.includes('Weekly') || n.title?.includes('Recommendations');
            return (
              <div
                key={n.id}
                onClick={() => {
                  if (!n.read) markAsRead(n.id);
                }}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-2 ${
                  isWeekly
                    ? n.read
                      ? 'bg-blue-50/40 border-blue-200/60'
                      : 'bg-gradient-to-r from-sky-50/90 via-white to-blue-50/70 border-sky-300 shadow-xs'
                    : n.read
                    ? 'bg-surface border-border opacity-75'
                    : 'bg-primary-soft/30 border-primary/20 shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 ${
                        isWeekly ? 'bg-sky-100/70 border-sky-300' : 'bg-surface border-border'
                      }`}
                    >
                      {getIconForType(n.type, n.title)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="text-xs font-bold text-navy block leading-tight">
                          {n.title}
                        </span>
                        {isWeekly && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-sky-100 text-[#078BCC] border border-sky-200 shrink-0">
                            Weekly Match
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-text-muted">
                        {new Date(n.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })} ·{' '}
                        {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  {!n.read && (
                    <span className="w-2 h-2 rounded-full bg-[#078BCC] shrink-0 mt-1" />
                  )}
                </div>

                <p className="text-xs text-text leading-relaxed">{n.body}</p>

                {n.actionUrl && (
                  <div className="pt-1 flex justify-end">
                    <Link
                      to={
                        (window.location.pathname.startsWith('/company') || n.actionUrl.includes('company')) &&
                        (n.type === 'CONNECTION_REQUEST' || n.type === 'INTRO_REQUEST' || n.actionUrl === '/app/requests')
                          ? (n.type === 'INTRO_REQUEST' ? '/company/pipeline' : '/company/connections')
                          : n.actionUrl
                      }
                      onClick={() => {
                        markAsRead(n.id);
                        setDrawerOpen(false);
                      }}
                      className={`inline-flex items-center space-x-1 text-[11px] font-bold ${
                        isWeekly ? 'text-[#078BCC] hover:underline' : 'text-primary hover:underline'
                      }`}
                    >
                      <span>{isWeekly ? 'Explore Matches' : 'View Details'}</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </Drawer>
  );
};
