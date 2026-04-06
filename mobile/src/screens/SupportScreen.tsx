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
import { SPACING } from '../utils/constants';
import { useColors } from '../utils/theme';

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

export function SupportScreen({ navigation }: any) {
  const C = useColors();
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <ScrollView style={[styles.container, { backgroundColor: C.background }]}>
      <View style={styles.content}>
        <Text style={[styles.heading, { color: C.text }]}>Hjælp & Support</Text>
        <Text style={[styles.subtitle, { color: C.textSecondary }]}>
          Find svar på ofte stillede spørgsmål eller kontakt os direkte
        </Text>

        {/* FAQ */}
        <Text style={[styles.sectionTitle, { color: C.text }]}>Ofte stillede spørgsmål</Text>
        <View style={[styles.faqList, { backgroundColor: C.surface, borderColor: C.border }]}>
          {FAQ.map((item, i) => (
            <View key={i}>
              <TouchableOpacity
                style={styles.faqRow}
                onPress={() => setExpanded(expanded === i ? null : i)}
                activeOpacity={0.7}
              >
                <Text style={[styles.faqQuestion, { color: C.text }]}>{item.q}</Text>
                <Ionicons
                  name={expanded === i ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color={C.textLight}
                />
              </TouchableOpacity>
              {expanded === i && (
                <View style={styles.faqAnswer}>
                  <Text style={[styles.faqAnswerText, { color: C.textSecondary }]}>{item.a}</Text>
                </View>
              )}
              {i < FAQ.length - 1 && <View style={[styles.divider, { backgroundColor: C.borderLight }]} />}
            </View>
          ))}
        </View>

        {/* Contact */}
        <Text style={[styles.sectionTitle, { color: C.text }]}>Kontakt os</Text>
        <View style={[styles.contactList, { backgroundColor: C.surface, borderColor: C.border }]}>
          <TouchableOpacity
            style={styles.contactRow}
            onPress={() => Linking.openURL('mailto:support@payway.fo')}
          >
            <View style={styles.contactIcon}>
              <Ionicons name="mail" size={20} color={C.accent} />
            </View>
            <View style={styles.contactInfo}>
              <Text style={[styles.contactTitle, { color: C.text }]}>E-mail</Text>
              <Text style={[styles.contactValue, { color: C.textSecondary }]}>support@payway.fo</Text>
            </View>
            <Ionicons name="open-outline" size={16} color={C.textLight} />
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: C.borderLight }]} />

          <TouchableOpacity
            style={styles.contactRow}
            onPress={() => navigation.navigate('LiveChat')}
          >
            <View style={[styles.contactIcon, { backgroundColor: '#e8eef5' }]}>
              <Ionicons name="chatbubbles" size={20} color={C.primary} />
            </View>
            <View style={styles.contactInfo}>
              <Text style={[styles.contactTitle, { color: C.text }]}>Live Chat</Text>
              <Text style={[styles.contactValue, { color: C.textSecondary }]}>Chat med vores AI-assistent</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={C.textLight} />
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: C.borderLight }]} />

          <TouchableOpacity
            style={styles.contactRow}
            onPress={() => Linking.openURL('mailto:support@payway.fo?subject=Problem%20med%20Payway')}
          >
            <View style={[styles.contactIcon, { backgroundColor: '#fef2f2' }]}>
              <Ionicons name="bug" size={20} color={C.danger} />
            </View>
            <View style={styles.contactInfo}>
              <Text style={[styles.contactTitle, { color: C.text }]}>Rapporter et problem</Text>
              <Text style={[styles.contactValue, { color: C.textSecondary }]}>Send en fejlrapport til os</Text>
            </View>
            <Ionicons name="open-outline" size={16} color={C.textLight} />
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: SPACING.xl, paddingBottom: SPACING.xxl },
  heading: { fontSize: 22, fontWeight: '800' },
  subtitle: { fontSize: 14, marginTop: SPACING.xs, marginBottom: SPACING.lg },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: SPACING.sm, marginTop: SPACING.md },
  faqList: {
    borderRadius: 16, borderWidth: 1,
    overflow: 'hidden',
  },
  faqRow: {
    flexDirection: 'row', alignItems: 'center',
    padding: SPACING.md, gap: SPACING.sm,
  },
  faqQuestion: { flex: 1, fontSize: 14, fontWeight: '600', lineHeight: 20 },
  faqAnswer: { paddingHorizontal: SPACING.md, paddingBottom: SPACING.md },
  faqAnswerText: { fontSize: 14, lineHeight: 20 },
  divider: { height: 1, marginHorizontal: SPACING.md },
  contactList: {
    borderRadius: 16, borderWidth: 1,
    overflow: 'hidden',
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
  contactTitle: { fontSize: 14, fontWeight: '600' },
  contactValue: { fontSize: 13, marginTop: 1 },
});
