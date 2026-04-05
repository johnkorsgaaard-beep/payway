import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SPACING } from '../utils/constants';
import { useColors } from '../utils/theme';
import { formatDKK } from '../utils/format';
import { EmptyState } from '../components/EmptyState';
import {
  useScheduledPayments,
  getFrequencyLabel,
  type ScheduledPayment,
} from '../store/scheduledPayments';

function formatNextDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return 'I dag';
  if (diffDays === 1) return 'I morgen';
  if (diffDays <= 7) return `Om ${diffDays} dage`;

  return d.toLocaleDateString('da-DK', { day: 'numeric', month: 'short' });
}

const FREQ_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  once: 'time-outline',
  weekly: 'calendar-outline',
  biweekly: 'calendar-outline',
  monthly: 'calendar',
};

export function ScheduledPaymentsScreen({ navigation }: any) {
  const C = useColors();
  const s = makeStyles(C);
  const { payments, togglePayment, deletePayment } = useScheduledPayments();

  const handleDelete = (payment: ScheduledPayment) => {
    Alert.alert(
      'Slet planlagt betaling',
      `Er du sikker på du vil slette "${payment.description || 'betaling'}" til ${payment.recipientName}?`,
      [
        { text: 'Annuller', style: 'cancel' },
        {
          text: 'Slet',
          style: 'destructive',
          onPress: () => deletePayment(payment.id),
        },
      ],
    );
  };

  const activePayments = payments.filter((p) => p.active);
  const pausedPayments = payments.filter((p) => !p.active);

  const renderPayment = ({ item }: { item: ScheduledPayment }) => (
    <TouchableOpacity
      style={[s.card, { backgroundColor: C.surface, borderColor: C.borderLight }]}
      activeOpacity={0.7}
      onLongPress={() => handleDelete(item)}
    >
      <View style={s.cardTop}>
        <View style={[s.iconCircle, { backgroundColor: item.active ? C.accent + '15' : C.borderLight }]}>
          <Ionicons
            name={FREQ_ICONS[item.frequency] || 'calendar'}
            size={20}
            color={item.active ? C.accent : C.textLight}
          />
        </View>
        <View style={s.cardInfo}>
          <Text style={[s.cardName, { color: C.text }]} numberOfLines={1}>
            {item.recipientName}
          </Text>
          {item.recipientTag && (
            <Text style={[s.cardTag, { color: C.primary }]}>@{item.recipientTag}</Text>
          )}
        </View>
        <Text style={[s.cardAmount, { color: item.active ? C.text : C.textLight }]}>
          {formatDKK(item.amount)}
        </Text>
      </View>

      <View style={s.cardBottom}>
        <View style={s.cardMeta}>
          {item.description ? (
            <View style={[s.metaChip, { backgroundColor: C.borderLight }]}>
              <Text style={[s.metaText, { color: C.textSecondary }]}>{item.description}</Text>
            </View>
          ) : null}
          <View style={[s.metaChip, { backgroundColor: C.borderLight }]}>
            <Ionicons name="repeat" size={12} color={C.textSecondary} />
            <Text style={[s.metaText, { color: C.textSecondary }]}>
              {getFrequencyLabel(item.frequency)}
            </Text>
          </View>
          <View style={[s.metaChip, { backgroundColor: item.active ? C.accent + '15' : C.borderLight }]}>
            <Ionicons name="time-outline" size={12} color={item.active ? C.accent : C.textLight} />
            <Text style={[s.metaText, { color: item.active ? C.accent : C.textLight }]}>
              {formatNextDate(item.nextDate)}
            </Text>
          </View>
        </View>
        <Switch
          value={item.active}
          onValueChange={() => togglePayment(item.id)}
          trackColor={{ false: C.border, true: C.accent + '60' }}
          thumbColor={item.active ? C.accent : C.textLight}
          ios_backgroundColor={C.border}
        />
      </View>
    </TouchableOpacity>
  );

  const sections = [
    ...(activePayments.length > 0
      ? [{ type: 'header' as const, title: `Aktive (${activePayments.length})` }]
      : []),
    ...activePayments.map((p) => ({ type: 'item' as const, payment: p })),
    ...(pausedPayments.length > 0
      ? [{ type: 'header' as const, title: `Pauset (${pausedPayments.length})` }]
      : []),
    ...pausedPayments.map((p) => ({ type: 'item' as const, payment: p })),
  ];

  return (
    <View style={[s.container, { backgroundColor: C.background }]}>
      <FlatList
        data={sections}
        keyExtractor={(item, i) => (item.type === 'header' ? `h-${i}` : (item as any).payment.id)}
        contentContainerStyle={s.list}
        renderItem={({ item }) => {
          if (item.type === 'header') {
            return (
              <Text style={[s.sectionHeader, { color: C.textSecondary }]}>{item.title}</Text>
            );
          }
          return renderPayment({ item: (item as any).payment });
        }}
        ListHeaderComponent={
          <View style={s.topBar}>
            <View>
              <Text style={[s.totalLabel, { color: C.textSecondary }]}>Månedligt samlet</Text>
              <Text style={[s.totalAmount, { color: C.text }]}>
                ~{formatDKK(
                  activePayments.reduce((sum, p) => {
                    if (p.frequency === 'monthly') return sum + p.amount;
                    if (p.frequency === 'weekly') return sum + p.amount * 4;
                    if (p.frequency === 'biweekly') return sum + p.amount * 2;
                    return sum;
                  }, 0),
                )}
              </Text>
            </View>
            <TouchableOpacity
              style={[s.addBtn, { backgroundColor: C.accent }]}
              onPress={() => navigation.navigate('CreateScheduledPayment')}
            >
              <Ionicons name="add" size={22} color="#fff" />
            </TouchableOpacity>
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            icon="calendar-outline"
            iconColor="#6366f1"
            iconBg="#eef2ff"
            title="Ingen planlagte betalinger"
            description="Opret automatiske betalinger til husleje, abonnementer eller faste udgifter."
            actionLabel="Opret betaling"
            onAction={() => navigation.navigate('CreateScheduledPayment')}
          />
        }
      />

      <TouchableOpacity
        style={[s.fab, { backgroundColor: C.accent }]}
        onPress={() => navigation.navigate('CreateScheduledPayment')}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

function makeStyles(C: any) {
  return StyleSheet.create({
    container: { flex: 1 },
    list: { padding: SPACING.md, paddingBottom: 100 },
    topBar: {
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      backgroundColor: C.surface, borderRadius: 16, padding: SPACING.md,
      borderWidth: 1, borderColor: C.borderLight, marginBottom: SPACING.md,
    },
    totalLabel: { fontSize: 12, fontWeight: '500' },
    totalAmount: { fontSize: 22, fontWeight: '800', marginTop: 2 },
    addBtn: {
      width: 44, height: 44, borderRadius: 14,
      justifyContent: 'center', alignItems: 'center',
    },
    sectionHeader: {
      fontSize: 13, fontWeight: '700', textTransform: 'uppercase',
      letterSpacing: 0.8, marginTop: SPACING.md, marginBottom: SPACING.sm,
      marginLeft: SPACING.xs,
    },
    card: {
      borderRadius: 16, padding: SPACING.md, borderWidth: 1,
      marginBottom: SPACING.sm,
    },
    cardTop: {
      flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
      marginBottom: SPACING.sm,
    },
    iconCircle: {
      width: 44, height: 44, borderRadius: 14,
      justifyContent: 'center', alignItems: 'center',
    },
    cardInfo: { flex: 1 },
    cardName: { fontSize: 15, fontWeight: '700' },
    cardTag: { fontSize: 12, fontWeight: '500', marginTop: 1 },
    cardAmount: { fontSize: 17, fontWeight: '800' },
    cardBottom: {
      flexDirection: 'row', alignItems: 'center',
      justifyContent: 'space-between',
    },
    cardMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, flex: 1 },
    metaChip: {
      flexDirection: 'row', alignItems: 'center', gap: 4,
      paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8,
    },
    metaText: { fontSize: 11, fontWeight: '600' },
    fab: {
      position: 'absolute', bottom: SPACING.xl, right: SPACING.md,
      width: 56, height: 56, borderRadius: 28,
      justifyContent: 'center', alignItems: 'center',
      shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2, shadowRadius: 8, elevation: 6,
    },
  });
}
