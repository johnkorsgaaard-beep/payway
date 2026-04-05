import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../utils/constants';

interface Notification {
  id: string;
  type: 'payment_received' | 'payment_sent' | 'topup' | 'kyc' | 'group' | 'system' | 'request';
  title: string;
  body: string;
  read: boolean;
  timestamp: Date;
}

const TYPE_CONFIG: Record<Notification['type'], { icon: keyof typeof Ionicons.glyphMap; color: string; bg: string }> = {
  payment_received: { icon: 'arrow-down-circle', color: COLORS.success, bg: '#e8faf0' },
  payment_sent: { icon: 'arrow-up-circle', color: COLORS.primary, bg: '#e8eef5' },
  topup: { icon: 'wallet', color: COLORS.warning, bg: '#fef3c7' },
  kyc: { icon: 'shield-checkmark', color: '#8b5cf6', bg: '#f3e8ff' },
  group: { icon: 'people', color: COLORS.primary, bg: '#e8eef5' },
  system: { icon: 'information-circle', color: COLORS.textSecondary, bg: '#f3f4f6' },
  request: { icon: 'download-outline', color: COLORS.accent, bg: '#e8faf0' },
};

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'payment_received',
    title: 'Du har modtaget 150,00 kr.',
    body: 'Fra @anders – "Tak for i går!"',
    read: false,
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
  },
  {
    id: '2',
    type: 'request',
    title: 'Anmodning om 75,00 kr.',
    body: '@sara har anmodet om penge – "Din halvdel af middagen"',
    read: false,
    timestamp: new Date(Date.now() - 1000 * 60 * 20),
  },
  {
    id: '3',
    type: 'group',
    title: 'Ny udgift i "Fredag pizza"',
    body: 'Magnus tilføjede "Første runde" – 250,00 kr.',
    read: false,
    timestamp: new Date(Date.now() - 1000 * 60 * 45),
  },
  {
    id: '4',
    type: 'payment_sent',
    title: 'Du har sendt 42,50 kr.',
    body: 'Til Café Nólsoy – QR-betaling',
    read: true,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
  },
  {
    id: '5',
    type: 'kyc',
    title: 'Identitet verificeret',
    body: 'Din konto er nu fuldt godkendt. Du har adgang til alle funktioner.',
    read: true,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
  },
  {
    id: '6',
    type: 'topup',
    title: 'Wallet fyldt op',
    body: '500,00 kr. tilføjet fra Visa •4242',
    read: true,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8),
  },
  {
    id: '7',
    type: 'payment_received',
    title: 'Du har modtaget 1.200,00 kr.',
    body: 'Fra @jónas – huslejebidrag',
    read: true,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
  },
  {
    id: '8',
    type: 'system',
    title: 'Velkommen til PayWay!',
    body: 'Tak fordi du bruger PayWay. Udforsk appen og send din første betaling.',
    read: true,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48),
  },
  {
    id: '9',
    type: 'group',
    title: 'Du blev tilføjet til "Sommerferie 2026"',
    body: 'Anna oprettede en ny gruppe med 5 medlemmer.',
    read: true,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72),
  },
];

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
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const renderNotification = ({ item }: { item: Notification }) => {
    const config = TYPE_CONFIG[item.type];
    return (
      <TouchableOpacity
        style={[styles.notifRow, !item.read && styles.notifUnread]}
        onPress={() => markRead(item.id)}
        activeOpacity={0.7}
      >
        <View style={[styles.notifIcon, { backgroundColor: config.bg }]}>
          <Ionicons name={config.icon} size={20} color={config.color} />
        </View>
        <View style={styles.notifContent}>
          <View style={styles.notifHeader}>
            <Text style={[styles.notifTitle, !item.read && styles.notifTitleUnread]} numberOfLines={1}>
              {item.title}
            </Text>
            {!item.read && <View style={styles.unreadDot} />}
          </View>
          <Text style={styles.notifBody} numberOfLines={2}>{item.body}</Text>
          <Text style={styles.notifTime}>{formatTimeAgo(item.timestamp)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {unreadCount > 0 && (
        <View style={styles.topBar}>
          <Text style={styles.unreadLabel}>{unreadCount} ulæste</Text>
          <TouchableOpacity onPress={markAllRead}>
            <Text style={styles.markAllBtn}>Markér alle som læst</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="notifications-off-outline" size={48} color={COLORS.textLight} />
            <Text style={styles.emptyText}>Ingen notifikationer</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  unreadLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
  markAllBtn: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.accent,
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
    backgroundColor: COLORS.surface,
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
    color: COLORS.text,
  },
  notifTitleUnread: {
    fontWeight: '700',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  notifBody: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
    lineHeight: 18,
  },
  notifTime: {
    fontSize: 11,
    color: COLORS.textLight,
    marginTop: 4,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.borderLight,
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
    color: COLORS.textLight,
  },
});
