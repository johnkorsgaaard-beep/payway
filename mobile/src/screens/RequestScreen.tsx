import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { SPACING } from '../utils/constants';
import { useColors } from '../utils/theme';

export function RequestScreen({ route, navigation }: any) {
  const C = useColors();
  const styles = makeStyles(C);
  const prefill = route?.params?.recipient ?? '';
  const [recipient, setRecipient] = useState(prefill);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

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

  const handleSend = () => {
    if (!recipient.trim()) {
      Alert.alert('Fejl', 'Indtast en modtager.');
      return;
    }
    const parsedAmount = parseFloat(amount.replace(',', '.'));
    if (!parsedAmount || parsedAmount <= 0) {
      Alert.alert('Fejl', 'Indtast et gyldigt beløb.');
      return;
    }
    setSent(true);
  };

  if (sent) {
    return (
      <View style={styles.container}>
        <View style={styles.successContent}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark-circle" size={64} color={C.accent} />
          </View>
          <Text style={styles.successTitle}>Anmodning sendt!</Text>
          <Text style={styles.successSub}>
            {recipient} har modtaget din anmodning på{' '}
            {parseFloat(amount.replace(',', '.')).toLocaleString('da-DK', { minimumFractionDigits: 2 })} kr.
          </Text>
          <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
            <Text style={styles.buttonText}>Luk</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.heading}>Anmod om penge</Text>

        <Text style={styles.label}>Fra</Text>
        <TextInput
          style={styles.input}
          value={recipient}
          onChangeText={setRecipient}
          placeholder="@paywag-tag eller +298 XXXXXX"
          placeholderTextColor={C.textLight}
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
          placeholderTextColor={C.textLight}
          textAlign="center"
        />

        <Text style={styles.label}>Besked (valgfrit)</Text>
        <TextInput
          style={styles.input}
          value={description}
          onChangeText={setDescription}
          placeholder="F.eks. din halvdel af middagen"
          placeholderTextColor={C.textLight}
          maxLength={200}
        />

        <TouchableOpacity style={styles.receiptBtn} onPress={showReceiptOptions}>
          <Ionicons name="camera-outline" size={20} color={C.primary} />
          <Text style={styles.receiptBtnText}>
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

        <TouchableOpacity style={styles.button} onPress={handleSend}>
          <Text style={styles.buttonText}>Send anmodning</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function makeStyles(C: any) {
  return StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.background,
  },
  scroll: {
    flex: 1,
    padding: SPACING.xl,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: SPACING.xxl,
  },
  heading: {
    fontSize: 28,
    fontWeight: '800',
    color: C.text,
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: C.textSecondary,
    marginBottom: SPACING.xs,
    marginTop: SPACING.md,
  },
  input: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    paddingVertical: 14,
    fontSize: 16,
    color: C.text,
    letterSpacing: 0,
  },
  amountInput: {
    fontSize: 28,
    fontWeight: '700',
    paddingVertical: 20,
  },
  button: {
    backgroundColor: C.accent,
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
  receiptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.md,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: C.border,
    borderStyle: 'dashed',
  },
  receiptBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: C.primary,
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
  successContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  successIcon: {
    marginBottom: SPACING.md,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: C.text,
    marginBottom: SPACING.sm,
  },
  successSub: {
    fontSize: 16,
    color: C.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.lg,
  },
});
}
