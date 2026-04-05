import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SPACING } from '../utils/constants';
import { useColors } from '../utils/theme';
import { formatDKK } from '../utils/format';
import { useAuth } from '../store/auth';
import { api } from '../services/api';
import { EmptyState } from '../components/EmptyState';
import { useScheduledPayments, getFrequencyLabel } from '../store/scheduledPayments';

interface Transaction {
  id: string;
  amount: number;
  type: string;
  status: string;
  description: string;
  direction: string;
  createdAt: string;
  fromWallet?: { user: { name: string } };
  toWallet?: { user: { name: string } };
}

const TYPE_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  TOPUP: 'arrow-down-circle',
  P2P: 'swap-horizontal',
  MERCHANT_PAYMENT: 'cart',
  WITHDRAWAL: 'arrow-up-circle',
};

const TYPE_LABELS: Record<string, string> = {
  TOPUP: 'Optankning',
  P2P: 'Overførsel',
  MERCHANT_PAYMENT: 'Betaling',
  WITHDRAWAL: 'Udbetaling',
};

function formatScheduledNext(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diff = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diff <= 0) return 'I dag';
  if (diff === 1) return 'I morgen';
  if (diff <= 7) return `Om ${diff} dage`;
  return d.toLocaleDateString('da-DK', { day: 'numeric', month: 'short' });
}

