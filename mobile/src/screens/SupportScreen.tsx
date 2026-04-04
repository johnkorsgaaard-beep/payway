import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../utils/constants';

interface FaqItem {
  q: string;
  a: string;
}

const FAQ: FaqItem[] = [
  {
    q: 'Hvordan fylder jeg op på min wallet?',
    a: 'Gå til Hjem-skærmen og tryk "Fyld op". Vælg et beløb (min. 50 DKK) og bekræft. Beløbet trækkes fra dit tilknyttede betalingskort.',
  },
  {
    q: 'Hvordan sender jeg penge til en ven?',
    a: 'Tryk "Send" på Hjem-skærmen. Indtast modtagerens telefonnummer, beløb og en valgfri besked. Bekræft med PIN eller Face ID.',
  },
  {
    q: 'Hvordan betaler jeg i en butik?',
    a: 'Tryk "Scan" i bunden af skærmen og scan butikkens QR-kode. Bekræft beløbet og godkend med PIN eller Face ID.',
  },
  {
    q: 'Er mine penge sikre?',
    a: 'Ja. Payway bruger Stripe som betalingsinfrastruktur, og dine kortoplysninger håndteres af Stripe i et PCI DSS-certificeret miljø. Dine penge er beskyttet.',
  },
  {
    q: 'Hvad koster det at bruge Payway?',
    a: 'Det er gratis at sende penge til venner. Butikker betaler et lille transaktionsgebyr. Se "Vilkår & Betingelser" for fulde gebyroplysninger.',
  },
  {
    q: 'Hvordan ændrer jeg min PIN-kode?',
    a: 'Gå til Profil → Skift PIN. Indtast din nuværende PIN og vælg en ny 4-cifret PIN.',
  },
];

export function SupportScreen() {
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.heading}>Hjælp & Support</Text>
        <Text style={styles.subtitle}>
          Find svar på ofte stillede spørgsmål eller kontakt os direkte
        </Text>

        {/* FAQ */}
        <Text style={styles.sectionTitle}>Ofte stillede spørgsmål</Text>
        <View style={styles.faqList}>
          {FAQ.map((item, i) => (
            <View key={i}>
              <TouchableOpacity
                style={styles.faqRow}
                onPress={() => setExpanded(expanded === i ? null : i)}
                activeOpacity={0.7}
              >
                <Text style={styles.faqQuestion}>{item.q}</Text>
                <Ionicons
                  name={expanded === i ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color={COLORS.textLight}
                />
              </TouchableOpacity>
              {expanded === i && (
                <View style={styles.faqAnswer}>
                  <Text style={styles.faqAnswerText}>{item.a}</Text>
                </View>
              )}
              {i < FAQ.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>

        {/* Contact */}
        <Text style={styles.sectionTitle}>Kontakt os</Text>
        <View style={styles.contactList}>
          <TouchableOpacity
            style={styles.contactRow}
            onPress={() => Linking.openURL('mailto:support@payway.fo')}
          >
            <View style={styles.contactIcon}>
              <Ionicons name="mail" size={20} color={COLORS.accent} />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactTitle}>E-mail</Text>
              <Text style={styles.contactValue}>support@payway.fo</Text>
            </View>
            <Ionicons name="open-outline" size={16} color={COLORS.textLight} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.contactRow}
            onPress={() => Linking.openURL('tel:+298123456')}
          >
            <View style={styles.contactIcon}>
              <Ionicons name="call" size={20} color={COLORS.accent} />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactTitle}>Telefon</Text>
              <Text style={styles.contactValue}>+298 123 456</Text>
            </View>
            <Ionicons name="open-outline" size={16} color={COLORS.textLight} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.contactRow}
            onPress={() => Linking.openURL('mailto:support@payway.fo?subject=Problem%20med%20Payway')}
          >
            <View style={[styles.contactIcon, { backgroundColor: '#fef2f2' }]}>
              <Ionicons name="bug" size={20} color={COLORS.danger} />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactTitle}>Rapporter et problem</Text>
              <Text style={styles.contactValue}>Send en fejlrapport til os</Text>
            </View>
            <Ionicons name="open-outline" size={16} color={COLORS.textLight} />
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.xl, paddingBottom: SPACING.xxl },
  heading: { fontSize: 22, fontWeight: '800', color: COLORS.text },
  subtitle: { fontSize: 14, color: COLORS.textSecondary, marginTop: SPACING.xs, marginBottom: SPACING.lg },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.sm, marginTop: SPACING.md },
  faqList: {
    backgroundColor: COLORS.surface, borderRadius: 16, borderWidth: 1,
    borderColor: COLORS.border, overflow: 'hidden',
  },
  faqRow: {
    flexDirection: 'row', alignItems: 'center',
    padding: SPACING.md, gap: SPACING.sm,
  },
  faqQuestion: { flex: 1, fontSize: 14, fontWeight: '600', color: COLORS.text, lineHeight: 20 },
  faqAnswer: { paddingHorizontal: SPACING.md, paddingBottom: SPACING.md },
  faqAnswerText: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 20 },
  divider: { height: 1, backgroundColor: COLORS.borderLight, marginHorizontal: SPACING.md },
  contactList: {
    backgroundColor: COLORS.surface, borderRadius: 16, borderWidth: 1,
    borderColor: COLORS.border, overflow: 'hidden',
  },
  contactRow: {
    flexDirection: 'row', alignItems: 'center',
    padding: SPACING.md, gap: SPACING.md,
  },
  contactIcon: {
    width: 40, height: 40, borderRadius: 10,
    backgroundColor: '#e8faf0', justifyContent: 'center', alignItems: 'center',
  },
  contactInfo: { flex: 1 },
  contactTitle: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  contactValue: { fontSize: 13, color: COLORS.textSecondary, marginTop: 1 },
});
