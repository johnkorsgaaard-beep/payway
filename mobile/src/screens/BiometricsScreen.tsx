import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  ScrollView,
} from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../utils/constants';

export function BiometricsScreen() {
  const [isSupported, setIsSupported] = useState(false);
  const [biometryType, setBiometryType] = useState('Biometri');
  const [paymentEnabled, setPaymentEnabled] = useState(true);
  const [appLockEnabled, setAppLockEnabled] = useState(false);

  useEffect(() => {
    (async () => {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      setIsSupported(compatible);

      if (compatible) {
        const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
        if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
          setBiometryType('Face ID');
        } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
          setBiometryType('Touch ID');
        }
      }
    })();
  }, []);

  const handleToggle = async (
    setter: (v: boolean) => void,
    newValue: boolean
  ) => {
    if (newValue) {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: `Aktiver ${biometryType}`,
        cancelLabel: 'Annuller',
      });
      if (result.success) setter(true);
    } else {
      setter(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="finger-print" size={40} color={COLORS.accent} />
        </View>
        <Text style={styles.heading}>{biometryType}</Text>
        <Text style={styles.subtitle}>
          {isSupported
            ? `Din enhed understøtter ${biometryType}. Aktiver det for hurtigere og sikrere godkendelse.`
            : 'Din enhed understøtter ikke biometrisk godkendelse.'}
        </Text>

        {isSupported ? (
          <View style={styles.toggleList}>
            <View style={styles.toggleRow}>
              <View style={styles.toggleInfo}>
                <Text style={styles.toggleTitle}>Bekræft betalinger</Text>
                <Text style={styles.toggleDesc}>
                  Brug {biometryType} i stedet for PIN ved betalinger og overførsler
                </Text>
              </View>
              <Switch
                value={paymentEnabled}
                onValueChange={(v) => handleToggle(setPaymentEnabled, v)}
                trackColor={{ false: COLORS.border, true: COLORS.accentLight }}
                thumbColor={paymentEnabled ? COLORS.accent : '#f4f4f5'}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.toggleRow}>
              <View style={styles.toggleInfo}>
                <Text style={styles.toggleTitle}>App-lås</Text>
                <Text style={styles.toggleDesc}>
                  Kræv {biometryType} for at åbne Payway
                </Text>
              </View>
              <Switch
                value={appLockEnabled}
                onValueChange={(v) => handleToggle(setAppLockEnabled, v)}
                trackColor={{ false: COLORS.border, true: COLORS.accentLight }}
                thumbColor={appLockEnabled ? COLORS.accent : '#f4f4f5'}
              />
            </View>
          </View>
        ) : (
          <View style={styles.unsupported}>
            <Ionicons name="alert-circle" size={24} color={COLORS.warning} />
            <Text style={styles.unsupportedText}>
              Biometrisk godkendelse er ikke tilgængelig på denne enhed. Brug PIN-kode i stedet.
            </Text>
          </View>
        )}

        <View style={styles.infoBox}>
          <Ionicons name="shield-checkmark" size={18} color={COLORS.success} />
          <Text style={styles.infoText}>
            Dine biometriske data forlader aldrig din enhed og deles ikke med Payway.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.xl },
  iconContainer: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#e8faf0', justifyContent: 'center', alignItems: 'center',
    alignSelf: 'center', marginBottom: SPACING.md, marginTop: SPACING.lg,
  },
  heading: { fontSize: 22, fontWeight: '800', color: COLORS.text, textAlign: 'center' },
  subtitle: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', marginTop: SPACING.xs, marginBottom: SPACING.xl, lineHeight: 20 },
  toggleList: {
    backgroundColor: COLORS.surface, borderRadius: 16, borderWidth: 1,
    borderColor: COLORS.border, overflow: 'hidden',
  },
  toggleRow: {
    flexDirection: 'row', alignItems: 'center',
    padding: SPACING.md, gap: SPACING.md,
  },
  toggleInfo: { flex: 1 },
  toggleTitle: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  toggleDesc: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2, lineHeight: 18 },
  divider: { height: 1, backgroundColor: COLORS.borderLight, marginHorizontal: SPACING.md },
  unsupported: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    backgroundColor: '#fef3c7', padding: SPACING.md, borderRadius: 12,
  },
  unsupportedText: { flex: 1, fontSize: 14, color: '#92400e', lineHeight: 20 },
  infoBox: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    backgroundColor: '#f0fdf4', padding: SPACING.md, borderRadius: 12, marginTop: SPACING.lg,
  },
  infoText: { flex: 1, fontSize: 13, color: '#166534', lineHeight: 18 },
});
