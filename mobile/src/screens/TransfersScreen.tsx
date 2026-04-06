import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SPACING } from '../utils/constants';
import { useColors } from '../utils/theme';
import { formatDKK } from '../utils/format';

interface PersonSummary {
  id: string;
  name: string;
  tag?: string;
  avatar?: string;
  lastMessage: string;
  lastAmount: number;
  lastDirection: 'sent' | 'received';
  lastDate: string;
  netBalance: number;
}

interface GroupSummary {
  id: string;
  name: string;
  emoji: string;
  members: number;
  myBalance: number;
  lastActivity: string;
}

const MOCK_PERSONS: PersonSummary[] = [
  { id: '1', name: 'Magnus Hansen', tag: 'magnus.h', lastMessage: 'Tak for mad!', lastAmount: 15000, lastDirection: 'sent', lastDate: '30 min', netBalance: -7500 },
  { id: '2', name: 'Sara Petersen', tag: 'sarap', lastMessage: 'Biografbilletter', lastAmount: 7500, lastDirection: 'received', lastDate: '3 timer', netBalance: 12500 },
  { id: '3', name: 'Jónas Djurhuus', tag: 'jonas.d', lastMessage: 'Kaffe ☕', lastAmount: 2500, lastDirection: 'sent', lastDate: '1 dag', netBalance: -2500 },
  { id: '4', name: 'Anna Olsen', tag: 'anna.o', lastMessage: '', lastAmount: 12000, lastDirection: 'received', lastDate: '2 dage', netBalance: 12000 },
  { id: '5', name: 'Eirikur Joensen', tag: 'eirikur', lastMessage: 'Taxi 🚕', lastAmount: 8500, lastDirection: 'sent', lastDate: '3 dage', netBalance: 0 },
  { id: '6', name: 'Katrin Danielsen', tag: 'katrin.d', lastMessage: 'Frokost', lastAmount: 4500, lastDirection: 'received', lastDate: '1 uge', netBalance: 4500 },
];

const MOCK_GROUPS: GroupSummary[] = [
  { id: 'g1', name: 'Fredagsbar', emoji: '🍻', members: 5, myBalance: -4500, lastActivity: '2 dage' },
  { id: 'g2', name: 'Ferie Spanien', emoji: '✈️', members: 4, myBalance: 15000, lastActivity: '1 uge' },
  { id: 'g3', name: 'Roomies', emoji: '🏠', members: 3, myBalance: 0, lastActivity: '3 dage' },
];

type Tab = 'persons' | 'groups';

