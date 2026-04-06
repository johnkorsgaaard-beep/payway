import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SPACING } from '../utils/constants';
import { useColors } from '../utils/theme';
import { useAuth } from '../store/auth';

export function LoginScreen({ navigation }: any) {
  const C = useColors();
  const [phone, setPhone] = useState('+298');
  const [name, setName] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [smsCode, setSmsCode] = useState('');
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const { register, login, isLoading, skipLogin } = useAuth();

  const handleSendCode = () => {
    if (phone.length < 9) {
      Alert.alert('Fejl', 'Indtast et gyldigt telefonnummer');
      return;
    }
    setStep('code');
  };

  const handleVerifyCode = async () => {
    try {
      const mockFirebaseToken = `mock_token_${phone}_${Date.now()}`;

      if (isRegistering) {
        if (!name.trim()) {
          Alert.alert('Fejl', 'Indtast dit navn');
          return;
        }
        await register(mockFirebaseToken, phone, name);
      } else {
        await login(mockFirebaseToken);
      }
    } catch (err: any) {
      Alert.alert('Fejl', err.message || 'Noget gik galt');
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: C.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <View style={styles.logo}>
          <Image
            source={require('../../assets/payway-logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={[styles.subtitle, { color: C.textSecondary }]}>Betaling til Føroyar</Text>
        </View>

        <TouchableOpacity style={[styles.demoButton, { backgroundColor: C.surface, borderColor: C.accent }]} onPress={skipLogin}>
          <Text style={[styles.demoButtonText, { color: C.accent }]}>Kom ind uden login</Text>
        </TouchableOpacity>

        {step === 'phone' ? (
          <View style={styles.form}>
            <Text style={[styles.label, { color: C.text }]}>Telefonnummer</Text>
            <TextInput
              style={[styles.input, { backgroundColor: C.surface, borderColor: C.border, color: C.text }]}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholder="+298 XXXXXX"
              placeholderTextColor={C.textLight}
            />

            {isRegistering && (
              <>
                <Text style={[styles.label, { color: C.text }]}>Navn</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: C.surface, borderColor: C.border, color: C.text }]}
                  value={name}
                  onChangeText={setName}
                  placeholder="Dit fulde navn"
                  placeholderTextColor={C.textLight}
                  autoCapitalize="words"
                />
              </>
            )}

            <TouchableOpacity
              style={[styles.button, { backgroundColor: C.accent }]}
              onPress={handleSendCode}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>Send SMS-kode</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.switchButton}
              onPress={() => setIsRegistering(!isRegistering)}
            >
              <Text style={[styles.switchText, { color: C.accent }]}>
                {isRegistering
                  ? 'Har du allerede en konto? Log ind'
                  : 'Ny bruger? Opret konto'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.form}>
            <Text style={[styles.label, { color: C.text }]}>SMS-kode</Text>
            <TextInput
              style={[styles.input, styles.codeInput, { backgroundColor: C.surface, borderColor: C.border, color: C.text }]}
              value={smsCode}
              onChangeText={setSmsCode}
              keyboardType="number-pad"
              placeholder="000000"
              placeholderTextColor={C.textLight}
              maxLength={6}
              textAlign="center"
            />

            <TouchableOpacity
              style={[styles.button, { backgroundColor: C.accent }]}
              onPress={handleVerifyCode}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Bekræft</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.switchButton}
              onPress={() => setStep('phone')}
            >
              <Text style={[styles.switchText, { color: C.accent }]}>Tilbage</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
  },
  logo: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  logoImage: {
    width: 140,
    height: 140,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: 16,
    marginTop: SPACING.xs,
  },
  form: {
    gap: SPACING.md,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: -SPACING.sm,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    paddingVertical: 14,
    fontSize: 16,
  },
  codeInput: {
    fontSize: 24,
    letterSpacing: 8,
    fontWeight: '700',
  },
  button: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  switchButton: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  switchText: {
    fontSize: 14,
    fontWeight: '500',
  },
  demoButton: {
    borderWidth: 2,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  demoButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
