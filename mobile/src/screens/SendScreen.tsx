import React, { useState } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, SPACING } from '../utils/constants';
import { formatDKK } from '../utils/format';
import { api } from '../services/api';
import { useAuth } from '../store/auth';

export function SendScreen({ navigation }: any) {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [pin, setPin] = useState('');
  const [step, setStep] = useState<'details' | 'confirm'>('details');
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

      Alert.alert(
        'Sendt!',
        `${formatDKK(parseInt(amount) * 100)} er sendt til ${recipientName || recipient}`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (err: any) {
      Alert.alert('Fejl', err.message || 'Kunne ikke sende penge');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'confirm') {
    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.content}>
          <View style={styles.confirmCard}>
            <View style={styles.confirmIcon}>
              <Ionicons name="send" size={32} color={COLORS.accent} />
            </View>
            <Text style={styles.confirmTitle}>Bekræft overførsel</Text>
            <Text style={styles.confirmAmount}>
              {formatDKK(parseInt(amount) * 100)}
            </Text>
            <Text style={styles.confirmRecipient}>
              Til: {recipientName || phone}
            </Text>
            {description ? (
              <Text style={styles.confirmDesc}>"{description}"</Text>
            ) : null}
          </View>

          <Text style={styles.label}>Indtast PIN</Text>
          <TextInput
            style={[styles.input, styles.pinInput]}
            value={pin}
            onChangeText={setPin}
            keyboardType="number-pad"
            maxLength={4}
            secureTextEntry
            placeholder="----"
            placeholderTextColor={COLORS.textLight}
            textAlign="center"
          />

          <TouchableOpacity
            style={styles.button}
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
            <Text style={styles.cancelText}>Annuller</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.content} contentContainerStyle={styles.contentInner} keyboardShouldPersistTaps="handled">
        <Text style={styles.heading}>Send penge</Text>

        <Text style={styles.label}>Modtager</Text>
        <TextInput
          style={styles.input}
          value={recipient}
          onChangeText={setRecipient}
          placeholder="@paywag-tag eller +298 XXXXXX"
          placeholderTextColor={COLORS.textLight}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Text style={styles.label}>Beløb (DKK)</Text>
        <TextInput
          style={[styles.input, styles.amountInput]}
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
          placeholder="0,00"
          placeholderTextColor={COLORS.textLight}
          textAlign="center"
        />

        <Text style={styles.label}>Besked (valgfrit)</Text>
        <TextInput
          style={styles.input}
          value={description}
          onChangeText={setDescription}
          placeholder="F.eks. aftensmad"
          placeholderTextColor={COLORS.textLight}
          maxLength={200}
        />

        {/* Receipt */}
        <TouchableOpacity style={styles.receiptBtn} onPress={showReceiptOptions}>
          <Ionicons name="camera-outline" size={20} color={COLORS.primary} />
          <Text style={styles.receiptBtnText}>
            {receiptImage ? 'Skift kvittering' : 'Tilføj kvittering'}
          </Text>
        </TouchableOpacity>
        {receiptImage && (
          <View style={styles.receiptPreview}>
            <Image source={{ uri: receiptImage }} style={styles.receiptImage} />
            <TouchableOpacity style={styles.receiptRemove} onPress={() => setReceiptImage(null)}>
              <Ionicons name="close-circle" size={24} color={COLORS.danger} />
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity style={styles.button} onPress={lookupRecipient}>
          <Text style={styles.buttonText}>Fortsæt</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
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
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
    marginTop: SPACING.md,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    paddingVertical: 14,
    fontSize: 16,
    color: COLORS.text,
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
    backgroundColor: COLORS.accent,
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
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  confirmCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: SPACING.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
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
    color: COLORS.text,
  },
  confirmAmount: {
    fontSize: 36,
    fontWeight: '800',
    color: COLORS.accent,
    marginVertical: SPACING.sm,
  },
  confirmRecipient: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  confirmDesc: {
    fontSize: 14,
    color: COLORS.textLight,
    fontStyle: 'italic',
    marginTop: SPACING.xs,
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
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },
  receiptBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
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
