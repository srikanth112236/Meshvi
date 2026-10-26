import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNotifications, AppNotification } from '../../context/NotificationContext';
import { MeshviColors } from '../../theme/colors';

interface NotificationsScreenProps {
  onBack: () => void;
  onNavigateTab: (tab: string, initialQuery?: string, partner?: any) => void;
  onNavigateToMessages?: (partner: any) => void;
}

export const NotificationsScreen: React.FC<NotificationsScreenProps> = ({
  onBack,
  onNavigateTab,
  onNavigateToMessages,
}) => {
  const insets = useSafeAreaInsets();
  const {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  const [activeFilter, setActiveFilter] = useState<'ALL' | 'UNREAD'>('ALL');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  };

  const filteredList = notifications.filter((item) => {
    if (activeFilter === 'UNREAD') {
      return !item.read;
    }
    return true;
  });

  const formatRelativeTime = (isoString?: string) => {
    if (!isoString) return 'Recent';
    try {
      const diffMs = Date.now() - new Date(isoString).getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}d ago`;
    } catch {
      return 'Recent';
    }
  };

  const handleNotificationPress = (item: AppNotification) => {
    if (!item.read) {
      markAsRead(item.id);
    }

    if (item.actionUrl?.includes('messages') || item.type?.includes('MEET') || item.type?.includes('MESSAGE')) {
      onNavigateTab('messages');
    } else if (item.actionUrl?.includes('connections') || item.type?.includes('CONNECTION')) {
      onNavigateTab('connections');
    } else if (item.actionUrl?.includes('introductions') || item.type?.includes('INTRO')) {
      onNavigateTab('introductions');
    } else if (item.actionUrl?.includes('dealrooms')) {
      onNavigateTab('dealrooms');
    } else {
      onNavigateTab('dashboard');
    }
  };

  const getNotificationIcon = (type?: string) => {
    switch (type) {
      case 'MEETING_INVITE':
        return { name: 'video', color: '#0284C7', bg: 'rgba(2, 132, 199, 0.1)' };
      case 'CONNECTION_REQUEST':
      case 'CONNECTION_ACCEPTED':
        return { name: 'users', color: '#10B981', bg: 'rgba(16, 185, 129, 0.1)' };
      case 'INTRO_REQUEST':
      case 'INTRO_ACCEPTED':
        return { name: 'share-2', color: '#6366F1', bg: 'rgba(99, 102, 241, 0.1)' };
      case 'SYSTEM_ALERT':
        return { name: 'shield-check', color: '#D97706', bg: 'rgba(217, 119, 6, 0.1)' };
      default:
        return { name: 'bell', color: '#475569', bg: 'rgba(71, 85, 105, 0.1)' };
    }
  };

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 12) }]}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBack}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Feather name="arrow-left" size={20} color={MeshviColors.textPrimary} />
          </TouchableOpacity>
          <View>
            <View style={styles.titleRow}>
              <Text style={styles.headerTitle}>Notifications</Text>
              {unreadCount > 0 && (
                <View style={styles.unreadCountBadge}>
                  <Text style={styles.unreadCountBadgeText}>{unreadCount} New</Text>
                </View>
              )}
            </View>
            <Text style={styles.headerSubtitle}>Real-time executive corridor activity</Text>
          </View>
        </View>

        {unreadCount > 0 && (
          <TouchableOpacity
            style={styles.markAllReadBtn}
            onPress={markAllAsRead}
            activeOpacity={0.75}
          >
            <Feather name="check" size={13} color="#0369A1" style={{ marginRight: 4 }} />
            <Text style={styles.markAllReadText}>Mark read</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterTabsRow}>
        <TouchableOpacity
          style={[styles.filterTab, activeFilter === 'ALL' && styles.filterTabActive]}
          onPress={() => setActiveFilter('ALL')}
          activeOpacity={0.8}
        >
          <Text
            style={[styles.filterTabText, activeFilter === 'ALL' && styles.filterTabTextActive]}
          >
            All ({notifications.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterTab, activeFilter === 'UNREAD' && styles.filterTabActive]}
          onPress={() => setActiveFilter('UNREAD')}
          activeOpacity={0.8}
        >
          <Text
            style={[styles.filterTabText, activeFilter === 'UNREAD' && styles.filterTabTextActive]}
          >
            Unread ({unreadCount})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Notifications List */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing || loading}
            onRefresh={onRefresh}
            tintColor={MeshviColors.primary}
          />
        }
      >
        {filteredList.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconBox}>
              <Feather name="bell-off" size={28} color="#94A3B8" />
            </View>
            <Text style={styles.emptyTitle}>
              {activeFilter === 'UNREAD' ? 'No Unread Notifications' : 'No Notifications'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {activeFilter === 'UNREAD'
                ? 'You are completely caught up on all executive briefings and invites.'
                : 'Incoming corridor activity, bilateral accord updates, and meetings will appear here.'}
            </Text>
          </View>
        ) : (
          filteredList.map((item) => {
            const iconConfig = getNotificationIcon(item.type);
            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.notificationCard, !item.read && styles.notificationCardUnread]}
                onPress={() => handleNotificationPress(item)}
                activeOpacity={0.8}
              >
                {/* Left Type Icon */}
                <View style={[styles.itemIconBox, { backgroundColor: iconConfig.bg }]}>
                  <Feather name={iconConfig.name as any} size={16} color={iconConfig.color} />
                </View>

                {/* Content */}
                <View style={styles.itemContent}>
                  <View style={styles.itemHeaderRow}>
                    <Text
                      style={[styles.itemTitle, !item.read && styles.itemTitleUnread]}
                      numberOfLines={1}
                    >
                      {item.title}
                    </Text>
                    <Text style={styles.itemTime}>{formatRelativeTime(item.createdAt)}</Text>
                  </View>

                  <Text style={styles.itemBody} numberOfLines={2}>
                    {item.body}
                  </Text>

                  {/* Bottom Action Footer */}
                  <View style={styles.itemFooterRow}>
                    <View style={styles.actionChip}>
                      <Text style={styles.actionChipText}>
                        {item.type?.includes('MEET')
                          ? 'Open Meeting & Chat'
                          : item.type?.includes('CONNECTION')
                          ? 'View Connection'
                          : item.type?.includes('INTRO')
                          ? 'View Introduction'
                          : 'View Details'}
                      </Text>
                      <Feather name="arrow-right" size={10} color="#0369A1" style={{ marginLeft: 3 }} />
                    </View>

                    {!item.read && (
                      <View style={styles.unreadDotWrap}>
                        <View style={styles.unreadDot} />
                        <Text style={styles.unreadLabel}>New</Text>
                      </View>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    padding: 6,
    marginRight: 10,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  unreadCountBadge: {
    backgroundColor: '#0284C7',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
  },
  unreadCountBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  markAllReadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  markAllReadText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0369A1',
  },
  filterTabsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  filterTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterTabActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  filterTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  scrollContent: {
    padding: 14,
    paddingBottom: 40,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyIconBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 18,
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  notificationCardUnread: {
    backgroundColor: '#F0F9FF',
    borderColor: '#BAE6FD',
  },
  itemIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
    marginTop: 2,
  },
  itemContent: {
    flex: 1,
  },
  itemHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    flex: 1,
    paddingRight: 8,
  },
  itemTitleUnread: {
    fontWeight: '700',
    color: '#0F172A',
  },
  itemTime: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '500',
  },
  itemBody: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 17,
    marginBottom: 8,
  },
  itemFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  actionChipText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0369A1',
  },
  unreadDotWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  unreadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#0284C7',
  },
  unreadLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0284C7',
  },
});
