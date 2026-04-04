import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../utils/constants';
import { useAuth } from '../store/auth';

const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string; icon: keyof typeof Ionicons.glyphMap }> = {
  NONE: { color: COLORS.danger, bg: '#fef2f2', label: 'Ikke verificeret', icon: 'close-circle' },
  BASIC: { color: COLORS.warning, bg: '#fef3c7', label: 'Basis verificeret', icon: 'alert-circle' },
  VERIFIED: { color: COLORS.success, bg: '#f0fdf4', label: 'Fuldt verificeret', icon: 'checkmark-circle' },
};

interface Tier {
  level: string;
  title: string;
  description: string;
  limits: string;
  requirements: string[];
  completed: boolean;
}

export function KycScreen() {
  const { user } = useAuth();
  const status = user?.kycStatus || 'NONE';
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.NONE;

  const tiers: Tier[] = [
    {
      level: 'BASIC',
      title: 'Tier 1 — Basis',
      description: 'Grundlæggende verifikation via telefonnummer',
      limits: 'Op til 5.000 DKK/måned',
      requirements: ['Telefonnummer verificeret', 'Navn angivet'],
      completed: status === 'BASIC' || status === 'VERIFIED',
    },
    {
      level: 'VERIFIED',
      title: 'Tier 2 — Fuld verifikation',
      description: 'Upload ID-dokument for fulde funktioner',
      limits: 'Op til 50.000 DKK/måned',
      requirements: ['Gyldigt billed-ID (pas eller kørekort)', 'Selfie-verifikation'],
      completed: status === 'VERIFIED',
    },
  ];

  const handleUploadId = () => {
    Alert.alert(
      'ID-verifikation',
      'I produktionsversionen åbner kameraet her, så du kan tage billede af dit ID.',
      [{ text: 'OK' }]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={[styles.statusCard, { backgroundColor: config.bg }]}>
          <Ionicons name={config.icon} size={32} color={config.color} />
          <Text style={[styles.statusLabel, { color: config.color }]}>{config.label}</Text>
          <Text style={styles.statusSub}>
            {status === 'VERIFIED'
              ? 'Du har fuld adgang til alle funktioner'
              : 'Opgrader din verifikation for højere grænser'}
          </Text>
        </View>

        {tiers.map((tier) => (
          <View key={tier.level} style={styles.tierCard}>
            <View style={styles.tierHeader}>
              <Text style={styles.tierTitle}>{tier.title}</Text>
              {tier.completed ? (
                <View style={styles.completedBadge}>
                  <Ionicons name="checkmark" size={14} color={COLORS.success} />
                  <Text style={styles.completedText}>Opfyldt</Text>
                </View>
              ) : (
                <View style={styles.pendingBadge}>
                  <Text style={styles.pendingText}>Afventer</Text>
                </View>
              )}
            </View>
            <Text style={styles.tierDesc}>{tier.description}</Text>
            <Text style={styles.tierLimits}>{tier.limits}</Text>

            <View style={styles.reqList}>
              {tier.requirements.map((req, i) => (
                <View key={i} style={styles.reqRow}>
                  <Ionicons
                    name={tier.completed ? 'checkmark-circle' : 'ellipse-outline'}
                    size={18}
                    color={tier.completed ? COLORS.success : COLORS.textLight}
                  />
                  <Text style={[styles.reqText, tier.completed && styles.reqDone]}>
                    {req}
                  </Text>
                </View>
              ))}
            </View>

            {tier.level === 'VERIFIED' && !tier.completed && (
              <TouchableOpacity style={styles.uploadButton} onPress={handleUploadId}>
                <Ionicons name="camera" size={20} color="#fff" />
                <Text style={styles.uploadText}>Upload ID-dokument</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}

        <View style={styles.infoBox}>
          <Ionicons name="lock-closed" size={16} color={COLORS.primary} />
          <Text style={styles.infoText}>
            Dine dokumenter krypteres og bruges kun til verifikationsformål i henhold til gældende lovgivning.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.xl, paddingBottom: SPACING.xxl },
  statusCard: {
    borderRadius: 16, padding: SPACING.xl, alignItems: 'center',
    marginBottom: SPACING.lg, gap: SPACING.xs,
  },
  statusLabel: { fontSize: 18, fontWeight: '800' },
  statusSub: { fontSize: 13, color: COLORS.textSecondary, textAlign: 'center' },
  tierCard: {
    backgroundColor: COLORS.surface, borderRadius: 16, padding: SPACING.lg,
    borderWidth: 1, borderColor: COLORS.border, marginBottom: SPACING.md,
  },
  tierHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tierTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  completedBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#dcfce7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10,
  },
  completedText: { fontSize: 12, fontWeight: '600', color: COLORS.success },
  pendingBadge: {
    backgroundColor: '#fef3c7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10,
  },
  pendingText: { fontSize: 12, fontWeight: '600', color: COLORS.warning },
  tierDesc: { fontSize: 14, color: COLORS.textSecondary, marginTop: SPACING.sm },
  tierLimits: { fontSize: 13, fontWeight: '600', color: COLORS.primary, marginTop: SPACING.xs },
  reqList: { marginTop: SPACING.md, gap: SPACING.sm },
  reqRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  reqText: { fontSize: 14, color: COLORS.text },
  reqDone: { color: COLORS.textSecondary, textDecorationLine: 'line-through' },
  uploadButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm,
    backgroundColor: COLORS.accent, borderRadius: 12, paddingVertical: 14, marginTop: SPACING.md,
  },
  uploadText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  infoBox: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    backgroundColor: '#e8faf0', padding: SPACING.md, borderRadius: 12, marginTop: SPACING.sm,
  },
  infoText: { flex: 1, fontSize: 12, color: COLORS.primary, lineHeight: 18 },
});
