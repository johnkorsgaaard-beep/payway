import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { SPACING } from '../utils/constants';
import { useColors } from '../utils/theme';
import { formatDKK } from '../utils/format';

interface Member {
  id: string;
  name: string;
  paid: number;
  owes: number;
  balance: number;
  isYou: boolean;
}

interface Expense {
  id: string;
  title: string;
  amount: number;
  paidBy: string;
  date: string;
}

const MOCK_MEMBERS: Record<string, Member[]> = {
  g1: [
    { id: 'm1', name: 'Dig', paid: 15000, owes: 19500, balance: -4500, isYou: true },
    { id: 'm2', name: 'Magnus Hansen', paid: 25000, owes: 19500, balance: 5500, isYou: false },
    { id: 'm3', name: 'Sara Petersen', paid: 22500, owes: 19500, balance: 3000, isYou: false },
    { id: 'm4', name: 'Jónas Djurhuus', paid: 17500, owes: 19500, balance: -2000, isYou: false },
    { id: 'm5', name: 'Anna Olsen', paid: 17500, owes: 19500, balance: -2000, isYou: false },
  ],
  g2: [
    { id: 'm1', name: 'Dig', paid: 45000, owes: 30000, balance: 15000, isYou: true },
    { id: 'm2', name: 'Eirikur Joensen', paid: 25000, owes: 30000, balance: -5000, isYou: false },
    { id: 'm3', name: 'Katrin Danielsen', paid: 30000, owes: 30000, balance: 0, isYou: false },
    { id: 'm4', name: 'Magnus Hansen', paid: 20000, owes: 30000, balance: -10000, isYou: false },
  ],
  g3: [
    { id: 'm1', name: 'Dig', paid: 15000, owes: 15000, balance: 0, isYou: true },
    { id: 'm2', name: 'Sara Petersen', paid: 15000, owes: 15000, balance: 0, isYou: false },
    { id: 'm3', name: 'Anna Olsen', paid: 15000, owes: 15000, balance: 0, isYou: false },
  ],
};

const MOCK_EXPENSES: Record<string, Expense[]> = {
  g1: [
    { id: 'e1', title: 'Første runde', amount: 25000, paidBy: 'Magnus Hansen', date: '1. apr' },
    { id: 'e2', title: 'Snacks', amount: 7500, paidBy: 'Dig', date: '1. apr' },
    { id: 'e3', title: 'Anden runde', amount: 22500, paidBy: 'Sara Petersen', date: '1. apr' },
    { id: 'e4', title: 'Taxi hjem', amount: 17500, paidBy: 'Jónas Djurhuus', date: '2. apr' },
    { id: 'e5', title: 'Morgenmad', amount: 25000, paidBy: 'Anna Olsen', date: '2. apr' },
  ],
  g2: [
    { id: 'e1', title: 'Flybilletter', amount: 45000, paidBy: 'Dig', date: '20. mar' },
    { id: 'e2', title: 'Hotel (3 nætter)', amount: 36000, paidBy: 'Katrin Danielsen', date: '22. mar' },
    { id: 'e3', title: 'Leje af bil', amount: 19000, paidBy: 'Eirikur Joensen', date: '23. mar' },
    { id: 'e4', title: 'Restaurant', amount: 20000, paidBy: 'Magnus Hansen', date: '24. mar' },
  ],
  g3: [
    { id: 'e1', title: 'Husleje april', amount: 45000, paidBy: 'Dig', date: '1. apr' },
  ],
};

