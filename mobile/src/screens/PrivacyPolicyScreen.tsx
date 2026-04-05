import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SPACING } from '../utils/constants';
import { useColors } from '../utils/theme';

const SECTIONS = [
  {
    title: '1. Dataansvarlig',
    body: `Payway ApS\nStørstedelen af vores databehandling sker for at levere vores betalingstjeneste til dig.\n\nKontakt: privacy@payway.fo`,
  },
  {
    title: '2. Hvilke data indsamler vi',
    body: `Vi indsamler følgende kategorier af persondata:\n\n• Identifikationsdata: Navn, telefonnummer, e-mail, PayWay-Tag\n• Finansielle data: Transaktionshistorik, wallet-saldo\n• Tekniske data: Enhedstype, OS-version, IP-adresse\n• Verifikationsdata: ID-dokumenter (ved KYC)\n• Kommunikation: Supporthenvendelser`,
  },
  {
    title: '3. Formål med behandlingen',
    body: `Vi behandler dine data for at:\n\n• Oprette og administrere din konto\n• Gennemføre betalinger og overførsler\n• Forebygge svindel og hvidvask (AML)\n• Overholde lovkrav og myndighedspåbud\n• Forbedre vores tjeneste\n• Sende servicemeddelelser`,
  },
  {
    title: '4. Retsgrundlag',
    body: `Vores behandling er baseret på:\n\n• Kontraktopfyldelse (art. 6(1)(b) GDPR)\n• Retlig forpligtelse (art. 6(1)(c) GDPR) – AML/KYC\n• Legitim interesse (art. 6(1)(f) GDPR) – svindelforebyggelse\n• Samtykke (art. 6(1)(a) GDPR) – markedsføring`,
  },
  {
    title: '5. Deling med tredjeparter',
    body: `Vi deler kun data med:\n\n• Stripe – betalingsformidling\n• Firebase – autentificering og push-notifikationer\n• Cloud-hosting – sikker datahåndtering\n• Myndigheder – ved lovkrav\n\nVi sælger aldrig dine persondata.`,
  },
  {
    title: '6. Opbevaring',
    body: `• Kontodata: Så længe du har en aktiv konto\n• Transaktionsdata: Op til 5 år jf. bogføringsloven\n• KYC-dokumenter: Op til 5 år efter kontolukning\n• Tekniske logs: 90 dage`,
  },
  {
    title: '7. Dine rettigheder',
    body: `Du har ret til:\n\n• Indsigt i dine data\n• Berigtigelse af forkerte data\n• Sletning ("retten til at blive glemt")\n• Begrænsning af behandling\n• Dataportabilitet\n• Indsigelse mod behandling\n\nKontakt privacy@payway.fo for at udøve dine rettigheder.`,
  },
];

export function PrivacyPolicyScreen() {
  const C = useColors();
  const styles = makeStyles(C);
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.badge}>
          <Ionicons name="shield-checkmark" size={20} color={C.primary} />
          <Text style={styles.badgeText}>GDPR-kompatibel</Text>
        </View>
        <Text style={styles.heading}>Privatlivspolitik</Text>
        <Text style={styles.updated}>Sidst opdateret: 1. april 2026</Text>

        {SECTIONS.map((section, i) => (
          <View key={i} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionBody}>{section.body}</Text>
          </View>
        ))}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Spørgsmål om dine data? Kontakt privacy@payway.fo
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

function makeStyles(C: any) {
  return StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background },
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
  badgeText: { fontSize: 12, fontWeight: '700', color: C.primary },
  heading: { fontSize: 22, fontWeight: '800', color: C.text },
  updated: { fontSize: 13, color: C.textLight, marginTop: SPACING.xs, marginBottom: SPACING.lg },
  section: { marginBottom: SPACING.lg },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: C.text, marginBottom: SPACING.sm },
  sectionBody: { fontSize: 14, color: C.textSecondary, lineHeight: 22 },
  footer: {
    backgroundColor: '#e8eef5', padding: SPACING.md, borderRadius: 12, marginTop: SPACING.md,
  },
  footerText: { fontSize: 13, color: C.primary, textAlign: 'center', fontWeight: '500' },
});
}
