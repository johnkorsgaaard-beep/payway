import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SPACING } from '../utils/constants';
import { useColors } from '../utils/theme';

const SECTIONS = [
  {
    title: '1. Indledning',
    body: `Denne databehandlingsaftale (DPA) regulerer behandlingen af persondata, som Payway ApS foretager på vegne af brugere af Payway-tjenesten.\n\nAftalen sikrer overholdelse af GDPR og gældende færøsk/dansk databeskyttelseslovgivning.`,
  },
  {
    title: '2. Databehandlerens forpligtelser',
    body: `Payway ApS forpligter sig til at:\n\n• Kun behandle data efter dokumenteret instruks\n• Sikre at medarbejdere er underlagt fortrolighed\n• Træffe passende tekniske og organisatoriske sikkerhedsforanstaltninger\n• Bistå den registrerede med udøvelse af rettigheder\n• Slette data efter endt behandling (med forbehold for lovkrav)\n• Stille information til rådighed for revisioner`,
  },
  {
    title: '3. Underdatabehandlere',
    body: `Payway anvender følgende underdatabehandlere:\n\n• Stripe, Inc. (USA) – betalingsformidling\n  Standard Contractual Clauses (SCC)\n\n• Google Firebase (USA) – autentificering, notifikationer\n  Standard Contractual Clauses (SCC)\n\n• Cloud-hosting (EU) – datalagring og -behandling\n\nÆndringer i underdatabehandlere meddeles med 30 dages varsel.`,
  },
  {
    title: '4. Sikkerhedsforanstaltninger',
    body: `Vi implementerer følgende sikkerhed:\n\n• Kryptering i transit (TLS 1.3) og hvile (AES-256)\n• Adgangskontrol med mindst privilegium\n• Regelmæssig sikkerhedstest og penetrationstest\n• Logning og overvågning af adgang\n• Disaster recovery og backup-procedurer\n• PCI DSS Level 1 via Stripe`,
  },
  {
    title: '5. Overførsler til tredjelande',
    body: `Data kan overføres til USA via vores underdatabehandlere. Disse overførsler er sikret ved:\n\n• EU Standard Contractual Clauses (SCC)\n• Supplerende sikkerhedsforanstaltninger\n• Vurdering af tredjelands lovgivning (TIA)`,
  },
  {
    title: '6. Brud på datasikkerheden',
    body: `Ved sikkerhedsbrud vil Payway:\n\n• Underrette den registrerede uden unødig forsinkelse\n• Dokumentere bruddet og dets konsekvenser\n• Anmelde til Datatilsynet inden 72 timer (hvis påkrævet)\n• Træffe foranstaltninger for at afhjælpe bruddet`,
  },
  {
    title: '7. Varighed og ophør',
    body: `Denne aftale gælder så længe du har en aktiv Payway-konto.\n\nVed ophør slettes dine data inden for 30 dage, medmindre opbevaring er påkrævet ved lov (bogføringsloven: op til 5 år).`,
  },
];

export function DataProcessingScreen() {
  const C = useColors();

  return (
    <ScrollView style={[styles.container, { backgroundColor: C.background }]}>
      <View style={styles.content}>
        <View style={styles.badge}>
          <Ionicons name="server" size={18} color={C.primary} />
          <Text style={[styles.badgeText, { color: C.primary }]}>DPA</Text>
        </View>
        <Text style={[styles.heading, { color: C.text }]}>Databehandlingsaftale</Text>
        <Text style={[styles.updated, { color: C.textLight }]}>Sidst opdateret: 1. april 2026</Text>

        {SECTIONS.map((section, i) => (
          <View key={i} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: C.text }]}>{section.title}</Text>
            <Text style={[styles.sectionBody, { color: C.textSecondary }]}>{section.body}</Text>
          </View>
        ))}

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: C.primary }]}>
            Juridiske spørgsmål? Kontakt legal@payway.fo
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: SPACING.xl, paddingBottom: SPACING.xxl * 2 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    backgroundColor: '#e8eef5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: SPACING.md,
  },
  badgeText: { fontSize: 12, fontWeight: '700' },
  heading: { fontSize: 22, fontWeight: '800' },
  updated: { fontSize: 13, marginTop: SPACING.xs, marginBottom: SPACING.lg },
  section: { marginBottom: SPACING.lg },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: SPACING.sm },
  sectionBody: { fontSize: 14, lineHeight: 22 },
  footer: {
    backgroundColor: '#e8eef5', padding: SPACING.md, borderRadius: 12, marginTop: SPACING.md,
  },
  footerText: { fontSize: 13, textAlign: 'center', fontWeight: '500' },
});
