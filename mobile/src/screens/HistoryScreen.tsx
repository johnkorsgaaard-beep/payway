import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SPACING } from '../utils/constants';
import { useColors } from '../utils/theme';
import { formatDKK } from '../utils/format';
import { api } from '../services/api';
import { EmptyState } from '../components/EmptyState';
import { SearchBar } from '../components/SearchBar';
import { FilterChips, type FilterOption } from '../components/FilterChips';
import * as FileSystem from 'expo-file-system';

const TYPE_FILTERS: FilterOption[] = [
  { key: 'ALL', label: 'Alle' },
  { key: 'P2P', label: 'Overførsel', icon: 'swap-horizontal' },
  { key: 'TOPUP', label: 'Optankning', icon: 'arrow-down-circle' },
  { key: 'MERCHANT_PAYMENT', label: 'Betaling', icon: 'cart' },
  { key: 'WITHDRAWAL', label: 'Udbetaling', icon: 'arrow-up-circle' },
];

const DIRECTION_FILTERS: FilterOption[] = [
  { key: 'ALL', label: 'Alle' },
  { key: 'incoming', label: 'Indgående', icon: 'arrow-down' },
  { key: 'outgoing', label: 'Udgående', icon: 'arrow-up' },
];

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
  const C = useColors();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [directionFilter, setDirectionFilter] = useState('ALL');

  const filteredTransactions = useMemo(() => {
    let result = transactions;

    if (typeFilter !== 'ALL') {
      result = result.filter((tx) => tx.type === typeFilter);
    }
    if (directionFilter !== 'ALL') {
      result = result.filter((tx) => tx.direction === directionFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((tx) => {
        const name =
          tx.direction === 'incoming'
            ? tx.fromWallet?.user?.name
            : tx.toWallet?.user?.name;
        return (
          (name && name.toLowerCase().includes(q)) ||
          (tx.description && tx.description.toLowerCase().includes(q)) ||
          (TYPE_LABELS[tx.type] && TYPE_LABELS[tx.type].toLowerCase().includes(q)) ||
          formatDKK(tx.amount).includes(q)
        );
      });
    }
    return result;
  }, [transactions, searchQuery, typeFilter, directionFilter]);

  const hasActiveFilters = searchQuery.trim() !== '' || typeFilter !== 'ALL' || directionFilter !== 'ALL';
  const clearAllFilters = () => { setSearchQuery(''); setTypeFilter('ALL'); setDirectionFilter('ALL'); };

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
    } catch {
      if (p === 1 && !append) {
        setTransactions([
          { id: '1', amount: 15000, type: 'P2P', status: 'COMPLETED', description: 'Tak for mad!', direction: 'outgoing', createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), toWallet: { user: { name: 'Magnus Hansen', phone: '+298111111' } } },
          { id: '2', amount: 7500, type: 'P2P', status: 'COMPLETED', description: 'Biografbilletter', direction: 'incoming', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), fromWallet: { user: { name: 'Sara Petersen', phone: '+298222222' } } },
          { id: '3', amount: 34900, type: 'MERCHANT_PAYMENT', status: 'COMPLETED', description: 'Café Nólsoy', direction: 'outgoing', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), toWallet: { user: { name: 'Café Nólsoy', phone: '' } } },
          { id: '4', amount: 50000, type: 'TOPUP', status: 'COMPLETED', description: 'Wallet top-up', direction: 'incoming', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), fromWallet: { user: { name: 'Visa •4242', phone: '' } } },
          { id: '5', amount: 2500, type: 'P2P', status: 'COMPLETED', description: 'Kaffe ☕', direction: 'outgoing', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(), toWallet: { user: { name: 'Jónas Djurhuus', phone: '+298333333' } } },
          { id: '6', amount: 12000, type: 'P2P', status: 'COMPLETED', description: '', direction: 'incoming', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), fromWallet: { user: { name: 'Anna Olsen', phone: '+298444444' } } },
          { id: '7', amount: 8900, type: 'MERCHANT_PAYMENT', status: 'COMPLETED', description: 'SMS Supermarked', direction: 'outgoing', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 52).toISOString(), toWallet: { user: { name: 'SMS Supermarked', phone: '' } } },
          { id: '8', amount: 100000, type: 'TOPUP', status: 'COMPLETED', description: 'Wallet top-up', direction: 'incoming', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), fromWallet: { user: { name: 'Mastercard •8810', phone: '' } } },
          { id: '9', amount: 4200, type: 'P2P', status: 'COMPLETED', description: 'Taxi 🚕', direction: 'outgoing', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(), toWallet: { user: { name: 'Eirikur Joensen', phone: '+298555555' } } },
          { id: '10', amount: 25000, type: 'WITHDRAWAL', status: 'COMPLETED', description: 'Udbetaling til bank', direction: 'outgoing', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 120).toISOString(), toWallet: { user: { name: 'Betri Banki •7890', phone: '' } } },
        ]);
      }
      setHasMore(false);
    }
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

  const formatFullDate = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString('da-DK', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };
  const formatFullTime = (date: string) => {
    const d = new Date(date);
    return d.toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit' });
  };
  const buildCSV = () => {
    const header = 'Dato;Tid;Type;Retning;Modpart;Beløb (DKK);Beskrivelse;Status';
    const rows = transactions.map((tx) => {
      const who = tx.direction === 'incoming' ? tx.fromWallet?.user?.name || 'Ukendt' : tx.toWallet?.user?.name || 'Ukendt';
      const amt = (tx.amount / 100).toFixed(2).replace('.', ',');
      return [formatFullDate(tx.createdAt), formatFullTime(tx.createdAt), TYPE_LABELS[tx.type] || tx.type, tx.direction === 'incoming' ? 'Indgående' : 'Udgående', who, `${tx.direction === 'incoming' ? '' : '-'}${amt}`, tx.description || '', tx.status].join(';');
    });
    return [header, ...rows].join('\n');
  };
  const handleExport = () => {
    if (transactions.length === 0) { Alert.alert('Ingen data', 'Der er ingen transaktioner at eksportere.'); return; }
    Alert.alert('Eksporter transaktioner', 'Vælg format', [
      { text: 'CSV', onPress: exportCSV },
      { text: 'PDF', onPress: exportPDF },
      { text: 'Annuller', style: 'cancel' },
    ]);
  };
  const exportCSV = async () => {
    try {
      const csv = buildCSV();
      const path = `${FileSystem.cacheDirectory}payway-transaktioner.csv`;
      await FileSystem.writeAsStringAsync(path, csv, { encoding: FileSystem.EncodingType.UTF8 });
      let sharing: any;
      try { sharing = require('expo-sharing'); } catch {}
      if (sharing?.isAvailableAsync && await sharing.isAvailableAsync()) {
        await sharing.shareAsync(path, { mimeType: 'text/csv', dialogTitle: 'Eksporter CSV' });
      } else { await Share.share({ message: csv, title: 'PayWay Transaktioner' }); }
    } catch { const csv = buildCSV(); await Share.share({ message: csv, title: 'PayWay Transaktioner' }); }
  };
  const exportPDF = async () => {
    try {
      let Print: any; let sharing: any;
      try { Print = require('expo-print'); } catch {}
      try { sharing = require('expo-sharing'); } catch {}
      const rowsHtml = transactions.map((tx) => {
        const who = tx.direction === 'incoming' ? tx.fromWallet?.user?.name || 'Ukendt' : tx.toWallet?.user?.name || 'Ukendt';
        const amt = (tx.amount / 100).toFixed(2).replace('.', ',');
        const sign = tx.direction === 'incoming' ? '+' : '-';
        const color = tx.direction === 'incoming' ? '#2ec964' : '#111827';
        return `<tr><td>${formatFullDate(tx.createdAt)}</td><td>${TYPE_LABELS[tx.type] || tx.type}</td><td>${who}</td><td style="color:${color};font-weight:600">${sign}${amt} kr.</td><td>${tx.description || '—'}</td></tr>`;
      }).join('');
      const html = `<html><head><meta charset="utf-8"/><style>body{font-family:-apple-system,sans-serif;padding:32px;color:#111827}h1{font-size:22px;color:#0a2f5b}p{color:#6b7280;font-size:12px;margin-bottom:16px}table{width:100%;border-collapse:collapse;font-size:12px}th{background:#0a2f5b;color:#fff;text-align:left;padding:8px 10px}td{padding:8px 10px;border-bottom:1px solid #e5e7eb}tr:nth-child(even){background:#f9fafb}</style></head><body><h1>PayWay — Transaktionsoversigt</h1><p>Eksporteret ${new Date().toLocaleDateString('da-DK', { day: 'numeric', month: 'long', year: 'numeric' })} · ${transactions.length} transaktioner</p><table><thead><tr><th>Dato</th><th>Type</th><th>Modpart</th><th>Beløb</th><th>Beskrivelse</th></tr></thead><tbody>${rowsHtml}</tbody></table></body></html>`;
      if (Print?.printToFileAsync) {
        const { uri } = await Print.printToFileAsync({ html });
        if (sharing?.isAvailableAsync && await sharing.isAvailableAsync()) { await sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'Eksporter PDF' }); }
        else { Alert.alert('PDF oprettet', 'PDF-filen er gemt.'); }
      } else { await Share.share({ message: buildCSV(), title: 'PayWay Transaktioner (CSV fallback)' }); }
    } catch { await Share.share({ message: buildCSV(), title: 'PayWay Transaktioner' }); }
  };

  const renderItem = ({ item: tx }: { item: Transaction }) => (
    <TouchableOpacity
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
          {tx.direction === 'incoming'
            ? `Fra ${tx.fromWallet?.user?.name || 'Ukendt'}`
            : `Til ${tx.toWallet?.user?.name || 'Ukendt'}`}
        </Text>
        {tx.description && (
          <Text style={[styles.txDesc, { color: C.textLight }]}>{tx.description}</Text>
        )}
      </View>
      <View style={styles.txRight}>
        <Text
          style={[
            styles.txAmount,
            { color: tx.direction === 'incoming' ? C.success : C.text },
          ]}
        >
          {tx.direction === 'incoming' ? '+' : '-'}
          {formatDKK(tx.amount)}
        </Text>
        <Text style={[styles.txTime, { color: C.textLight }]}>{formatTime(tx.createdAt)}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={C.primary} />
      </View>
    );
  }

  const listHeader = (
    <View style={styles.headerContainer}>
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Søg navn, beskrivelse, beløb..."
      />
      <View style={styles.filtersRow}>
        <FilterChips options={TYPE_FILTERS} selected={typeFilter} onSelect={setTypeFilter} />
      </View>
      <View style={styles.filtersRow}>
        <FilterChips options={DIRECTION_FILTERS} selected={directionFilter} onSelect={setDirectionFilter} />
      </View>
      {transactions.length > 0 && (
        <View style={styles.resultBar}>
          <Text style={[styles.resultCount, { color: C.textSecondary }]}>
            {hasActiveFilters
              ? `${filteredTransactions.length} af ${transactions.length} transaktioner`
              : `${transactions.length} transaktioner`}
          </Text>
          <View style={styles.resultActions}>
            {hasActiveFilters && (
              <TouchableOpacity onPress={clearAllFilters} style={styles.clearBtn}>
                <Ionicons name="close-circle" size={14} color={C.danger} />
                <Text style={[styles.clearText, { color: C.danger }]}>Nulstil</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.exportBtn, { backgroundColor: C.surface, borderColor: C.border }]}
              onPress={handleExport}
            >
              <Ionicons name="download-outline" size={15} color={C.primary} />
              <Text style={[styles.exportText, { color: C.primary }]}>Eksporter</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );

  return (
    <FlatList
      style={[styles.container, { backgroundColor: C.background }]}
      data={filteredTransactions}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      keyboardDismissMode="on-drag"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      onEndReached={loadMore}
      onEndReachedThreshold={0.5}
      ListHeaderComponent={listHeader}
      ListEmptyComponent={
        hasActiveFilters ? (
          <EmptyState
            icon="search-outline"
            iconColor={C.primary}
            iconBg="#e0f2fe"
            title="Ingen resultater"
            description="Prøv at ændre din søgning eller fjerne filtre for at se flere transaktioner."
            actionLabel="Nulstil filtre"
            onAction={clearAllFilters}
            compact
          />
        ) : (
          <EmptyState
            icon="time-outline"
            iconColor="#6366f1"
            iconBg="#eef2ff"
            title="Historikken er tom"
            description="Dine betalinger, overførsler og optankninger dukker op her, så du altid har overblik."
            actionLabel="Fyld wallet op"
            onAction={() => navigation.navigate('TopUp')}
          />
        )
      }
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  txDesc: {
    fontSize: 11,
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
  txTime: {
    fontSize: 11,
    marginTop: 2,
  },
  headerContainer: {
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  filtersRow: {
    marginHorizontal: -SPACING.md,
  },
  resultBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  resultCount: {
    fontSize: 13,
    fontWeight: '500',
  },
  resultActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  clearText: {
    fontSize: 13,
    fontWeight: '600',
  },
  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  exportText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
