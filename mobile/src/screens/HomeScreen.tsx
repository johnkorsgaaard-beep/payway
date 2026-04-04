import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../utils/constants';
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
      // Demo data when API is unavailable
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
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Balance Card — wallet for P2P */}
      <View style={styles.balanceCard}>
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
          style={styles.quickAction}
          onPress={() => navigation.navigate('Send')}
        >
          <View style={[styles.quickIcon, { backgroundColor: '#e8faf0' }]}>
            <Ionicons name="person" size={20} color={COLORS.accent} />
          </View>
          <Text style={styles.quickLabel}>Send til ven</Text>
          <Text style={styles.quickSub}>Fra wallet</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickAction}
          onPress={() => navigation.navigate('Scan')}
        >
          <View style={[styles.quickIcon, { backgroundColor: '#f0fdf4' }]}>
            <Ionicons name="storefront" size={20} color={COLORS.success} />
          </View>
          <Text style={styles.quickLabel}>Scan QR</Text>
          <Text style={styles.quickSub}>Betal i butik</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickAction}
          onPress={() => navigation.navigate('TopUp')}
        >
          <View style={[styles.quickIcon, { backgroundColor: '#fef3c7' }]}>
            <Ionicons name="wallet" size={20} color={COLORS.warning} />
          </View>
          <Text style={styles.quickLabel}>Fyld op</Text>
          <Text style={styles.quickSub}>Wallet</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Transactions */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Seneste aktivitet</Text>
          <TouchableOpacity onPress={() => navigation.navigate('History')}>
            <Text style={styles.seeAll}>Se alle</Text>
          </TouchableOpacity>
        </View>

        {transactions.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={48} color={COLORS.textLight} />
            <Text style={styles.emptyText}>Ingen transaktioner endnu</Text>
            <Text style={styles.emptySubtext}>
              Send penge eller betal i en butik for at komme i gang
            </Text>
          </View>
        ) : (
          transactions.map((tx) => (
            <View key={tx.id} style={styles.txRow}>
              <View style={styles.txIcon}>
                <Ionicons
                  name={TYPE_ICONS[tx.type] || 'ellipse'}
                  size={22}
                  color={tx.direction === 'incoming' ? COLORS.success : COLORS.text}
                />
              </View>
              <View style={styles.txInfo}>
                <Text style={styles.txTitle}>
                  {TYPE_LABELS[tx.type] || tx.type}
                </Text>
                <Text style={styles.txSubtitle}>
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
                  tx.direction === 'incoming' ? styles.txIncoming : styles.txOutgoing,
                ]}
              >
                {tx.direction === 'incoming' ? '+' : '-'}
                {formatDKK(tx.amount)}
              </Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  balanceCard: {
    backgroundColor: COLORS.primary,
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
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.md,
    alignItems: 'center',
    gap: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
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
    color: COLORS.text,
    textAlign: 'center',
  },
  quickSub: {
    fontSize: 10,
    color: COLORS.textLight,
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
    color: COLORS.text,
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.accent,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
    gap: SPACING.sm,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  txIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.borderLight,
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
    color: COLORS.text,
  },
  txSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  txAmount: {
    fontSize: 15,
    fontWeight: '700',
  },
  txIncoming: {
    color: COLORS.success,
  },
  txOutgoing: {
    color: COLORS.text,
  },
});
