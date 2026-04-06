import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
  ScrollView,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { SPACING } from '../utils/constants';
import { useColors } from '../utils/theme';
import { formatDKK } from '../utils/format';
import { api } from '../services/api';
import { useAuth } from '../store/auth';

const RECENT_RECIPIENTS = [
  { name: 'Magnus Hansen', tag: 'magnus.h' },
  { name: 'Sara Petersen', tag: 'sarap' },
  { name: 'Jónas Djurhuus', tag: 'jonas.d' },
  { name: 'Anna Olsen', tag: 'anna.o' },
  { name: 'Katrin Danielsen', tag: 'katrin.d' },
];

export function SendScreen({ navigation }: any) {
  const C = useColors();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [pin, setPin] = useState('');
  const [step, setStep] = useState<'details' | 'confirm' | 'success'>('details');
  const [recipientName, setRecipientName] = useState('');
  const [loading, setLoading] = useState(false);
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const { refreshUser } = useAuth();

  const pickReceipt = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Tilladelse påkrævet', 'Vi har brug for adgang til dit fotobibliotek.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.7 });
    if (!result.canceled && result.assets[0]) setReceiptImage(result.assets[0].uri);
  };

  const takeReceipt = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Tilladelse påkrævet', 'Vi har brug for adgang til dit kamera.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.7 });
    if (!result.canceled && result.assets[0]) setReceiptImage(result.assets[0].uri);
  };

  const showReceiptOptions = () => {
    Alert.alert('Kvittering', 'Tilføj billede af kvittering', [
      { text: 'Tag billede', onPress: takeReceipt },
      { text: 'Vælg fra bibliotek', onPress: pickReceipt },
      { text: 'Annuller', style: 'cancel' },
    ]);
  };

  const isTag = recipient.startsWith('@') || (!recipient.startsWith('+') && !/^\d/.test(recipient));
  const phone = isTag ? '' : recipient;

  const lookupRecipient = async () => {
    if (!recipient.trim()) {
      Alert.alert('Fejl', 'Indtast et PayWay-Tag eller telefonnummer');
      return;
    }
    if (!amount || parseInt(amount) <= 0) {
      Alert.alert('Fejl', 'Indtast et gyldigt beløb');
      return;
    }

    try {
      const lookup = isTag
        ? recipient.replace(/^@/, '')
        : recipient;
      const res = await api.get<{ name: string }>(`/wallet/lookup/${lookup}`);
      setRecipientName(res.name);
      setStep('confirm');
    } catch {
      setRecipientName(isTag ? recipient : '');
      setStep('confirm');
    }
  };

  const handleSend = async () => {
    if (pin.length !== 4) {
      Alert.alert('Fejl', 'Indtast din 4-cifrede PIN');
      return;
    }

    setLoading(true);
    try {
      const sendData: any = {
        amount: parseInt(amount) * 100,
        description: description || undefined,
        pin,
      };
      if (isTag) {
        sendData.recipientTag = recipient.replace(/^@/, '');
      } else {
        sendData.recipientPhone = recipient;
      }
      await api.post('/wallet/send', sendData);
      await refreshUser();
      setStep('success');
    } catch (err: any) {
      Alert.alert('Fejl', err.message || 'Kunne ikke sende penge');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'success') {
    return (
      <SuccessScreen
        amount={formatDKK(parseInt(amount) * 100)}
        recipient={recipientName || recipient}
        onDone={() => navigation.goBack()}
      />
    );
  }

  if (step === 'confirm') {
    return (
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor: C.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.content}>
          <View style={[styles.confirmCard, { backgroundColor: C.surface, borderColor: C.border }]}>
            <View style={styles.confirmIcon}>
              <Ionicons name="send" size={32} color={C.accent} />
            </View>
            <Text style={[styles.confirmTitle, { color: C.text }]}>Bekræft overførsel</Text>
            <Text style={[styles.confirmAmount, { color: C.accent }]}>
              {formatDKK(parseInt(amount) * 100)}
            </Text>
            <Text style={[styles.confirmRecipient, { color: C.textSecondary }]}>
              Til: {recipientName || phone}
            </Text>
            {description ? (
              <Text style={[styles.confirmDesc, { color: C.textLight }]}>"{description}"</Text>
            ) : null}
          </View>

          <Text style={[styles.label, { color: C.textSecondary }]}>Indtast PIN</Text>
          <TextInput
            style={[styles.input, styles.pinInput, { backgroundColor: C.surface, borderColor: C.border, color: C.text }]}
            value={pin}
            onChangeText={setPin}
            keyboardType="number-pad"
            maxLength={4}
            secureTextEntry
            placeholder="----"
            placeholderTextColor={C.textLight}
            textAlign="center"
          />

          <TouchableOpacity
            style={[styles.button, { backgroundColor: C.accent }]}
            onPress={handleSend}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Send penge</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => {
              setPin('');
              setStep('details');
            }}
          >
            <Text style={[styles.cancelText, { color: C.textSecondary }]}>Annuller</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: C.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.content} contentContainerStyle={styles.contentInner} keyboardShouldPersistTaps="handled">
        <Text style={[styles.heading, { color: C.text }]}>Send penge</Text>

        <Text style={[styles.label, { color: C.textSecondary }]}>Seneste</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.recentRow} contentContainerStyle={styles.recentRowInner}>
          {RECENT_RECIPIENTS.map((r) => (
            <TouchableOpacity
              key={r.tag}
              style={styles.recentChip}
              onPress={() => setRecipient(`@${r.tag}`)}
            >
              <View style={[styles.recentAvatar, { backgroundColor: C.primary }, recipient === `@${r.tag}` && styles.recentAvatarActive, recipient === `@${r.tag}` && { borderColor: C.accent }]}>
                <Text style={styles.recentAvatarText}>{r.name.charAt(0)}</Text>
              </View>
              <Text style={[styles.recentName, { color: C.textSecondary }]} numberOfLines={1}>{r.name.split(' ')[0]}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={[styles.label, { color: C.textSecondary }]}>Modtager</Text>
        <TextInput
          style={[styles.input, { backgroundColor: C.surface, borderColor: C.border, color: C.text }]}
          value={recipient}
          onChangeText={setRecipient}
          placeholder="@paywag-tag eller +298 XXXXXX"
          placeholderTextColor={C.textLight}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Text style={[styles.label, { color: C.textSecondary }]}>Beløb (DKK)</Text>
        <TextInput
          style={[styles.input, styles.amountInput, { backgroundColor: C.surface, borderColor: C.border, color: C.text }]}
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
          placeholder="0,00"
          placeholderTextColor={C.textLight}
          textAlign="center"
        />

        <Text style={[styles.label, { color: C.textSecondary }]}>Besked (valgfrit)</Text>
        <TextInput
          style={[styles.input, { backgroundColor: C.surface, borderColor: C.border, color: C.text }]}
          value={description}
          onChangeText={setDescription}
          placeholder="F.eks. aftensmad"
          placeholderTextColor={C.textLight}
          maxLength={200}
        />

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
            <TouchableOpacity style={styles.receiptRemove} onPress={() => setReceiptImage(null)}>
              <Ionicons name="close-circle" size={24} color={C.danger} />
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity style={[styles.button, { backgroundColor: C.accent }]} onPress={lookupRecipient}>
          <Text style={styles.buttonText}>Fortsæt</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function SuccessScreen({ amount, recipient, onDone }: { amount: string; recipient: string; onDone: () => void }) {
  const C = useColors();
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const checkScale = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(scale, { toValue: 1, friction: 4, tension: 60, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]),
      Animated.spring(checkScale, { toValue: 1, friction: 3, tension: 80, useNativeDriver: true }),
      Animated.timing(textOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={[successStyles.container, { backgroundColor: C.background }]}>
      <Animated.View style={[successStyles.circle, { backgroundColor: C.accent, shadowColor: C.accent }, { transform: [{ scale }], opacity }]}>
        <Animated.View style={{ transform: [{ scale: checkScale }] }}>
          <Ionicons name="checkmark-sharp" size={52} color="#fff" />
        </Animated.View>
      </Animated.View>
      <Animated.View style={[successStyles.textWrap, { opacity: textOpacity }]}>
        <Text style={[successStyles.title, { color: C.text }]}>Betaling sendt!</Text>
        <Text style={[successStyles.amount, { color: C.accent }]}>{amount}</Text>
        <Text style={[successStyles.recipient, { color: C.textSecondary }]}>til {recipient}</Text>
      </Animated.View>
      <Animated.View style={{ opacity: textOpacity, width: '100%', paddingHorizontal: SPACING.xl }}>
        <TouchableOpacity style={[successStyles.btn, { backgroundColor: C.primary }]} onPress={onDone}>
          <Text style={successStyles.btnText}>Færdig</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const successStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  circle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
  },
  textWrap: {
    alignItems: 'center',
    marginTop: SPACING.xl,
    marginBottom: SPACING.xxl,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
  },
  amount: {
    fontSize: 36,
    fontWeight: '800',
    marginTop: SPACING.sm,
  },
  recipient: {
    fontSize: 16,
    marginTop: SPACING.xs,
  },
  btn: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  btnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: SPACING.xl,
  },
  contentInner: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: SPACING.xxl,
  },
  heading: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: SPACING.xs,
    marginTop: SPACING.md,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    paddingVertical: 14,
    fontSize: 16,
  },
  amountInput: {
    fontSize: 28,
    fontWeight: '700',
    paddingVertical: 20,
  },
  pinInput: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: 12,
    paddingVertical: 16,
  },
  button: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '500',
  },
  confirmCard: {
    borderRadius: 20,
    padding: SPACING.xl,
    alignItems: 'center',
    borderWidth: 1,
    marginBottom: SPACING.lg,
  },
  confirmIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#e8faf0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  confirmTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  confirmAmount: {
    fontSize: 36,
    fontWeight: '800',
    marginVertical: SPACING.sm,
  },
  confirmRecipient: {
    fontSize: 16,
  },
  confirmDesc: {
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: SPACING.xs,
  },
  recentRow: {
    marginBottom: SPACING.sm,
    marginHorizontal: -SPACING.xl,
  },
  recentRowInner: {
    paddingHorizontal: SPACING.xl,
    gap: SPACING.md,
  },
  recentChip: {
    alignItems: 'center',
    width: 56,
  },
  recentAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  recentAvatarActive: {
    borderWidth: 2.5,
  },
  recentAvatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  recentName: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
  },
  receiptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.md,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: 'dashed',
  },
  receiptBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  receiptPreview: {
    position: 'relative',
    marginTop: SPACING.sm,
    borderRadius: 12,
    overflow: 'hidden',
  },
  receiptImage: {
    width: '100%',
    height: 160,
    borderRadius: 12,
  },
  receiptRemove: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 12,
  },
});
