import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../utils/constants';
import { formatDKK } from '../utils/format';
import { api } from '../services/api';
import { useAuth } from '../store/auth';

let stripeNative: any = null;
try {
  stripeNative = require('@stripe/stripe-react-native');
} catch {}

function useApplePaySafe() {
  if (stripeNative?.useApplePay) {
    return stripeNative.useApplePay();
  }
  return {
    isApplePaySupported: false,
    presentApplePay: async () => ({ error: { code: 'Unavailable', message: 'Apple Pay not available' } }),
    confirmApplePayPayment: async () => ({ error: { code: 'Unavailable', message: 'Apple Pay not available' } }),
  };
}

const QUICK_AMOUNTS = [5000, 10000, 20000, 50000, 100000];

interface Card {
  id: string;
  brand: string;
  last4: string;
  isDefault: boolean;
}

type PayMethod = 'apple_pay' | 'card';

export function TopUpScreen({ navigation }: any) {
  const [amount, setAmount] = useState('');
  const [cards, setCards] = useState<Card[]>([]);
  const [selectedCard, setSelectedCard] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [payMethod, setPayMethod] = useState<PayMethod>('apple_pay');
  const { refreshUser } = useAuth();
  const { isApplePaySupported, presentApplePay, confirmApplePayPayment } = useApplePaySafe();
  const applePayAvailable = isApplePaySupported && !!stripeNative;

  useEffect(() => {
    api
      .get<Card[]>('/cards')
      .then((res) => {
        setCards(res);
        const defaultCard = res.find((c) => c.isDefault);
        if (defaultCard) setSelectedCard(defaultCard.id);
        else if (res.length > 0) setSelectedCard(res[0].id);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setPayMethod('apple_pay');
  }, []);

  const amountOere = parseInt(amount || '0') * 100;

  const handleApplePayTopUp = async () => {
    if (!amount || amountOere <= 0) {
      Alert.alert('Fejl', 'Indtast et beløb');
      return;
    }

    if (!applePayAvailable) {
      Alert.alert(
        'Apple Pay',
        'Apple Pay kræver et production build. I demo-tilstand kan du bruge betalingskort.',
        [{ text: 'OK' }]
      );
      return;
    }

    setLoading(true);
    try {
      const { clientSecret, paymentIntentId } = await api.post<{
        clientSecret: string;
        paymentIntentId: string;
      }>('/wallet/topup/intent', { amount: amountOere, paymentCardId: 'apple_pay' });

      const { error: applePayError } = await presentApplePay({
        cartItems: [
          { label: 'Payway optankning', amount: (amountOere / 100).toFixed(2), paymentType: 'Immediate' },
        ],
        country: 'DK',
        currency: 'DKK',
      });

      if (applePayError) {
        if (applePayError.code !== 'Canceled') {
          Alert.alert('Fejl', applePayError.message);
        }
        setLoading(false);
        return;
      }

      const { error: confirmError } = await confirmApplePayPayment(clientSecret);

      if (confirmError) {
        Alert.alert('Fejl', confirmError.message);
        setLoading(false);
        return;
      }

      await api.post('/wallet/topup/confirm', {
        paymentIntentId,
        amount: amountOere,
      });

      await refreshUser();

      Alert.alert('Optanket!', `${formatDKK(amountOere)} er tilføjet din wallet`, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      Alert.alert('Fejl', err.message || 'Apple Pay fejlede');
    } finally {
      setLoading(false);
    }
  };

  const handleCardTopUp = async () => {
    if (!amount || amountOere <= 0) {
      Alert.alert('Fejl', 'Indtast et beløb');
      return;
    }
    if (!selectedCard) {
      Alert.alert('Fejl', 'Tilføj et betalingskort først');
      return;
    }

    setLoading(true);
    try {
      await api.post('/wallet/topup', {
        amount: amountOere,
        paymentCardId: selectedCard,
      });

      await refreshUser();

      Alert.alert('Optanket!', `${formatDKK(amountOere)} er tilføjet din wallet`, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      Alert.alert('Fejl', err.message || 'Optankning fejlede');
    } finally {
      setLoading(false);
    }
  };

  const handleTopUp = payMethod === 'apple_pay' ? handleApplePayTopUp : handleCardTopUp;

  const canSubmit =
    amount &&
    parseInt(amount) > 0 &&
    (payMethod === 'apple_pay' || selectedCard);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.banner}>
          <View style={styles.bannerIcon}>
            <Ionicons name="wallet" size={32} color="#fff" />
          </View>
          <Text style={styles.bannerTitle}>Fyld op</Text>
          <Text style={styles.bannerSub}>Tilføj penge til din Payway wallet</Text>
        </View>

        <Text style={styles.label}>Beløb (DKK)</Text>
        <TextInput
          style={[styles.input, styles.amountInput]}
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
          placeholder="0"
          placeholderTextColor={COLORS.textLight}
          textAlign="center"
        />

        <View style={styles.quickAmounts}>
          {QUICK_AMOUNTS.map((qa) => (
            <TouchableOpacity
              key={qa}
              style={[
                styles.quickButton,
                amount === (qa / 100).toString() && styles.quickButtonActive,
              ]}
              onPress={() => setAmount((qa / 100).toString())}
            >
              <Text
                style={[
                  styles.quickText,
                  amount === (qa / 100).toString() && styles.quickTextActive,
                ]}
              >
                {qa / 100} kr
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Payment method selector */}
        <Text style={[styles.label, { marginTop: SPACING.lg }]}>Betalingsmetode</Text>
        <View style={styles.methodRow}>
          <TouchableOpacity
            style={[styles.methodOption, payMethod === 'apple_pay' && styles.methodActive]}
            onPress={() => setPayMethod('apple_pay')}
          >
            <Ionicons
              name="logo-apple"
              size={22}
              color={payMethod === 'apple_pay' ? '#000' : COLORS.textSecondary}
            />
            <Text style={[styles.methodText, payMethod === 'apple_pay' && styles.methodTextActive]}>
              Apple Pay
            </Text>
            {payMethod === 'apple_pay' && (
              <Ionicons name="checkmark-circle" size={18} color={COLORS.accent} />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.methodOption, payMethod === 'card' && styles.methodActive]}
            onPress={() => setPayMethod('card')}
          >
            <Ionicons
              name="card"
              size={22}
              color={payMethod === 'card' ? COLORS.accent : COLORS.textSecondary}
            />
            <Text style={[styles.methodText, payMethod === 'card' && styles.methodTextActive]}>
              Betalingskort
            </Text>
            {payMethod === 'card' && (
              <Ionicons name="checkmark-circle" size={18} color={COLORS.accent} />
            )}
          </TouchableOpacity>
        </View>

        {/* Card selector (only for card method) */}
        {payMethod === 'card' && cards.length > 0 && (
          <View style={styles.cardSection}>
            {cards.map((card) => (
              <TouchableOpacity
                key={card.id}
                style={[styles.cardRow, selectedCard === card.id && styles.cardRowActive]}
                onPress={() => setSelectedCard(card.id)}
              >
                <Ionicons
                  name="card"
                  size={20}
                  color={selectedCard === card.id ? COLORS.accent : COLORS.textSecondary}
                />
                <Text style={[styles.cardText, selectedCard === card.id && styles.cardTextActive]}>
                  {card.brand.toUpperCase()} •••• {card.last4}
                </Text>
                {selectedCard === card.id && (
                  <Ionicons name="checkmark-circle" size={20} color={COLORS.accent} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {payMethod === 'card' && cards.length === 0 && (
          <View style={styles.noCards}>
            <Ionicons name="card-outline" size={32} color={COLORS.textLight} />
            <Text style={styles.noCardsText}>Ingen kort tilføjet</Text>
            <TouchableOpacity
              style={styles.addCardButton}
              onPress={() => navigation.navigate('Cards')}
            >
              <Text style={styles.addCardText}>Tilføj kort</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Pay button */}
        {payMethod === 'apple_pay' ? (
          <TouchableOpacity
            style={[styles.applePayButton, !canSubmit && styles.buttonDisabled]}
            onPress={handleTopUp}
            disabled={loading || !canSubmit}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <View style={styles.applePayContent}>
                <Ionicons name="logo-apple" size={20} color="#fff" />
                <Text style={styles.applePayText}>
                  Betal{amount ? ` ${formatDKK(amountOere)}` : ''} med Apple Pay
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.button, !canSubmit && styles.buttonDisabled]}
            onPress={handleTopUp}
            disabled={loading || !canSubmit}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>
                Fyld op{amount ? ` ${formatDKK(amountOere)}` : ''}
              </Text>
            )}
          </TouchableOpacity>
        )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.xl, paddingBottom: SPACING.xxl * 2 },
  banner: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    padding: SPACING.xl,
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  bannerIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  bannerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
  },
  bannerSub: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.textSecondary, marginBottom: SPACING.xs, marginTop: SPACING.md },
  input: {
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: 12, paddingHorizontal: SPACING.md, paddingVertical: 14,
    fontSize: 16, color: COLORS.text,
  },
  amountInput: { fontSize: 36, fontWeight: '800', paddingVertical: 24 },
  quickAmounts: { flexDirection: 'row', gap: SPACING.xs, marginTop: SPACING.md, flexWrap: 'wrap' },
  quickButton: {
    flex: 1, minWidth: 60, backgroundColor: COLORS.surface, borderWidth: 1,
    borderColor: COLORS.border, borderRadius: 10, paddingVertical: 10, alignItems: 'center',
  },
  quickButtonActive: { backgroundColor: '#e8faf0', borderColor: COLORS.accent },
  quickText: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary },
  quickTextActive: { color: COLORS.accent },
  methodRow: { gap: SPACING.sm },
  methodOption: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: 12, padding: SPACING.md, marginBottom: SPACING.xs,
  },
  methodActive: { borderColor: COLORS.accent, backgroundColor: '#e8faf0' },
  methodText: { flex: 1, fontSize: 15, fontWeight: '600', color: COLORS.textSecondary },
  methodTextActive: { color: COLORS.accent },
  cardSection: { marginTop: SPACING.sm },
  cardRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface,
    borderWidth: 1, borderColor: COLORS.border, borderRadius: 12,
    padding: SPACING.md, marginBottom: SPACING.sm, gap: SPACING.sm,
  },
  cardRowActive: { borderColor: COLORS.accent, backgroundColor: '#e8faf0' },
  cardText: { flex: 1, fontSize: 14, fontWeight: '600', color: COLORS.textSecondary },
  cardTextActive: { color: COLORS.accent },
  noCards: { alignItems: 'center', paddingVertical: SPACING.xl, gap: SPACING.sm },
  noCardsText: { fontSize: 14, color: COLORS.textSecondary },
  addCardButton: { marginTop: SPACING.sm },
  addCardText: { fontSize: 14, fontWeight: '600', color: COLORS.accent },
  button: {
    backgroundColor: COLORS.accent, borderRadius: 12,
    paddingVertical: 16, alignItems: 'center', marginTop: SPACING.lg,
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  applePayButton: {
    backgroundColor: '#000', borderRadius: 12,
    paddingVertical: 16, alignItems: 'center', marginTop: SPACING.lg,
  },
  applePayContent: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  applePayText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
