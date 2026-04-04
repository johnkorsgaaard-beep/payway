import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../utils/constants';
import { formatDKK } from '../utils/format';

interface Transfer {
  id: string;
  amount: number;
  description: string;
  direction: 'sent' | 'received';
  date: string;
  dateLabel: string;
}

const MOCK_CHAT: Record<string, Transfer[]> = {
  '1': [
    { id: 't1', amount: 5000, description: 'Pizza 🍕', direction: 'sent', date: '2026-03-20', dateLabel: '20. mar' },
    { id: 't2', amount: 2500, description: '', direction: 'received', date: '2026-03-22', dateLabel: '22. mar' },
    { id: 't3', amount: 10000, description: 'Koncertbilletter', direction: 'received', date: '2026-03-28', dateLabel: '28. mar' },
    { id: 't4', amount: 7500, description: 'Middag i byen', direction: 'sent', date: '2026-04-01', dateLabel: '1. apr' },
    { id: 't5', amount: 15000, description: 'Tak for mad!', direction: 'sent', date: '2026-04-04', dateLabel: 'I dag' },
  ],
  '2': [
    { id: 't1', amount: 3000, description: 'Kaffe', direction: 'sent', date: '2026-03-15', dateLabel: '15. mar' },
    { id: 't2', amount: 7500, description: 'Biografbilletter', direction: 'received', date: '2026-04-04', dateLabel: 'I dag' },
  ],
  '3': [
    { id: 't1', amount: 4500, description: 'Frokost', direction: 'received', date: '2026-03-25', dateLabel: '25. mar' },
    { id: 't2', amount: 4500, description: '', direction: 'sent', date: '2026-03-27', dateLabel: '27. mar' },
    { id: 't3', amount: 2500, description: 'Kaffe ☕', direction: 'sent', date: '2026-04-03', dateLabel: 'I går' },
  ],
  '4': [
    { id: 't1', amount: 12000, description: '', direction: 'received', date: '2026-04-02', dateLabel: '2. apr' },
  ],
  '5': [
    { id: 't1', amount: 8500, description: 'Taxi 🚕', direction: 'sent', date: '2026-04-01', dateLabel: '1. apr' },
    { id: 't2', amount: 8500, description: 'Taxi tilbage', direction: 'received', date: '2026-04-01', dateLabel: '1. apr' },
  ],
  '6': [
    { id: 't1', amount: 4500, description: 'Frokost', direction: 'received', date: '2026-03-28', dateLabel: '28. mar' },
  ],
};

export function PersonChatScreen({ route, navigation }: any) {
  const { person } = route.params;
  const transfers = MOCK_CHAT[person.id] || [];
  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    navigation.setOptions({ title: person.name });
  }, [person.name, navigation]);

  const totalSent = transfers
    .filter((t) => t.direction === 'sent')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalReceived = transfers
    .filter((t) => t.direction === 'received')
    .reduce((sum, t) => sum + t.amount, 0);
  const netBalance = totalReceived - totalSent;

  const renderTransfer = ({ item, index }: { item: Transfer; index: number }) => {
    const isSent = item.direction === 'sent';
    const prevItem = index > 0 ? transfers[index - 1] : null;
    const showDate = !prevItem || prevItem.dateLabel !== item.dateLabel;

    return (
      <>
        {showDate && (
          <View style={styles.dateRow}>
            <View style={styles.dateLine} />
            <Text style={styles.dateText}>{item.dateLabel}</Text>
            <View style={styles.dateLine} />
          </View>
        )}
        <View style={[styles.bubble, isSent ? styles.bubbleSent : styles.bubbleReceived]}>
          <View style={styles.bubbleHeader}>
            <Ionicons
              name={isSent ? 'arrow-up' : 'arrow-down'}
              size={14}
              color={isSent ? COLORS.primary : COLORS.success}
            />
            <Text style={styles.bubbleDirection}>
              {isSent ? 'Sendt' : 'Modtaget'}
            </Text>
          </View>
          <Text style={[styles.bubbleAmount, isSent ? styles.amountSent : styles.amountReceived]}>
            {isSent ? '-' : '+'}{formatDKK(item.amount)}
          </Text>
          {item.description ? (
            <Text style={[styles.bubbleDesc, isSent && styles.bubbleDescSent]}>{item.description}</Text>
          ) : null}
        </View>
      </>
    );
  };

  return (
    <View style={styles.container}>
      {/* Balance Summary */}
      <View style={styles.summary}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Sendt</Text>
          <Text style={[styles.summaryValue, { color: COLORS.text }]}>
            {formatDKK(totalSent)}
          </Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Modtaget</Text>
          <Text style={[styles.summaryValue, { color: COLORS.success }]}>
            {formatDKK(totalReceived)}
          </Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Balance</Text>
          <Text style={[
            styles.summaryValue,
            netBalance > 0 ? { color: COLORS.success } : netBalance < 0 ? { color: COLORS.danger } : { color: COLORS.textSecondary },
          ]}>
            {netBalance === 0 ? 'Settled ✓' : netBalance > 0 ? `+${formatDKK(netBalance)}` : `-${formatDKK(Math.abs(netBalance))}`}
          </Text>
        </View>
      </View>

      {/* Chat List */}
      <FlatList
        ref={listRef}
        data={transfers}
        renderItem={renderTransfer}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.chatList}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
      />

      {/* Send Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.sendButton}
          onPress={() => navigation.navigate('Send')}
        >
          <Ionicons name="send" size={18} color="#fff" />
          <Text style={styles.sendButtonText}>Send penge</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.requestButton}
          onPress={() => navigation.navigate('Request', { recipient: person.tag ? `@${person.tag}` : person.name })}
        >
          <Ionicons name="download-outline" size={18} color="#fff" />
          <Text style={styles.requestButtonText}>Anmod</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  summary: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.sm,
    borderRadius: 14,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  summaryDivider: {
    width: 1,
    backgroundColor: COLORS.border,
    marginVertical: 2,
  },
  chatList: {
    padding: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.md,
    gap: SPACING.sm,
  },
  dateLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dateText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textLight,
  },
  bubble: {
    maxWidth: '75%',
    borderRadius: 16,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  bubbleSent: {
    alignSelf: 'flex-end',
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 4,
  },
  bubbleReceived: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.surface,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  bubbleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  bubbleDirection: {
    fontSize: 11,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.6)',
  },
  bubbleAmount: {
    fontSize: 20,
    fontWeight: '800',
  },
  amountSent: {
    color: '#fff',
  },
  amountReceived: {
    color: COLORS.success,
  },
  bubbleDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  bubbleDescSent: {
    color: 'rgba(255,255,255,0.6)',
  },
  bottomBar: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    paddingBottom: SPACING.xl,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: SPACING.sm,
  },
  sendButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 14,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  requestButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.accent,
    borderRadius: 14,
    paddingVertical: 14,
  },
  requestButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});
