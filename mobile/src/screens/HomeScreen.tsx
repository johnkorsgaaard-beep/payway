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

export function HomeScreen({ navigation }: any) {
  const C = useColors();
  const { user, refreshUser } = useAuth();
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
      setTransactions([]);
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

      {/* Recent Transactions */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: C.text }]}>Seneste aktivitet</Text>
          <TouchableOpacity onPress={() => navigation.navigate('History')}>
            <Text style={[styles.seeAll, { color: C.text }]}>Se alle</Text>
          </TouchableOpacity>
        </View>

        {transactions.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={48} color={C.textLight} />
            <Text style={[styles.emptyText, { color: C.textSecondary }]}>Ingen transaktioner endnu</Text>
            <Text style={[styles.emptySubtext, { color: C.textLight }]}>
              Send penge eller betal i en butik for at komme i gang
            </Text>
          </View>
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
