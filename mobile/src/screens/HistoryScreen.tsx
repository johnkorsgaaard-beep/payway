import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../utils/constants';
import { formatDKK } from '../utils/format';
import { api } from '../services/api';

interface Transaction {
  id: string;
  amount: number;
  type: string;
  status: string;
  description: string;
  direction: string;
  createdAt: string;
  fromWallet?: { user: { name: string; phone: string } };
  toWallet?: { user: { name: string; phone: string } };
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

export function HistoryScreen({ navigation }: any) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchTransactions = useCallback(async (p: number, append = false) => {
    try {
      const res = await api.get<{
        transactions: Transaction[];
        totalPages: number;
      }>(`/wallet/transactions?page=${p}&limit=20`);

      if (append) {
        setTransactions((prev) => [...prev, ...res.transactions]);
      } else {
        setTransactions(res.transactions);
      }
      setHasMore(p < res.totalPages);
    } catch {}
  }, []);

  useEffect(() => {
    fetchTransactions(1).finally(() => setLoading(false));
  }, [fetchTransactions]);

  const onRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    await fetchTransactions(1);
    setRefreshing(false);
  };

  const loadMore = () => {
    if (!hasMore) return;
    const next = page + 1;
    setPage(next);
    fetchTransactions(next, true);
  };

  const formatTime = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString('da-DK', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderItem = ({ item: tx }: { item: Transaction }) => (
    <TouchableOpacity
      style={styles.txRow}
      activeOpacity={0.7}
      onPress={() => navigation.navigate('TransactionDetail', { transaction: tx })}
    >
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
          {tx.direction === 'incoming'
            ? `Fra ${tx.fromWallet?.user?.name || 'Ukendt'}`
            : `Til ${tx.toWallet?.user?.name || 'Ukendt'}`}
        </Text>
        {tx.description && (
          <Text style={styles.txDesc}>{tx.description}</Text>
        )}
      </View>
      <View style={styles.txRight}>
        <Text
          style={[
            styles.txAmount,
            tx.direction === 'incoming' ? styles.txIncoming : styles.txOutgoing,
          ]}
        >
          {tx.direction === 'incoming' ? '+' : '-'}
          {formatDKK(tx.amount)}
        </Text>
        <Text style={styles.txTime}>{formatTime(tx.createdAt)}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      data={transactions}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      onEndReached={loadMore}
      onEndReachedThreshold={0.5}
      ListEmptyComponent={
        <View style={styles.empty}>
          <Ionicons name="receipt-outline" size={48} color={COLORS.textLight} />
          <Text style={styles.emptyText}>Ingen transaktioner endnu</Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  list: {
    padding: SPACING.md,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  txDesc: {
    fontSize: 11,
    color: COLORS.textLight,
    fontStyle: 'italic',
    marginTop: 2,
  },
  txRight: {
    alignItems: 'flex-end',
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
  txTime: {
    fontSize: 11,
    color: COLORS.textLight,
    marginTop: 2,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl * 2,
    gap: SPACING.sm,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
});
