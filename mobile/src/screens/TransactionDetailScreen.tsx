import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SPACING } from '../utils/constants';
import { useColors } from '../utils/theme';
import { formatDKK } from '../utils/format';

const TYPE_LABELS: Record<string, string> = {
  TOPUP: 'Optankning',
  P2P: 'Overførsel',
  MERCHANT_PAYMENT: 'Butiksbetaling',
  WITHDRAWAL: 'Udbetaling',
};

function generateRef(id: string): string {
  const hash = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return `PW-${String(hash * 7919).padStart(6, '0').slice(0, 6)}-${id.toUpperCase().slice(0, 4)}`;
}

export function TransactionDetailScreen({ route }: any) {
  const C = useColors();
  const { transaction } = route.params;
  const tx = transaction;

  const TYPE_ICONS: Record<string, { icon: keyof typeof Ionicons.glyphMap; color: string; bg: string }> = {
    TOPUP: { icon: 'arrow-down-circle', color: C.warning, bg: '#fef3c7' },
    P2P: { icon: 'swap-horizontal', color: C.primary, bg: '#e8eef5' },
    MERCHANT_PAYMENT: { icon: 'cart', color: '#8b5cf6', bg: '#f3e8ff' },
    WITHDRAWAL: { icon: 'arrow-up-circle', color: C.danger, bg: '#fee2e2' },
  };

  const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
    COMPLETED: { label: 'Gennemført', color: C.success, bg: '#e8faf0' },
    PENDING: { label: 'Afventer', color: C.warning, bg: '#fef3c7' },
    FAILED: { label: 'Fejlet', color: C.danger, bg: '#fee2e2' },
    CANCELLED: { label: 'Annulleret', color: C.textLight, bg: '#f3f4f6' },
  };

  const typeConfig = TYPE_ICONS[tx.type] || { icon: 'ellipse' as keyof typeof Ionicons.glyphMap, color: C.text, bg: C.borderLight };
  const statusConfig = STATUS_LABELS[tx.status] || STATUS_LABELS.COMPLETED;
  const isIncoming = tx.direction === 'incoming';
  const counterparty = isIncoming
    ? tx.fromWallet?.user?.name || 'Ukendt'
    : tx.toWallet?.user?.name || 'Ukendt';

  const date = new Date(tx.createdAt);
  const formattedDate = date.toLocaleDateString('da-DK', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const formattedTime = date.toLocaleTimeString('da-DK', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const reference = generateRef(tx.id);

  const handleShare = async () => {
    await Share.share({
      message: `PayWay kvittering\n${TYPE_LABELS[tx.type] || tx.type}: ${isIncoming ? '+' : '-'}${formatDKK(tx.amount)}\n${isIncoming ? 'Fra' : 'Til'}: ${counterparty}\nDato: ${formattedDate}\nRef: ${reference}`,
    });
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: C.background }]} contentContainerStyle={styles.content}>
      {/* Amount hero */}
      <View style={[styles.hero, { backgroundColor: C.surface, borderBottomColor: C.borderLight }]}>
        <View style={[styles.heroIcon, { backgroundColor: typeConfig.bg }]}>
          <Ionicons name={typeConfig.icon} size={32} color={typeConfig.color} />
        </View>
        <Text style={[styles.amount, isIncoming ? { color: C.success } : { color: C.text }]}>
          {isIncoming ? '+' : '-'}{formatDKK(tx.amount)}
        </Text>
        <Text style={[styles.typeLabel, { color: C.textSecondary }]}>{TYPE_LABELS[tx.type] || tx.type}</Text>
        <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
          <View style={[styles.statusDot, { backgroundColor: statusConfig.color }]} />
          <Text style={[styles.statusText, { color: statusConfig.color }]}>{statusConfig.label}</Text>
        </View>
      </View>

      {/* Details card */}
      <View style={[styles.card, { backgroundColor: C.surface, borderColor: C.borderLight }]}>
        <DetailRow
          icon="person-outline"
          label={isIncoming ? 'Fra' : 'Til'}
          value={counterparty}
        />
        <Divider />
        <DetailRow
          icon="calendar-outline"
          label="Dato"
          value={formattedDate}
        />
        <Divider />
        <DetailRow
          icon="time-outline"
          label="Tidspunkt"
          value={formattedTime}
        />
        <Divider />
        <DetailRow
          icon="pricetag-outline"
          label="Type"
          value={TYPE_LABELS[tx.type] || tx.type}
        />
        <Divider />
        <DetailRow
          icon="document-text-outline"
          label="Reference"
          value={reference}
          mono
        />
        {tx.description ? (
          <>
            <Divider />
            <DetailRow
              icon="chatbubble-outline"
              label="Besked"
              value={tx.description}
            />
          </>
        ) : null}
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: C.surface, borderColor: C.border }]} onPress={handleShare}>
          <Ionicons name="share-outline" size={20} color={C.primary} />
          <Text style={[styles.actionBtnText, { color: C.primary }]}>Del kvittering</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function DetailRow({ icon, label, value, mono }: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  mono?: boolean;
}) {
  const C = useColors();
  return (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        <Ionicons name={icon} size={18} color={C.textSecondary} />
        <Text style={[styles.rowLabel, { color: C.textSecondary }]}>{label}</Text>
      </View>
      <Text style={[styles.rowValue, { color: C.text }, mono && styles.rowValueMono]} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

function Divider() {
  const C = useColors();
  return <View style={[styles.divider, { backgroundColor: C.borderLight }]} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: SPACING.xxl * 2,
  },
  hero: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
  },
  heroIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  amount: {
    fontSize: 36,
    fontWeight: '800',
  },
  typeLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginTop: SPACING.sm,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  card: {
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: 14,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  rowLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  rowValue: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'right',
    flex: 1,
    marginLeft: SPACING.md,
  },
  rowValueMono: {
    fontFamily: 'Courier',
    fontSize: 13,
    letterSpacing: 0.5,
  },
  divider: {
    height: 1,
    marginLeft: SPACING.md + 18 + SPACING.sm,
  },
  actions: {
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.lg,
    gap: SPACING.sm,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    borderRadius: 14,
    paddingVertical: 14,
    borderWidth: 1,
  },
  actionBtnText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