export function GroupDetailScreen({ route, navigation }: any) {
  const C = useColors();
  const { group } = route.params;
  const members = MOCK_MEMBERS[group.id] || [];
  const [expenses, setExpenses] = useState(MOCK_EXPENSES[group.id] || []);
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [receiptImage, setReceiptImage] = useState<string | null>(null);

  const pickReceipt = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Tilladelse påkrævet', 'Vi har brug for adgang til dit fotobibliotek.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      setReceiptImage(result.assets[0].uri);
    }
  };

  const takeReceipt = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Tilladelse påkrævet', 'Vi har brug for adgang til dit kamera.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.7 });
    if (!result.canceled && result.assets[0]) {
      setReceiptImage(result.assets[0].uri);
    }
  };

  const showReceiptOptions = () => {
    Alert.alert('Kvittering', 'Tilføj billede af kvittering', [
      { text: 'Tag billede', onPress: takeReceipt },
      { text: 'Vælg fra bibliotek', onPress: pickReceipt },
      { text: 'Annuller', style: 'cancel' },
    ]);
  };

  const handleAddExpense = () => {
    if (!newTitle.trim()) {
      Alert.alert('Fejl', 'Giv udgiften en titel');
      return;
    }
    const amountNum = parseFloat(newAmount);
    if (!amountNum || amountNum <= 0) {
      Alert.alert('Fejl', 'Indtast et gyldigt beløb');
      return;
    }
    const expense: Expense = {
      id: `e-${Date.now()}`,
      title: newTitle.trim(),
      amount: Math.round(amountNum * 100),
      paidBy: 'Dig',
      date: 'Nu',
    };
    setExpenses([expense, ...expenses]);
    setNewTitle('');
    setNewAmount('');
    setReceiptImage(null);
    setShowForm(false);
  };

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const splitType = 'Lige deling';

  return (
    <ScrollView style={[styles.container, { backgroundColor: C.background }]} contentContainerStyle={styles.content}>
      {/* Group Header */}
      <View style={styles.header}>
        <View style={styles.headerEmoji}>
          <Text style={styles.emoji}>{group.emoji}</Text>
        </View>
        <Text style={[styles.headerTitle, { color: C.text }]}>{group.name}</Text>
        <Text style={[styles.headerSub, { color: C.textSecondary }]}>
          {members.length} medlemmer · {splitType}
        </Text>
        <View style={[styles.totalCard, { backgroundColor: C.primary }]}>
          <Text style={styles.totalLabel}>Samlede udgifter</Text>
          <Text style={styles.totalAmount}>{formatDKK(totalExpenses)}</Text>
        </View>
      </View>

      {/* Members */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: C.text }]}>Medlemmer</Text>
        {members.map((member) => (
          <View key={member.id} style={[styles.memberRow, { backgroundColor: C.surface, borderColor: C.borderLight }]}>
            <View style={[styles.memberAvatar, { backgroundColor: C.primary }, member.isYou && styles.memberAvatarYou]}>
              <Text style={styles.memberAvatarText}>
                {member.isYou ? '🙋' : member.name.charAt(0)}
              </Text>
            </View>
            <View style={styles.memberInfo}>
              <Text style={[styles.memberName, { color: C.text }]}>
                {member.name}{member.isYou ? ' (dig)' : ''}
              </Text>
              <Text style={[styles.memberPaid, { color: C.textSecondary }]}>
                Betalt: {formatDKK(member.paid)}
              </Text>
            </View>
            <View style={styles.memberBalanceCol}>
              {member.balance === 0 ? (
                <View style={styles.settledBadge}>
                  <Ionicons name="checkmark-circle" size={14} color={C.success} />
                  <Text style={[styles.settledText, { color: C.success }]}>Settled</Text>
                </View>
              ) : (
                <Text style={[
                  styles.memberBalance,
                  member.balance > 0 ? { color: C.success } : { color: C.danger },
                ]}>
                  {member.balance > 0
                    ? `+${formatDKK(member.balance)}`
                    : `-${formatDKK(Math.abs(member.balance))}`}
                </Text>
              )}
              <Text style={[styles.memberOwes, { color: C.textLight }]}>
                Andel: {formatDKK(member.owes)}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Expenses */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: C.text }]}>Udgifter</Text>
          <TouchableOpacity style={styles.addExpenseBtn} onPress={() => setShowForm(!showForm)}>
            <Ionicons name={showForm ? 'close-circle' : 'add-circle'} size={20} color={C.primary} />
            <Text style={[styles.addExpenseText, { color: C.primary }]}>{showForm ? 'Luk' : 'Tilføj'}</Text>
          </TouchableOpacity>
        </View>

        {showForm && (
          <View style={[styles.addForm, { backgroundColor: C.surface, borderColor: C.borderLight }]}>
            <TextInput
              style={[styles.addFormInput, { backgroundColor: C.background, color: C.text, borderColor: C.border }]}
              value={newTitle}
              onChangeText={setNewTitle}
              placeholder="Hvad er udgiften?"
              placeholderTextColor={C.textLight}
            />
            <View style={styles.addFormRow}>
              <TextInput
                style={[styles.addFormInput, { flex: 1, backgroundColor: C.background, color: C.text, borderColor: C.border }]}
                value={newAmount}
                onChangeText={setNewAmount}
                placeholder="Beløb (kr)"
                placeholderTextColor={C.textLight}
                keyboardType="numeric"
              />
              <TouchableOpacity style={[styles.addFormButton, { backgroundColor: C.primary }]} onPress={handleAddExpense}>
                <Ionicons name="checkmark" size={20} color="#fff" />
                <Text style={styles.addFormButtonText}>Tilføj</Text>
              </TouchableOpacity>
            </View>

            {/* Receipt */}
            <TouchableOpacity style={[styles.receiptBtn, { borderColor: C.border }]} onPress={showReceiptOptions}>
              <Ionicons name="camera-outline" size={20} color={C.primary} />
              <Text style={[styles.receiptBtnText, { color: C.primary }]}>
                {receiptImage ? 'Skift kvittering' : 'Tilføj kvittering'}
              </Text>
            </TouchableOpacity>
            {receiptImage && (
              <View style={styles.receiptPreview}>
                <Image source={{ uri: receiptImage }} style={styles.receiptImage} />
                <TouchableOpacity
                  style={styles.receiptRemove}
                  onPress={() => setReceiptImage(null)}
                >
                  <Ionicons name="close-circle" size={24} color={C.danger} />
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {expenses.map((expense) => (
          <View key={expense.id} style={[styles.expenseRow, { backgroundColor: C.surface, borderColor: C.borderLight }]}>
            <View style={styles.expenseIcon}>
              <Ionicons name="receipt-outline" size={18} color={C.primary} />
            </View>
            <View style={styles.expenseInfo}>
              <Text style={[styles.expenseTitle, { color: C.text }]}>{expense.title}</Text>
              <Text style={[styles.expensePaidBy, { color: C.textSecondary }]}>
                Betalt af {expense.paidBy} · {expense.date}
              </Text>
            </View>
            <Text style={[styles.expenseAmount, { color: C.text }]}>{formatDKK(expense.amount)}</Text>
          </View>
        ))}
      </View>

      {/* Settle Up */}
      {members.some((m) => m.isYou && m.balance !== 0) && (
        <TouchableOpacity
          style={[styles.settleButton, { backgroundColor: C.primary }]}
          onPress={() => navigation.navigate('Send')}
        >
          <Ionicons name="swap-horizontal" size={20} color="#fff" />
          <Text style={styles.settleButtonText}>Gør op</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: SPACING.xxl * 2,
  },
  header: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.md,
  },
  headerEmoji: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#e8eef5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  emoji: {
    fontSize: 30,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
  },
  headerSub: {
    fontSize: 14,
    marginTop: 2,
  },
  totalCard: {
    marginTop: SPACING.md,
    borderRadius: 14,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.7)',
  },
  totalAmount: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    marginTop: 2,
  },
  section: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: SPACING.sm,
  },
  addExpenseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: SPACING.sm,
  },
  addExpenseText: {
    fontSize: 14,
    fontWeight: '600',
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  memberAvatarYou: {
    backgroundColor: '#e8eef5',
  },
  memberAvatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 14,
    fontWeight: '600',
  },
  memberPaid: {
    fontSize: 12,
    marginTop: 1,
  },
  memberBalanceCol: {
    alignItems: 'flex-end',
  },
  memberBalance: {
    fontSize: 14,
    fontWeight: '700',
  },
  memberOwes: {
    fontSize: 11,
    marginTop: 1,
  },
  settledBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  settledText: {
    fontSize: 13,
    fontWeight: '600',
  },
  expenseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
  },
  expenseIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#e8eef5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  expenseInfo: {
    flex: 1,
  },
  expenseTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  expensePaidBy: {
    fontSize: 12,
    marginTop: 1,
  },
  expenseAmount: {
    fontSize: 15,
    fontWeight: '700',
  },
  addForm: {
    borderRadius: 14,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    gap: SPACING.sm,
  },
  addFormInput: {
    borderRadius: 10,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    fontSize: 15,
    fontWeight: '500',
    borderWidth: 1,
  },
  addFormRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  addFormButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 10,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
  },
  addFormButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  receiptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderStyle: 'dashed',
  },
  receiptBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  receiptPreview: {
    position: 'relative',
    borderRadius: 10,
    overflow: 'hidden',
  },
  receiptImage: {
    width: '100%',
    height: 180,
    borderRadius: 10,
  },
  receiptRemove: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 12,
  },
  settleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginHorizontal: SPACING.md,
    borderRadius: 14,
    paddingVertical: 16,
  },
  settleButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
