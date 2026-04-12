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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+298');
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, login, skipLogin } = useAuth();

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Fejl', 'Indtast email og adgangskode');
      return;
    }

    if (isRegistering && !name.trim()) {
      Alert.alert('Fejl', 'Indtast dit navn');
      return;
    }

    setLoading(true);
    try {
      if (isRegistering) {
        await register(email.trim(), password, name.trim(), phone.length > 4 ? phone : undefined);
      } else {
        await login(email.trim(), password);
      }
    } catch (err: any) {
      Alert.alert('Fejl', err.message || 'Noget gik galt');
    } finally {
      setLoading(false);
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

        <View style={styles.form}>
          <Text style={[styles.label, { color: C.text }]}>Email</Text>
          <TextInput
            style={[styles.input, { backgroundColor: C.surface, borderColor: C.border, color: C.text }]}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="din@email.com"
            placeholderTextColor={C.textLight}
          />

          <Text style={[styles.label, { color: C.text }]}>Adgangskode</Text>
          <TextInput
            style={[styles.input, { backgroundColor: C.surface, borderColor: C.border, color: C.text }]}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="Mindst 6 tegn"
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

              <Text style={[styles.label, { color: C.text }]}>Telefonnummer (valgfrit)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: C.surface, borderColor: C.border, color: C.text }]}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                placeholder="+298 XXXXXX"
                placeholderTextColor={C.textLight}
              />
            </>
          )}

          <TouchableOpacity
            style={[styles.button, { backgroundColor: C.accent }]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>
                {isRegistering ? 'Opret konto' : 'Log ind'}
              </Text>
            )}
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
