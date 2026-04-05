import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SPACING } from '../utils/constants';
import { useColors } from '../utils/theme';
import {
  useScheduledPayments,
  computeNextDate,
  type Frequency,
} from '../store/scheduledPayments';

const FREQUENCIES: { key: Frequency; label: string; desc: string }[] = [
  { key: 'once', label: 'Én gang', desc: 'Planlagt enkeltbetaling' },
  { key: 'weekly', label: 'Ugentlig', desc: 'Samme dag hver uge' },
  { key: 'biweekly', label: 'Hver 2. uge', desc: 'Hver anden uge' },
  { key: 'monthly', label: 'Månedlig', desc: 'Samme dato hver måned' },
];

const WEEKDAYS = ['Søn', 'Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør'];

export function CreateScheduledPaymentScreen({ navigation, route }: any) {
  const C = useColors();
  const s = makeStyles(C);
  const { addPayment } = useScheduledPayments();
  const editing = route?.params?.payment;

  const [recipient, setRecipient] = useState(
    editing ? (editing.recipientTag ? `@${editing.recipientTag}` : editing.recipientPhone || '') : '',
  );
  const [recipientName, setRecipientName] = useState(editing?.recipientName || '');
  const [amount, setAmount] = useState(editing ? String(editing.amount / 100) : '');
  const [description, setDescription] = useState(editing?.description || '');
  const [frequency, setFrequency] = useState<Frequency>(editing?.frequency || 'monthly');
  const [dayOfMonth, setDayOfMonth] = useState(editing?.dayOfMonth || 1);
  const [dayOfWeek, setDayOfWeek] = useState(editing?.dayOfWeek || 1);

  const handleSave = async () => {
    if (!recipient.trim()) {
      Alert.alert('Fejl', 'Indtast en modtager');
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Fejl', 'Indtast et gyldigt beløb');
      return;
    }

    const isTag = recipient.startsWith('@');
    const next = computeNextDate(frequency, dayOfMonth, dayOfWeek);

    await addPayment({
      recipientName: recipientName || recipient,
      recipientTag: isTag ? recipient.replace(/^@/, '') : undefined,
      recipientPhone: !isTag ? recipient : undefined,
      amount: Math.round(parseFloat(amount) * 100),
      description,
      frequency,
      dayOfMonth: frequency === 'monthly' ? dayOfMonth : undefined,
      dayOfWeek: frequency === 'weekly' || frequency === 'biweekly' ? dayOfWeek : undefined,
      nextDate: next.toISOString(),
      active: true,
    });

    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      style={[s.container, { backgroundColor: C.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
        <Text style={[s.heading, { color: C.text }]}>
          {editing ? 'Rediger betaling' : 'Ny planlagt betaling'}
        </Text>
        <Text style={[s.subheading, { color: C.textSecondary }]}>
          Opret en automatisk betaling der kører på en fast dato.
        </Text>

        {/* Recipient */}
        <Text style={[s.label, { color: C.textSecondary }]}>Modtager</Text>
        <TextInput
          style={[s.input, { backgroundColor: C.surface, borderColor: C.border, color: C.text }]}
          value={recipient}
          onChangeText={setRecipient}
          placeholder="@tag eller +298 XXXXXX"
          placeholderTextColor={C.textLight}
          autoCapitalize="none"
        />
        <TextInput
          style={[s.input, { backgroundColor: C.surface, borderColor: C.border, color: C.text }]}
          value={recipientName}
          onChangeText={setRecipientName}
          placeholder="Navn (valgfrit)"
          placeholderTextColor={C.textLight}
        />

        {/* Amount */}
        <Text style={[s.label, { color: C.textSecondary }]}>Beløb (DKK)</Text>
        <TextInput
          style={[s.input, s.amountInput, { backgroundColor: C.surface, borderColor: C.border, color: C.text }]}
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
          placeholder="0,00"
          placeholderTextColor={C.textLight}
          textAlign="center"
        />

        {/* Description */}
        <Text style={[s.label, { color: C.textSecondary }]}>Beskrivelse</Text>
        <TextInput
          style={[s.input, { backgroundColor: C.surface, borderColor: C.border, color: C.text }]}
          value={description}
          onChangeText={setDescription}
          placeholder="F.eks. Husleje, Netflix, osv."
          placeholderTextColor={C.textLight}
          maxLength={100}
        />

        {/* Frequency */}
        <Text style={[s.label, { color: C.textSecondary }]}>Hyppighed</Text>
        <View style={s.freqGrid}>
          {FREQUENCIES.map((f) => (
            <TouchableOpacity
              key={f.key}
              style={[
                s.freqCard,
                { backgroundColor: C.surface, borderColor: C.border },
                frequency === f.key && { borderColor: C.accent, backgroundColor: C.accent + '10' },
              ]}
              onPress={() => setFrequency(f.key)}
              activeOpacity={0.7}
            >
              <View style={s.freqHeader}>
                <View
                  style={[
                    s.freqRadio,
                    { borderColor: C.border },
                    frequency === f.key && { borderColor: C.accent, backgroundColor: C.accent },
                  ]}
                >
                  {frequency === f.key && <View style={s.freqRadioDot} />}
                </View>
                <Text
                  style={[
                    s.freqLabel,
                    { color: C.text },
                    frequency === f.key && { color: C.accent },
                  ]}
                >
                  {f.label}
                </Text>
              </View>
              <Text style={[s.freqDesc, { color: C.textLight }]}>{f.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Day picker */}
        {frequency === 'monthly' && (
          <>
            <Text style={[s.label, { color: C.textSecondary }]}>Dag i måneden</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.dayRow}>
              {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => (
                <TouchableOpacity
                  key={d}
                  style={[
                    s.dayChip,
                    { backgroundColor: C.surface, borderColor: C.border },
                    dayOfMonth === d && { backgroundColor: C.accent, borderColor: C.accent },
                  ]}
                  onPress={() => setDayOfMonth(d)}
                >
                  <Text
                    style={[
                      s.dayChipText,
                      { color: C.text },
                      dayOfMonth === d && { color: '#fff' },
                    ]}
                  >
                    {d}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}

        {(frequency === 'weekly' || frequency === 'biweekly') && (
          <>
            <Text style={[s.label, { color: C.textSecondary }]}>Ugedag</Text>
            <View style={s.weekRow}>
              {WEEKDAYS.map((name, i) => (
                <TouchableOpacity
                  key={i}
                  style={[
                    s.weekChip,
                    { backgroundColor: C.surface, borderColor: C.border },
                    dayOfWeek === i && { backgroundColor: C.accent, borderColor: C.accent },
                  ]}
                  onPress={() => setDayOfWeek(i)}
                >
                  <Text
                    style={[
                      s.weekChipText,
                      { color: C.text },
                      dayOfWeek === i && { color: '#fff' },
                    ]}
                  >
                    {name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {frequency === 'once' && (
          <View style={[s.infoBox, { backgroundColor: C.primary + '10', borderColor: C.primary + '30' }]}>
            <Ionicons name="information-circle" size={18} color={C.primary} />
            <Text style={[s.infoText, { color: C.primary }]}>
              Betalingen sendes automatisk i morgen. Du kan ændre datoen senere.
            </Text>
          </View>
        )}

        {/* Summary */}
        {amount && recipient.trim() && (
          <View style={[s.summaryCard, { backgroundColor: C.surface, borderColor: C.border }]}>
            <Ionicons name="calendar" size={20} color={C.accent} />
            <Text style={[s.summaryText, { color: C.text }]}>
              {parseFloat(amount).toLocaleString('da-DK', { minimumFractionDigits: 2 })} kr.{' '}
              {frequency === 'once' ? 'sendes én gang' : `sendes ${FREQUENCIES.find((f) => f.key === frequency)?.label.toLowerCase()}`}{' '}
              til {recipientName || recipient}
              {frequency === 'monthly' ? ` d. ${dayOfMonth}.` : ''}
              {(frequency === 'weekly' || frequency === 'biweekly') ? ` (${WEEKDAYS[dayOfWeek]})` : ''}
            </Text>
          </View>
        )}

        <TouchableOpacity style={[s.button, { backgroundColor: C.accent }]} onPress={handleSave}>
          <Ionicons name="checkmark-circle" size={20} color="#fff" />
          <Text style={s.buttonText}>{editing ? 'Gem ændringer' : 'Opret betaling'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function makeStyles(C: any) {
  return StyleSheet.create({
    container: { flex: 1 },
    content: { padding: SPACING.xl, paddingBottom: SPACING.xxl * 2 },
    heading: { fontSize: 24, fontWeight: '800', marginBottom: SPACING.xs },
    subheading: { fontSize: 14, lineHeight: 20, marginBottom: SPACING.lg },
    label: { fontSize: 14, fontWeight: '600', marginBottom: SPACING.xs, marginTop: SPACING.md },
    input: {
      borderWidth: 1, borderRadius: 12,
      paddingHorizontal: SPACING.md, paddingVertical: 14, fontSize: 16,
    },
    amountInput: { fontSize: 28, fontWeight: '700', paddingVertical: 18 },
    freqGrid: { gap: SPACING.sm },
    freqCard: {
      borderWidth: 1.5, borderRadius: 14,
      padding: SPACING.md, gap: 4,
    },
    freqHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
    freqRadio: {
      width: 20, height: 20, borderRadius: 10, borderWidth: 2,
      justifyContent: 'center', alignItems: 'center',
    },
    freqRadioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#fff' },
    freqLabel: { fontSize: 15, fontWeight: '700' },
    freqDesc: { fontSize: 12, marginLeft: 32 },
    dayRow: { gap: 6, paddingVertical: SPACING.xs },
    dayChip: {
      width: 40, height: 40, borderRadius: 20, borderWidth: 1,
      justifyContent: 'center', alignItems: 'center',
    },
    dayChipText: { fontSize: 14, fontWeight: '600' },
    weekRow: { flexDirection: 'row', gap: 6 },
    weekChip: {
      flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1,
      alignItems: 'center',
    },
    weekChipText: { fontSize: 13, fontWeight: '600' },
    infoBox: {
      flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
      padding: SPACING.md, borderRadius: 12, borderWidth: 1, marginTop: SPACING.md,
    },
    infoText: { flex: 1, fontSize: 13, lineHeight: 18 },
    summaryCard: {
      flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
      padding: SPACING.md, borderRadius: 14, borderWidth: 1, marginTop: SPACING.lg,
    },
    summaryText: { flex: 1, fontSize: 14, fontWeight: '500', lineHeight: 20 },
    button: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm,
      borderRadius: 14, paddingVertical: 16, marginTop: SPACING.lg,
    },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  });
}