export function TransfersScreen({ navigation }: any) {
  const C = useColors();
  const [activeTab, setActiveTab] = useState<Tab>('persons');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 800));
    setRefreshing(false);
  };

  const formatTime = (t: string) => t + ' siden';

  const renderPerson = ({ item }: { item: PersonSummary }) => (
    <TouchableOpacity
      style={[styles.row, { backgroundColor: C.surface, borderColor: C.borderLight }]}
      onPress={() => navigation.navigate('PersonChat', { person: item })}
    >
      <View style={[styles.personAvatar, { backgroundColor: C.primary }]}>
        <Text style={styles.personAvatarText}>
          {item.name.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View style={styles.rowInfo}>
        <View style={styles.rowTop}>
          <Text style={[styles.rowName, { color: C.text }]} numberOfLines={1}>{item.name}</Text>
          <Text style={[styles.rowTime, { color: C.textLight }]}>{formatTime(item.lastDate)}</Text>
        </View>
        {item.tag && <Text style={[styles.rowTag, { color: C.primary }]}>@{item.tag}</Text>}
        <View style={styles.rowBottom}>
          <Text style={[styles.rowMessage, { color: C.textSecondary }]} numberOfLines={1}>
            {item.lastDirection === 'sent' ? '↑ ' : '↓ '}
            {formatDKK(item.lastAmount)}
            {item.lastMessage ? ` · ${item.lastMessage}` : ''}
          </Text>
          {item.netBalance !== 0 && (
            <Text style={[
              styles.rowBalance,
              { color: item.netBalance > 0 ? C.success : C.danger },
            ]}>
              {item.netBalance > 0 ? `+${formatDKK(item.netBalance)}` : formatDKK(Math.abs(item.netBalance))}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderGroup = ({ item }: { item: GroupSummary }) => (
    <TouchableOpacity
      style={[styles.row, { backgroundColor: C.surface, borderColor: C.borderLight }]}
      onPress={() => navigation.navigate('GroupDetail', { group: item })}
    >
      <View style={styles.groupAvatar}>
        <Text style={styles.groupEmoji}>{item.emoji}</Text>
      </View>
      <View style={styles.rowInfo}>
        <View style={styles.rowTop}>
          <Text style={[styles.rowName, { color: C.text }]} numberOfLines={1}>{item.name}</Text>
          <Text style={[styles.rowTime, { color: C.textLight }]}>{formatTime(item.lastActivity)}</Text>
        </View>
        <View style={styles.rowBottom}>
          <Text style={[styles.rowMessage, { color: C.textSecondary }]}>
            {item.members} medlemmer
          </Text>
          {item.myBalance !== 0 ? (
            <Text style={[
              styles.rowBalance,
              { color: item.myBalance > 0 ? C.success : C.danger },
            ]}>
              {item.myBalance > 0
                ? `Du har ${formatDKK(item.myBalance)} til gode`
                : `Du skylder ${formatDKK(Math.abs(item.myBalance))}`}
            </Text>
          ) : (
            <Text style={[styles.balanceSettled, { color: C.success }]}>Settled ✓</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: C.background }]}>
      {/* Tab Switcher */}
      <View style={[styles.tabBar, { backgroundColor: C.borderLight }]}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'persons' && styles.tabActive, activeTab === 'persons' && { backgroundColor: C.surface }]}
          onPress={() => setActiveTab('persons')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'persons' ? C.text : C.textSecondary }]}>
            Personer
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'groups' && styles.tabActive, activeTab === 'groups' && { backgroundColor: C.surface }]}
          onPress={() => setActiveTab('groups')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'groups' ? C.text : C.textSecondary }]}>
            Grupper
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'persons' ? (
        <FlatList
          data={MOCK_PERSONS}
          renderItem={renderPerson}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="people-outline" size={48} color={C.textLight} />
              <Text style={[styles.emptyText, { color: C.textSecondary }]}>Ingen overførsler endnu</Text>
            </View>
          }
        />
      ) : (
        <>
          <FlatList
            data={MOCK_GROUPS}
            renderItem={renderGroup}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Ionicons name="people-circle-outline" size={48} color={C.textLight} />
                <Text style={[styles.emptyText, { color: C.textSecondary }]}>Ingen grupper endnu</Text>
              </View>
            }
          />
          <TouchableOpacity
            style={[styles.fab, { backgroundColor: C.primary }]}
            onPress={() => navigation.navigate('CreateGroup')}
          >
            <Ionicons name="add" size={28} color="#fff" />
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: SPACING.md,
    marginTop: SPACING.sm,
    marginBottom: SPACING.sm,
    borderRadius: 12,
    padding: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  list: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
  },
  personAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  personAvatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  groupAvatar: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#e8eef5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  groupEmoji: {
    fontSize: 22,
  },
  rowInfo: {
    flex: 1,
  },
  rowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  rowName: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
    marginRight: SPACING.sm,
  },
  rowTime: {
    fontSize: 12,
  },
  rowTag: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 2,
  },
  rowBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowMessage: {
    fontSize: 13,
    flex: 1,
    marginRight: SPACING.sm,
  },
  rowBalance: {
    fontSize: 12,
    fontWeight: '600',
  },
  balanceSettled: {
    fontSize: 12,
    fontWeight: '600',
  },
  empty: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl * 2,
    gap: SPACING.sm,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: SPACING.xl,
    right: SPACING.md,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
});
