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
import { SPACING } from '../utils/constants';
import { useColors } from '../utils/theme';

export function BiometricsScreen() {
  const C = useColors();
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
    <ScrollView style={[styles.container, { backgroundColor: C.background }]}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="finger-print" size={40} color={C.accent} />
        </View>
        <Text style={[styles.heading, { color: C.text }]}>{biometryType}</Text>
        <Text style={[styles.subtitle, { color: C.textSecondary }]}>
          {isSupported
            ? `Din enhed understøtter ${biometryType}. Aktiver det for hurtigere og sikrere godkendelse.`
            : 'Din enhed understøtter ikke biometrisk godkendelse.'}
        </Text>

        {isSupported ? (
          <View style={[styles.toggleList, { backgroundColor: C.surface, borderColor: C.border }]}>
            <View style={styles.toggleRow}>
              <View style={styles.toggleInfo}>
                <Text style={[styles.toggleTitle, { color: C.text }]}>Bekræft betalinger</Text>
                <Text style={[styles.toggleDesc, { color: C.textSecondary }]}>
                  Brug {biometryType} i stedet for PIN ved betalinger og overførsler
                </Text>
              </View>
              <Switch
                value={paymentEnabled}
                onValueChange={(v) => handleToggle(setPaymentEnabled, v)}
                trackColor={{ false: C.border, true: C.accentLight }}
                thumbColor={paymentEnabled ? C.accent : '#f4f4f5'}
              />
            </View>

            <View style={[styles.divider, { backgroundColor: C.borderLight }]} />

            <View style={styles.toggleRow}>
              <View style={styles.toggleInfo}>
                <Text style={[styles.toggleTitle, { color: C.text }]}>App-lås</Text>
                <Text style={[styles.toggleDesc, { color: C.textSecondary }]}>
                  Kræv {biometryType} for at åbne Payway
                </Text>
              </View>
              <Switch
                value={appLockEnabled}
                onValueChange={(v) => handleToggle(setAppLockEnabled, v)}
                trackColor={{ false: C.border, true: C.accentLight }}
                thumbColor={appLockEnabled ? C.accent : '#f4f4f5'}
              />
            </View>
          </View>
        ) : (
          <View style={styles.unsupported}>
            <Ionicons name="alert-circle" size={24} color={C.warning} />
            <Text style={styles.unsupportedText}>
              Biometrisk godkendelse er ikke tilgængelig på denne enhed. Brug PIN-kode i stedet.
            </Text>
          </View>
        )}

        <View style={styles.infoBox}>
          <Ionicons name="shield-checkmark" size={18} color={C.success} />
          <Text style={styles.infoText}>
            Dine biometriske data forlader aldrig din enhed og deles ikke med Payway.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: SPACING.xl },
  iconContainer: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#e8faf0', justifyContent: 'center', alignItems: 'center',
    alignSelf: 'center', marginBottom: SPACING.md, marginTop: SPACING.lg,
  },
  heading: { fontSize: 22, fontWeight: '800', textAlign: 'center' },
  subtitle: { fontSize: 14, textAlign: 'center', marginTop: SPACING.xs, marginBottom: SPACING.xl, lineHeight: 20 },
  toggleList: {
    borderRadius: 16, borderWidth: 1,
    overflow: 'hidden',
  },
  toggleRow: {
    flexDirection: 'row', alignItems: 'center',
    padding: SPACING.md, gap: SPACING.md,
  },
  toggleInfo: { flex: 1 },
  toggleTitle: { fontSize: 15, fontWeight: '600' },
  toggleDesc: { fontSize: 13, marginTop: 2, lineHeight: 18 },
  divider: { height: 1, marginHorizontal: SPACING.md },
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
