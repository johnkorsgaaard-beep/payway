import React, { useState, useMemo } from 'react';
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
import { EmptyState } from '../components/EmptyState';
import { SearchBar } from '../components/SearchBar';

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
  const styles = makeStyles(C);
  const [activeTab, setActiveTab] = useState<Tab>('persons');
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPersons = useMemo(() => {
    if (!searchQuery.trim()) return MOCK_PERSONS;
    const q = searchQuery.toLowerCase().trim();
    return MOCK_PERSONS.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.tag && p.tag.toLowerCase().includes(q)) ||
        (p.lastMessage && p.lastMessage.toLowerCase().includes(q)),
    );
  }, [searchQuery]);

  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return MOCK_GROUPS;
    const q = searchQuery.toLowerCase().trim();
    return MOCK_GROUPS.filter(
      (g) =>
        g.name.toLowerCase().includes(q) ||
        g.emoji.includes(q),
    );
  }, [searchQuery]);

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 800));
    setRefreshing(false);
  };

  const formatTime = (t: string) => t + ' siden';

  const renderPerson = ({ item }: { item: PersonSummary }) => (
    <TouchableOpacity
      style={styles.row}
      onPress={() => navigation.navigate('PersonChat', { person: item })}
    >
      <View style={styles.personAvatar}>
        <Text style={styles.personAvatarText}>
          {item.name.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View style={styles.rowInfo}>
        <View style={styles.rowTop}>
          <Text style={styles.rowName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.rowTime}>{formatTime(item.lastDate)}</Text>
        </View>
        {item.tag && <Text style={styles.rowTag}>@{item.tag}</Text>}
        <View style={styles.rowBottom}>
          <Text style={styles.rowMessage} numberOfLines={1}>
            {item.lastDirection === 'sent' ? '↑ ' : '↓ '}
            {formatDKK(item.lastAmount)}
            {item.lastMessage ? ` · ${item.lastMessage}` : ''}
          </Text>
          {item.netBalance !== 0 && (
            <Text style={[
              styles.rowBalance,
              item.netBalance > 0 ? styles.balancePositive : styles.balanceNegative,
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
      style={styles.row}
      onPress={() => navigation.navigate('GroupDetail', { group: item })}
    >
      <View style={styles.groupAvatar}>
        <Text style={styles.groupEmoji}>{item.emoji}</Text>
      </View>
      <View style={styles.rowInfo}>
        <View style={styles.rowTop}>
          <Text style={styles.rowName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.rowTime}>{formatTime(item.lastActivity)}</Text>
        </View>
        <View style={styles.rowBottom}>
          <Text style={styles.rowMessage}>
            {item.members} medlemmer
          </Text>
          {item.myBalance !== 0 ? (
            <Text style={[
              styles.rowBalance,
              item.myBalance > 0 ? styles.balancePositive : styles.balanceNegative,
            ]}>
              {item.myBalance > 0
                ? `Du har ${formatDKK(item.myBalance)} til gode`
                : `Du skylder ${formatDKK(Math.abs(item.myBalance))}`}
            </Text>
          ) : (
            <Text style={styles.balanceSettled}>Settled ✓</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const hasSearchResults = activeTab === 'persons' ? filteredPersons.length > 0 : filteredGroups.length > 0;
  const sourceCount = activeTab === 'persons' ? MOCK_PERSONS.length : MOCK_GROUPS.length;
  const filteredCount = activeTab === 'persons' ? filteredPersons.length : filteredGroups.length;

  const searchHeader = (
    <View style={styles.searchContainer}>
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder={activeTab === 'persons' ? 'Søg navn eller @tag...' : 'Søg gruppenavn...'}
      />
      {searchQuery.trim() !== '' && (
        <Text style={styles.searchCount}>
          {filteredCount} af {sourceCount} {activeTab === 'persons' ? 'personer' : 'grupper'}
        </Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'persons' && styles.tabActive]}
          onPress={() => { setActiveTab('persons'); setSearchQuery(''); }}
        >
          <Text style={[styles.tabText, activeTab === 'persons' && styles.tabTextActive]}>
            Personer
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'groups' && styles.tabActive]}
          onPress={() => { setActiveTab('groups'); setSearchQuery(''); }}
        >
          <Text style={[styles.tabText, activeTab === 'groups' && styles.tabTextActive]}>
            Grupper
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'persons' ? (
        <FlatList
          data={filteredPersons}
          renderItem={renderPerson}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          keyboardDismissMode="on-drag"
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListHeaderComponent={MOCK_PERSONS.length > 0 ? searchHeader : null}
          ListEmptyComponent={
            searchQuery.trim() ? (
              <EmptyState
                icon="search-outline"
                iconColor={C.primary}
                iconBg="#e0f2fe"
                title="Ingen resultater"
                description={`Ingen personer matcher "${searchQuery}". Prøv et andet navn eller @tag.`}
                actionLabel="Ryd søgning"
                onAction={() => setSearchQuery('')}
                compact
              />
            ) : (
              <EmptyState
                icon="send-outline"
                iconColor={C.accent}
                iconBg="#dcfce7"
                title="Ingen overførsler endnu"
                description="Når du sender eller modtager penge, vises dine kontakter her automatisk."
                actionLabel="Send penge"
                onAction={() => navigation.navigate('Send')}
              />
            )
          }
        />
      ) : (
        <>
          <FlatList
            data={filteredGroups}
            renderItem={renderGroup}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            keyboardDismissMode="on-drag"
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            ListHeaderComponent={MOCK_GROUPS.length > 0 ? searchHeader : null}
            ListEmptyComponent={
              searchQuery.trim() ? (
                <EmptyState
                  icon="search-outline"
                  iconColor={C.primary}
                  iconBg="#e0f2fe"
                  title="Ingen resultater"
                  description={`Ingen grupper matcher "${searchQuery}".`}
                  actionLabel="Ryd søgning"
                  onAction={() => setSearchQuery('')}
                  compact
                />
              ) : (
                <EmptyState
                  icon="people-outline"
                  iconColor={C.primary}
                  iconBg="#e0f2fe"
                  title="Ingen grupper endnu"
                  description="Opret en gruppe for at dele udgifter med venner — ferie, middag eller husleje."
                  actionLabel="Opret din første gruppe"
                  onAction={() => navigation.navigate('CreateGroup')}
                />
              )
            }
          />
          <TouchableOpacity
            style={styles.fab}
            onPress={() => navigation.navigate('CreateGroup')}
          >
            <Ionicons name="add" size={28} color="#fff" />
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

function makeStyles(C: any) {
  return StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.background,
  },
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: SPACING.md,
    marginTop: SPACING.sm,
    marginBottom: SPACING.sm,
    backgroundColor: C.borderLight,
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
    backgroundColor: C.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: C.textSecondary,
  },
  tabTextActive: {
    color: C.text,
  },
  searchContainer: {
    marginBottom: SPACING.md,
    gap: SPACING.xs,
  },
  searchCount: {
    fontSize: 12,
    fontWeight: '500',
    color: C.textLight,
    marginTop: 2,
  },
  list: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surface,
    borderRadius: 14,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: C.borderLight,
  },
  personAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: C.primary,
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
    color: C.text,
    flex: 1,
    marginRight: SPACING.sm,
  },
  rowTime: {
    fontSize: 12,
    color: C.textLight,
  },
  rowTag: {
    fontSize: 12,
    fontWeight: '500',
    color: C.primary,
    marginBottom: 2,
  },
  rowBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowMessage: {
    fontSize: 13,
    color: C.textSecondary,
    flex: 1,
    marginRight: SPACING.sm,
  },
  rowBalance: {
    fontSize: 12,
    fontWeight: '600',
  },
  balancePositive: {
    color: C.success,
  },
  balanceNegative: {
    color: C.danger,
  },
  balanceSettled: {
    fontSize: 12,
    fontWeight: '600',
    color: C.success,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl * 2,
    gap: SPACING.sm,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: C.textSecondary,
  },
  fab: {
    position: 'absolute',
    bottom: SPACING.xl,
    right: SPACING.md,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: C.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
});
}
