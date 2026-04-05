import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { SPACING } from '../utils/constants';
import { useColors } from '../utils/theme';
import { formatDKK } from '../utils/format';
import { api } from '../services/api';
import { useAuth } from '../store/auth';

interface QrData {
  reference: string;
  merchantName: string;
  amount: number | null;
  label: string | null;
}

export function ScanScreen({ navigation }: any) {
  const C = useColors();
  const styles = makeStyles(C);
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [qrData, setQrData] = useState<QrData | null>(null);
  const [amount, setAmount] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, refreshUser } = useAuth();

  const defaultCard = user?.cards?.find((c) => c.isDefault) || user?.cards?.[0];

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Ionicons name="camera-outline" size={64} color={C.textLight} />
        <Text style={styles.permissionText}>
          Vi har brug for adgang til kameraet for at scanne QR-koder
        </Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Giv adgang</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);

    try {
      const reference = data.startsWith('payway://') ? data.replace('payway://', '') : data;
      const res = await api.get<QrData>(`/merchant/qr/${reference}`);
      setQrData(res);
      if (res.amount) {
        setAmount((res.amount / 100).toString());
      }
    } catch {
      Alert.alert('Fejl', 'Ugyldig QR-kode', [
        { text: 'Prøv igen', onPress: () => setScanned(false) },
      ]);
    }
  };

  const handlePay = async () => {
    if (!qrData) return;
    if (!amount || parseInt(amount) <= 0) {
      Alert.alert('Fejl', 'Indtast et beløb');
      return;
    }
    if (pin.length !== 4) {
      Alert.alert('Fejl', 'Indtast din 4-cifrede PIN');
      return;
    }
    if (!defaultCard) {
      Alert.alert('Fejl', 'Du skal tilføje et betalingskort først. Gå til Profil → Betalingskort.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/wallet/pay', {
        qrReference: qrData.reference,
        amount: parseInt(amount) * 100,
        pin,
        paymentCardId: defaultCard.id,
      });

      await refreshUser();

      Alert.alert(
        'Betalt!',
        `${formatDKK(parseInt(amount) * 100)} betalt til ${qrData.merchantName}`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (err: any) {
      Alert.alert('Fejl', err.message || 'Betaling fejlede');
    } finally {
      setLoading(false);
    }
  };

  if (qrData) {
    return (
      <View style={styles.payContainer}>
        <View style={styles.merchantCard}>
          <View style={styles.merchantIcon}>
            <Ionicons name="storefront" size={32} color={C.accent} />
          </View>
          <Text style={styles.merchantName}>{qrData.merchantName}</Text>
          {qrData.label && (
            <Text style={styles.merchantLabel}>{qrData.label}</Text>
          )}
        </View>

        {!qrData.amount && (
          <>
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
          </>
        )}

        {qrData.amount && (
          <Text style={styles.fixedAmount}>{formatDKK(qrData.amount)}</Text>
        )}

        {/* Card indicator */}
        {defaultCard && (
          <View style={styles.cardIndicator}>
            <Ionicons name="card" size={18} color={C.accent} />
            <Text style={styles.cardIndicatorText}>
              Betales med {defaultCard.brand.toUpperCase()} •••• {defaultCard.last4}
            </Text>
          </View>
        )}

        <Text style={styles.label}>PIN-kode</Text>
        <TextInput
          style={[styles.input, styles.pinInput]}
          value={pin}
          onChangeText={setPin}
          keyboardType="number-pad"
          maxLength={4}
          secureTextEntry
          placeholder="----"
          placeholderTextColor={C.textLight}
          textAlign="center"
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handlePay}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>
              Betal {amount ? formatDKK(parseInt(amount) * 100) : ''}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => {
            setQrData(null);
            setScanned(false);
            setPin('');
            setAmount('');
          }}
        >
          <Text style={styles.cancelText}>Annuller</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      />
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
          <Text style={styles.backText}>Tilbage</Text>
        </TouchableOpacity>
        <View style={styles.scanFrame} />
        <Text style={styles.scanText}>
          Scan butikkens QR-kode
        </Text>
      </View>
    </View>
  );
}

function makeStyles(C: any) {
  return StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
  },
  backText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  scanFrame: {
    width: 250,
    height: 250,
    borderWidth: 3,
    borderColor: C.accent,
    borderRadius: 24,
    backgroundColor: 'transparent',
  },
  scanText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginTop: SPACING.lg,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
    backgroundColor: C.background,
    gap: SPACING.md,
  },
  permissionText: {
    fontSize: 16,
    color: C.textSecondary,
    textAlign: 'center',
  },
  payContainer: {
    flex: 1,
    backgroundColor: C.background,
    padding: SPACING.xl,
    justifyContent: 'center',
  },
  merchantCard: {
    backgroundColor: C.surface,
    borderRadius: 20,
    padding: SPACING.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: SPACING.lg,
  },
  merchantIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#e8faf0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  merchantName: {
    fontSize: 20,
    fontWeight: '700',
    color: C.text,
  },
  merchantLabel: {
    fontSize: 14,
    color: C.textSecondary,
    marginTop: SPACING.xs,
  },
  fixedAmount: {
    fontSize: 36,
    fontWeight: '800',
    color: C.accent,
    textAlign: 'center',
    marginVertical: SPACING.md,
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
  },
  amountInput: {
    fontSize: 28,
    fontWeight: '700',
    paddingVertical: 20,
  },
  pinInput: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: 12,
    paddingVertical: 16,
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
  cancelButton: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  cancelText: {
    color: C.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  cardIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: '#e8faf0',
    padding: SPACING.md,
    borderRadius: 12,
    marginTop: SPACING.md,
  },
  cardIndicatorText: {
    fontSize: 14,
    fontWeight: '600',
    color: C.accent,
  },
});
}
