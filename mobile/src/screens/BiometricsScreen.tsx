import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { Ionicons } from '@expo/vector-icons';
import { SPACING } from '../utils/constants';
import { useColors } from '../utils/theme';
import { useAppLock, TIMEOUT_OPTIONS } from '../store/appLock';

export function BiometricsScreen() {
  const C = useColors();
  const styles = makeStyles(C);
  const [isSupported, setIsSupported] = useState(false);
  const [biometryType, setBiometryType] = useState('Biometri');
  const [paymentEnabled, setPaymentEnabled] = useState(true);
  const { settings: lockSettings, updateSettings: updateLockSettings } = useAppLock();
  const appLockEnabled = lockSettings.enabled;
  const setAppLockEnabled = (v: boolean) => updateLockSettings({ enabled: v });

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
          <Ionicons name="finger-print" size={40} color={C.accent} />
        </View>
        <Text style={styles.heading}>{biometryType}</Text>
        <Text style={styles.subtitle}>
          {isSupported
            ? `Din enhed understøtter ${biometryType}. Aktiver det for hurtigere og sikrere godkendelse.`
            : 'Din enhed understøtter ikke biometrisk godkendelse.'}
        </Text>

        {isSupported ? (
          <>
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
                trackColor={{ false: C.border, true: C.accentLight }}
                thumbColor={paymentEnabled ? C.accent : '#f4f4f5'}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.toggleRow}>
              <View style={styles.toggleInfo}>
                <Text style={styles.toggleTitle}>App-lås</Text>
                <Text style={styles.toggleDesc}>
                  Kræv {biometryType} eller PIN for at åbne Payway
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

          {appLockEnabled && (
            <View style={styles.lockSettings}>
              <Text style={styles.lockSettingsTitle}>Auto-lås timeout</Text>
              <Text style={styles.lockSettingsDesc}>
                Lås appen efter inaktivitet i den valgte periode
              </Text>
              <View style={styles.timeoutGrid}>
                {TIMEOUT_OPTIONS.map((opt) => (
                  <TouchableOpacity
                    key={opt.value}
                    style={[
                      styles.timeoutChip,
                      lockSettings.timeoutMinutes === opt.value && styles.timeoutChipActive,
                    ]}
                    onPress={() => updateLockSettings({ timeoutMinutes: opt.value })}
                  >
                    <Text
                      style={[
                        styles.timeoutText,
                        lockSettings.timeoutMinutes === opt.value && styles.timeoutTextActive,
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.divider} />

              <View style={styles.toggleRow}>
                <View style={styles.toggleInfo}>
                  <Text style={styles.toggleTitle}>Lås ved baggrund</Text>
                  <Text style={styles.toggleDesc}>
                    Lås med det samme når appen minimeres
                  </Text>
                </View>
                <Switch
                  value={lockSettings.lockOnBackground}
                  onValueChange={(v) => updateLockSettings({ lockOnBackground: v })}
                  trackColor={{ false: C.border, true: C.accentLight }}
                  thumbColor={lockSettings.lockOnBackground ? C.accent : '#f4f4f5'}
                />
              </View>
            </View>
          )}
          </>
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

function makeStyles(C: any) {
  return StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background },
  content: { padding: SPACING.xl },
  iconContainer: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#e8faf0', justifyContent: 'center', alignItems: 'center',
    alignSelf: 'center', marginBottom: SPACING.md, marginTop: SPACING.lg,
  },
  heading: { fontSize: 22, fontWeight: '800', color: C.text, textAlign: 'center' },
  subtitle: { fontSize: 14, color: C.textSecondary, textAlign: 'center', marginTop: SPACING.xs, marginBottom: SPACING.xl, lineHeight: 20 },
  toggleList: {
    backgroundColor: C.surface, borderRadius: 16, borderWidth: 1,
    borderColor: C.border, overflow: 'hidden',
  },
  toggleRow: {
    flexDirection: 'row', alignItems: 'center',
    padding: SPACING.md, gap: SPACING.md,
  },
  toggleInfo: { flex: 1 },
  toggleTitle: { fontSize: 15, fontWeight: '600', color: C.text },
  toggleDesc: { fontSize: 13, color: C.textSecondary, marginTop: 2, lineHeight: 18 },
  divider: { height: 1, backgroundColor: C.borderLight, marginHorizontal: SPACING.md },
  lockSettings: {
    backgroundColor: C.surface, borderRadius: 16, borderWidth: 1,
    borderColor: C.border, overflow: 'hidden', marginTop: SPACING.md,
    padding: SPACING.md,
  },
  lockSettingsTitle: { fontSize: 15, fontWeight: '700', color: C.text },
  lockSettingsDesc: { fontSize: 13, color: C.textSecondary, marginTop: 2, marginBottom: SPACING.md, lineHeight: 18 },
  timeoutGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm,
  },
  timeoutChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1, borderColor: C.border, backgroundColor: C.background,
  },
  timeoutChipActive: {
    backgroundColor: C.accent, borderColor: C.accent,
  },
  timeoutText: { fontSize: 13, fontWeight: '600', color: C.textSecondary },
  timeoutTextActive: { color: '#fff' },
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
}
