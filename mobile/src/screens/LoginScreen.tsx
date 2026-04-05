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
  const styles = makeStyles(C);
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
              placeholderTextColor={C.textLight}
            />

            {isRegistering && (
              <>
                <Text style={styles.label}>Navn</Text>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Dit fulde navn"
                  placeholderTextColor={C.textLight}
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
              placeholderTextColor={C.textLight}
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

function makeStyles(C: any) {
  return StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.background,
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
    color: C.textSecondary,
    marginTop: SPACING.xs,
  },
  form: {
    gap: SPACING.md,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: C.text,
    marginBottom: -SPACING.sm,
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
  },
  codeInput: {
    fontSize: 24,
    letterSpacing: 8,
    fontWeight: '700',
  },
  button: {
    backgroundColor: C.accent,
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
    color: C.accent,
    fontSize: 14,
    fontWeight: '500',
  },
  demoButton: {
    backgroundColor: C.surface,
    borderWidth: 2,
    borderColor: C.accent,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  demoButtonText: {
    color: C.accent,
    fontSize: 16,
    fontWeight: '700',
  },
});
}