export function HomeScreen({ navigation }: any) {
  const C = useColors();
  const { user, refreshUser } = useAuth();
  const { payments: scheduledPayments } = useScheduledPayments();
  const upcomingPayments = scheduledPayments.filter((p) => p.active).slice(0, 3);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      await refreshUser();
      const res = await api.get<{ transactions: Transaction[] }>(
        '/wallet/transactions?page=1&limit=10'
      );
      setTransactions(res.transactions);
    } catch {
      setTransactions([
        { id: '1', amount: 15000, type: 'P2P', status: 'COMPLETED', description: 'Tak for mad!', direction: 'outgoing', createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), toWallet: { user: { name: 'Magnus Hansen' } } },
        { id: '2', amount: 7500, type: 'P2P', status: 'COMPLETED', description: 'Biografbilletter', direction: 'incoming', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), fromWallet: { user: { name: 'Sara Petersen' } } },
        { id: '3', amount: 34900, type: 'MERCHANT_PAYMENT', status: 'COMPLETED', description: 'Café Nólsoy', direction: 'outgoing', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), toWallet: { user: { name: 'Café Nólsoy' } } },
        { id: '4', amount: 50000, type: 'TOPUP', status: 'COMPLETED', description: 'Wallet top-up', direction: 'incoming', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), fromWallet: { user: { name: 'Visa •4242' } } },
        { id: '5', amount: 2500, type: 'P2P', status: 'COMPLETED', description: 'Kaffe ☕', direction: 'outgoing', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(), toWallet: { user: { name: 'Jónas Djurhuus' } } },
        { id: '6', amount: 12000, type: 'P2P', status: 'COMPLETED', description: '', direction: 'incoming', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), fromWallet: { user: { name: 'Anna Olsen' } } },
      ]);
    }
  }, [refreshUser]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const balance = user?.wallet?.balance ?? 0;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: C.background }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Balance Card — wallet for P2P */}
      <View style={[styles.balanceCard, { backgroundColor: C.primary }]}>
        <Text style={styles.balanceLabel}>Wallet-saldo</Text>
        <Text style={styles.balanceAmount}>{formatDKK(balance)}</Text>
        <Text style={styles.balanceSub}>Til overførsler mellem venner</Text>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('TopUp')}
          >
            <Ionicons name="add-circle" size={28} color="#fff" />
            <Text style={styles.actionLabel}>Fyld op</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Send')}
          >
            <Ionicons name="send" size={24} color="#fff" />
            <Text style={styles.actionLabel}>Send</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={[styles.quickAction, { backgroundColor: C.surface, borderColor: C.border }]}
          onPress={() => navigation.navigate('Send')}
        >
          <View style={[styles.quickIcon, { backgroundColor: '#e8faf0' }]}>
            <Ionicons name="person" size={20} color={C.accent} />
          </View>
          <Text style={[styles.quickLabel, { color: C.text }]}>Send til ven</Text>
          <Text style={[styles.quickSub, { color: C.textLight }]}>Fra wallet</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.quickAction, { backgroundColor: C.surface, borderColor: C.border }]}
          onPress={() => navigation.navigate('Scan')}
        >
          <View style={[styles.quickIcon, { backgroundColor: '#f0fdf4' }]}>
            <Ionicons name="storefront" size={20} color={C.success} />
          </View>
          <Text style={[styles.quickLabel, { color: C.text }]}>Scan QR</Text>
          <Text style={[styles.quickSub, { color: C.textLight }]}>Betal i butik</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.quickAction, { backgroundColor: C.surface, borderColor: C.border }]}
          onPress={() => navigation.navigate('TopUp')}
        >
          <View style={[styles.quickIcon, { backgroundColor: '#fef3c7' }]}>
            <Ionicons name="wallet" size={20} color={C.warning} />
          </View>
          <Text style={[styles.quickLabel, { color: C.text }]}>Fyld op</Text>
          <Text style={[styles.quickSub, { color: C.textLight }]}>Wallet</Text>
        </TouchableOpacity>
      </View>

      {/* Scheduled Payments */}
      {upcomingPayments.length > 0 && (
        <View style={styles.scheduledSection}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: C.text }]}>Planlagte betalinger</Text>
            <TouchableOpacity onPress={() => navigation.navigate('ScheduledPayments')}>
              <Text style={[styles.seeAll, { color: C.text }]}>Se alle</Text>
            </TouchableOpacity>
          </View>
          {upcomingPayments.map((sp) => (
            <TouchableOpacity
              key={sp.id}
              style={[styles.scheduledRow, { backgroundColor: C.surface, borderColor: C.borderLight }]}
              onPress={() => navigation.navigate('ScheduledPayments')}
              activeOpacity={0.7}
            >
              <View style={[styles.scheduledIcon, { backgroundColor: C.accent + '15' }]}>
                <Ionicons name="calendar" size={18} color={C.accent} />
              </View>
              <View style={styles.scheduledInfo}>
                <Text style={[styles.scheduledName, { color: C.text }]} numberOfLines={1}>
                  {sp.recipientName}
                </Text>
                <Text style={[styles.scheduledMeta, { color: C.textLight }]}>
                  {getFrequencyLabel(sp.frequency)} · {formatScheduledNext(sp.nextDate)}
                </Text>
              </View>
              <Text style={[styles.scheduledAmount, { color: C.text }]}>{formatDKK(sp.amount)}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Recent Transactions */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: C.text }]}>Seneste aktivitet</Text>
          <TouchableOpacity onPress={() => navigation.navigate('History')}>
            <Text style={[styles.seeAll, { color: C.text }]}>Se alle</Text>
          </TouchableOpacity>
        </View>

        {transactions.length === 0 ? (
          <EmptyState
            icon="receipt-outline"
            iconColor={C.accent}
            iconBg="#dcfce7"
            title="Ingen aktivitet endnu"
            description="Send penge til en ven eller betal i en butik — din historik vises her."
            actionLabel="Send din første betaling"
            onAction={() => navigation.navigate('Send')}
            compact
          />
        ) : (
          transactions.map((tx) => (
            <TouchableOpacity
              key={tx.id}
              style={[styles.txRow, { backgroundColor: C.surface, borderColor: C.borderLight }]}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('TransactionDetail', { transaction: tx })}
            >
              <View style={[styles.txIcon, { backgroundColor: C.borderLight }]}>
                <Ionicons
                  name={TYPE_ICONS[tx.type] || 'ellipse'}
                  size={22}
                  color={tx.direction === 'incoming' ? C.success : C.text}
                />
              </View>
              <View style={styles.txInfo}>
                <Text style={[styles.txTitle, { color: C.text }]}>
                  {TYPE_LABELS[tx.type] || tx.type}
                </Text>
                <Text style={[styles.txSubtitle, { color: C.textSecondary }]}>
                  {tx.type === 'MERCHANT_PAYMENT'
                    ? 'Fra kort'
                    : tx.direction === 'incoming'
                      ? `Fra ${tx.fromWallet?.user?.name || 'Ukendt'}`
                      : `Til ${tx.toWallet?.user?.name || 'Ukendt'}`}
                </Text>
              </View>
              <Text
                style={[
                  styles.txAmount,
                  { color: tx.direction === 'incoming' ? C.success : C.text },
                ]}
              >
                {tx.direction === 'incoming' ? '+' : '-'}
                {formatDKK(tx.amount)}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  balanceCard: {
    margin: SPACING.md,
    borderRadius: 24,
    padding: SPACING.xl,
    alignItems: 'center',
  },
  balanceLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    fontWeight: '500',
  },
  balanceAmount: {
    color: '#fff',
    fontSize: 42,
    fontWeight: '800',
    marginTop: SPACING.xs,
  },
  balanceSub: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    marginTop: SPACING.xl,
    gap: SPACING.xl,
  },
  actionButton: {
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: 16,
  },
  actionLabel: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  quickAction: {
    flex: 1,
    borderRadius: 16,
    padding: SPACING.md,
    alignItems: 'center',
    gap: SPACING.sm,
    borderWidth: 1,
  },
  quickIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickLabel: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  quickSub: {
    fontSize: 10,
    textAlign: 'center',
    marginTop: -2,
  },
  scheduledSection: {
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  scheduledRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
  },
  scheduledIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  scheduledInfo: {
    flex: 1,
  },
  scheduledName: {
    fontSize: 14,
    fontWeight: '600',
  },
  scheduledMeta: {
    fontSize: 12,
    marginTop: 2,
  },
  scheduledAmount: {
    fontSize: 15,
    fontWeight: '700',
  },
  section: {
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
    gap: SPACING.sm,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
  },
  txIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  txInfo: {
    flex: 1,
  },
  txTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  txSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  txAmount: {
    fontSize: 15,
    fontWeight: '700',
  },
});
