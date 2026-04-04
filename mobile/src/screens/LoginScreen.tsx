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
import { COLORS, SPACING } from '../utils/constants';
import { useAuth } from '../store/auth';

export function LoginScreen({ navigation }: any) {
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
    // In production: firebase.auth().signInWithPhoneNumber(phone)
    // For now, simulate OTP flow
    setStep('code');
  };

  const handleVerifyCode = async () => {
    try {
      // In production: confirm OTP with Firebase, get idToken
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
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <View style={styles.logo}>
          <Image
            source={require('../../assets/payway-logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={styles.subtitle}>Betaling til Føroyar</Text>
        </View>

        <TouchableOpacity style={styles.demoButton} onPress={skipLogin}>
          <Text style={styles.demoButtonText}>Kom ind uden login</Text>
        </TouchableOpacity>

        {step === 'phone' ? (
          <View style={styles.form}>
            <Text style={styles.label}>Telefonnummer</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholder="+298 XXXXXX"
              placeholderTextColor={COLORS.textLight}
            />

            {isRegistering && (
              <>
                <Text style={styles.label}>Navn</Text>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Dit fulde navn"
                  placeholderTextColor={COLORS.textLight}
                  autoCapitalize="words"
                />
              </>
            )}

            <TouchableOpacity
              style={styles.button}
              onPress={handleSendCode}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>Send SMS-kode</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.switchButton}
              onPress={() => setIsRegistering(!isRegistering)}
            >
              <Text style={styles.switchText}>
                {isRegistering
                  ? 'Har du allerede en konto? Log ind'
                  : 'Ny bruger? Opret konto'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.form}>
            <Text style={styles.label}>SMS-kode</Text>
            <TextInput
              style={[styles.input, styles.codeInput]}
              value={smsCode}
              onChangeText={setSmsCode}
              keyboardType="number-pad"
              placeholder="000000"
              placeholderTextColor={COLORS.textLight}
              maxLength={6}
              textAlign="center"
            />

            <TouchableOpacity
              style={styles.button}
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
              <Text style={styles.switchText}>Tilbage</Text>
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
    backgroundColor: COLORS.background,
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
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  form: {
    gap: SPACING.md,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: -SPACING.sm,
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
  codeInput: {
    fontSize: 24,
    letterSpacing: 8,
    fontWeight: '700',
  },
  button: {
    backgroundColor: COLORS.accent,
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
    color: COLORS.accent,
    fontSize: 14,
    fontWeight: '500',
  },
  demoButton: {
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.accent,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  demoButtonText: {
    color: COLORS.accent,
    fontSize: 16,
    fontWeight: '700',
  },
});
