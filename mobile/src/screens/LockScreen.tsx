import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Image,
} from 'react-native';
import * as LocalAuthentication from '../utils/biometrics';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SPACING } from '../utils/constants';
import { useColors } from '../utils/theme';
import { useAppLock } from '../store/appLock';

const PIN_LENGTH = 4;

export function LockScreen() {
  const C = useColors();
  const insets = useSafeAreaInsets();
  const { settings, unlock } = useAppLock();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const triggerBiometric = useCallback(async () => {
    if (settings.method === 'pin') return;

    try {
      const hasHW = await LocalAuthentication.hasHardwareAsync();
      if (!hasHW) return;

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Lås PayWay op',
        cancelLabel: 'Brug PIN',
        disableDeviceFallback: true,
      });

      if (result.success) {
        unlock();
      }
    } catch {}
  }, [settings.method, unlock]);

  useEffect(() => {
    if (settings.method !== 'pin') {
      const timer = setTimeout(triggerBiometric, 400);
      return () => clearTimeout(timer);
    }
  }, [settings.method, triggerBiometric]);

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 15, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -15, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const handleDigit = (digit: string) => {
    if (pin.length >= PIN_LENGTH) return;
    const next = pin + digit;
    setPin(next);
    setError('');

    if (next.length === PIN_LENGTH) {
      setTimeout(() => {
        // Demo: accept any 4-digit PIN
        unlock();
      }, 200);
    }
  };

  const handleDelete = () => {
    if (pin.length === 0) return;
    setPin(pin.slice(0, -1));
    setError('');
  };

  const handleBiometric = () => {
    triggerBiometric();
  };

  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'delete'];

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor: C.background, paddingTop: insets.top + 40, paddingBottom: insets.bottom + 20, opacity: fadeAnim },
      ]}
    >
      <View style={styles.header}>
        <Image
          source={require('../../assets/payway-logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={[styles.title, { color: C.text }]}>PayWay er låst</Text>
        <Text style={[styles.subtitle, { color: C.textSecondary }]}>
          Indtast din PIN-kode for at fortsætte
        </Text>
      </View>

      <Animated.View style={[styles.dotsRow, { transform: [{ translateX: shakeAnim }] }]}>
        {Array.from({ length: PIN_LENGTH }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              { borderColor: error ? C.danger : C.border },
              i < pin.length && {
                backgroundColor: error ? C.danger : C.accent,
                borderColor: error ? C.danger : C.accent,
              },
            ]}
          />
        ))}
      </Animated.View>

      {error ? (
        <Text style={[styles.errorText, { color: C.danger }]}>{error}</Text>
      ) : (
        <View style={styles.errorPlaceholder} />
      )}

      <View style={styles.keypad}>
        {digits.map((d, i) => {
          if (d === '') {
            if (settings.method !== 'pin') {
              return (
                <TouchableOpacity
                  key={i}
                  style={styles.key}
                  onPress={handleBiometric}
                >
                  <Ionicons name="finger-print" size={28} color={C.accent} />
                </TouchableOpacity>
              );
            }
            return <View key={i} style={styles.key} />;
          }

          if (d === 'delete') {
            return (
              <TouchableOpacity
                key={i}
                style={styles.key}
                onPress={handleDelete}
                onLongPress={() => setPin('')}
              >
                <Ionicons name="backspace-outline" size={26} color={C.text} />
              </TouchableOpacity>
            );
          }

          return (
            <TouchableOpacity
              key={i}
              style={[styles.key, styles.digitKey, { backgroundColor: C.surface, borderColor: C.borderLight }]}
              onPress={() => handleDigit(d)}
              activeOpacity={0.6}
            >
              <Text style={[styles.digitText, { color: C.text }]}>{d}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    gap: SPACING.sm,
  },
  logo: {
    width: 60,
    height: 60,
    borderRadius: 14,
    marginBottom: SPACING.sm,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 14,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  dot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
  },
  errorText: {
    fontSize: 13,
    fontWeight: '600',
    height: 20,
  },
  errorPlaceholder: {
    height: 20,
  },
  keypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 280,
    justifyContent: 'center',
  },
  key: {
    width: 280 / 3,
    height: 68,
    justifyContent: 'center',
    alignItems: 'center',
  },
  digitKey: {
    margin: 4,
    width: 280 / 3 - 8,
    borderRadius: 16,
    borderWidth: 1,
  },
  digitText: {
    fontSize: 28,
    fontWeight: '600',
  },
});
