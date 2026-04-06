import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SPACING } from '../utils/constants';
import { useColors } from '../utils/theme';

export function ChangePinScreen({ navigation }: any) {
  const C = useColors();
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  const handleSave = () => {
    if (currentPin.length !== 4) {
      Alert.alert('Fejl', 'Indtast din nuværende 4-cifrede PIN');
      return;
    }
    if (newPin.length !== 4) {
      Alert.alert('Fejl', 'Ny PIN skal være 4 cifre');
      return;
    }
    if (newPin !== confirmPin) {
      Alert.alert('Fejl', 'Ny PIN og bekræftelse matcher ikke');
      return;
    }
    if (newPin === currentPin) {
      Alert.alert('Fejl', 'Ny PIN skal være forskellig fra nuværende');
      return;
    }

    Alert.alert('PIN ændret', 'Din PIN-kode er blevet opdateret.', [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: C.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="lock-closed" size={36} color={C.accent} />
        </View>
        <Text style={[styles.heading, { color: C.text }]}>Skift PIN-kode</Text>
        <Text style={[styles.subtitle, { color: C.textSecondary }]}>
          Din PIN bruges til at bekræfte betalinger og overførsler
        </Text>

        <Text style={[styles.label, { color: C.textSecondary }]}>Nuværende PIN</Text>
        <TextInput
          style={[styles.pinInput, { backgroundColor: C.surface, borderColor: C.border, color: C.text }]}
          value={currentPin}
          onChangeText={setCurrentPin}
          keyboardType="number-pad"
          maxLength={4}
          secureTextEntry
          placeholder="----"
          placeholderTextColor={C.textLight}
          textAlign="center"
        />

        <Text style={[styles.label, { color: C.textSecondary }]}>Ny PIN</Text>
        <TextInput
          style={[styles.pinInput, { backgroundColor: C.surface, borderColor: C.border, color: C.text }]}
          value={newPin}
          onChangeText={setNewPin}
          keyboardType="number-pad"
          maxLength={4}
          secureTextEntry
          placeholder="----"
          placeholderTextColor={C.textLight}
          textAlign="center"
        />

        <Text style={[styles.label, { color: C.textSecondary }]}>Bekræft ny PIN</Text>
        <TextInput
          style={[styles.pinInput, { backgroundColor: C.surface, borderColor: C.border, color: C.text }]}
          value={confirmPin}
          onChangeText={setConfirmPin}
          keyboardType="number-pad"
          maxLength={4}
          secureTextEntry
          placeholder="----"
          placeholderTextColor={C.textLight}
          textAlign="center"
        />

        <TouchableOpacity style={[styles.button, { backgroundColor: C.accent }]} onPress={handleSave}>
          <Text style={styles.buttonText}>Gem ny PIN</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: SPACING.xl, justifyContent: 'center' },
  iconContainer: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: '#e8faf0', justifyContent: 'center', alignItems: 'center',
    alignSelf: 'center', marginBottom: SPACING.md,
  },
  heading: { fontSize: 22, fontWeight: '800', textAlign: 'center' },
  subtitle: { fontSize: 14, textAlign: 'center', marginTop: SPACING.xs, marginBottom: SPACING.xl },
  label: { fontSize: 13, fontWeight: '600', marginBottom: SPACING.xs, marginTop: SPACING.md },
  pinInput: {
    borderWidth: 1,
    borderRadius: 12, paddingVertical: 14, fontSize: 28, fontWeight: '700',
    letterSpacing: 12,
  },
  button: {
    borderRadius: 12,
    paddingVertical: 16, alignItems: 'center', marginTop: SPACING.xl,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
