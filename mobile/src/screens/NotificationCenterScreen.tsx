import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SPACING } from '../utils/constants';
import { useColors } from '../utils/theme';
import { api } from '../services/api';
import { getToken } from '../services/api';

interface Notification {
  id: string;
  type: 'payment_received' | 'payment_sent' | 'topup' | 'kyc' | 'group' | 'system' | 'request';
  title: string;
  body: string;
  read: boolean;
  timestamp: Date;
}

function formatTimeAgo(date: Date): string {
  const mins = Math.floor((Date.now() - date.getTime()) / 60000);
  if (mins < 1) return 'Lige nu';
  if (mins < 60) return `${mins} min. siden`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} ${hours === 1 ? 'time' : 'timer'} siden`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} ${days === 1 ? 'dag' : 'dage'} siden`;
  return date.toLocaleDateString('da-DK', { day: 'numeric', month: 'short' });
}

export function NotificationCenterScreen() {
  const C = useColors();

  const TYPE_CONFIG: Record<Notification['type'], { icon: keyof typeof Ionicons.glyphMap; color: string; bg: string }> = {
    payment_received: { icon: 'arrow-down-circle', color: C.success, bg: '#e8faf0' },
    payment_sent: { icon: 'arrow-up-circle', color: C.primary, bg: '#e8eef5' },
    topup: { icon: 'wallet', color: C.warning, bg: '#fef3c7' },
    kyc: { icon: 'shield-checkmark', color: '#8b5cf6', bg: '#f3e8ff' },
    group: { icon: 'people', color: C.primary, bg: '#e8eef5' },
    system: { icon: 'information-circle', color: C.textSecondary, bg: '#f3f4f6' },
    request: { icon: 'download-outline', color: C.accent, bg: '#e8faf0' },
  };

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) { setLoading(false); return; }
      const res = await api.get<{ notifications: Array<{ id: string; type: string; title: string; body: string; is_read: boolean; created_at: string }> }>('/notifications?limit=50');
      setNotifications(
        (res.notifications || []).map((n) => ({
          id: n.id,
          type: n.type as Notification['type'],
          title: n.title,
          body: n.body,
          read: n.is_read,
          timestamp: new Date(n.created_at),
        }))
      );
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    const unread = notifications.filter((n) => !n.read);
    unread.forEach((n) => {
      api.put(`/notifications/${n.id}`, { is_read: true }).catch(() => {});
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markRead = (id: string) => {
    api.put(`/notifications/${id}`, { is_read: true }).catch(() => {});
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const renderNotification = ({ item }: { item: Notification }) => {
    const config = TYPE_CONFIG[item.type];
    return (
      <TouchableOpacity
        style={[styles.notifRow, { backgroundColor: C.surface }, !item.read && styles.notifUnread]}
        onPress={() => markRead(item.id)}
        activeOpacity={0.7}
      >
        <View style={[styles.notifIcon, { backgroundColor: config.bg }]}>
          <Ionicons name={config.icon} size={20} color={config.color} />
        </View>
        <View style={styles.notifContent}>
          <View style={styles.notifHeader}>
            <Text style={[styles.notifTitle, { color: C.text }, !item.read && styles.notifTitleUnread]} numberOfLines={1}>
              {item.title}
            </Text>
            {!item.read && <View style={[styles.unreadDot, { backgroundColor: C.primary }]} />}
          </View>
          <Text style={[styles.notifBody, { color: C.textSecondary }]} numberOfLines={2}>{item.body}</Text>
          <Text style={[styles.notifTime, { color: C.textLight }]}>{formatTimeAgo(item.timestamp)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.empty, { backgroundColor: C.background }]}>
        <ActivityIndicator size="large" color={C.accent} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: C.background }]}>
      {unreadCount > 0 && (
        <View style={[styles.topBar, { backgroundColor: C.surface, borderBottomColor: C.borderLight }]}>
          <Text style={[styles.unreadLabel, { color: C.primary }]}>{unreadCount} ulæste</Text>
          <TouchableOpacity onPress={markAllRead}>
            <Text style={[styles.markAllBtn, { color: C.accent }]}>Markér alle som læst</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={[styles.separator, { backgroundColor: C.borderLight }]} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="notifications-off-outline" size={48} color={C.textLight} />
            <Text style={[styles.emptyText, { color: C.textLight }]}>Ingen notifikationer</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
  },
  unreadLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  markAllBtn: {
    fontSize: 13,
    fontWeight: '600',
  },
  list: {
    paddingBottom: SPACING.xxl,
  },
  notifRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 14,
  },
  notifUnread: {
    backgroundColor: '#f0f7ff',
  },
  notifIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  notifContent: {
    flex: 1,
  },
  notifHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  notifTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  notifTitleUnread: {
    fontWeight: '700',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  notifBody: {
    fontSize: 13,
    marginTop: 2,
    lineHeight: 18,
  },
  notifTime: {
    fontSize: 11,
    marginTop: 4,
  },
  separator: {
    height: 1,
    marginLeft: SPACING.md + 40 + SPACING.md,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 120,
    gap: SPACING.sm,
  },
  emptyText: {
    fontSize: 16,
  },
});
