import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { COLORS, SPACING } from '../utils/constants';

interface Section {
  title: string;
  body: string;
}

const SECTIONS: Section[] = [
  {
    title: '1. Generelt',
    body: `Payway er en mobil betalingstjeneste udbudt af Payway ApS (herefter "Payway", "vi", "os") til brug på Færøerne.

Ved at oprette en konto og bruge Payway accepterer du disse vilkår og betingelser i deres helhed.

Payway giver dig mulighed for at sende og modtage penge, betale i tilsluttede butikker samt administrere din digitale wallet.`,
  },
  {
    title: '2. Oprettelse og brug',
    body: `For at bruge Payway skal du:
• Være mindst 15 år
• Have et gyldigt færøsk eller dansk telefonnummer (+298 eller +45)
• Angive korrekte personoplysninger

Du er ansvarlig for at holde dine login-oplysninger, PIN-kode og biometriske indstillinger fortrolige. Payway er ikke ansvarlig for uautoriseret brug af din konto, hvis du ikke har beskyttet dine adgangsoplysninger.`,
  },
  {
    title: '3. Wallet og optankning',
    body: `Din Payway-wallet kan optankes via et tilknyttet betalingskort (Visa eller Mastercard).

Minimum optankning: 50,00 DKK
Maksimal wallet-saldo: 10.000,00 DKK

Beløbet trækkes fra dit betalingskort via vores betalingspartner Stripe. Wallet-saldoen er ikke en bankkonto og er ikke omfattet af indskydergarantien.`,
  },
  {
    title: '4. Gebyrer',
    body: `Følgende gebyrer gælder:

Optankning via betalingskort:
Et betalingsformidlingsgebyr på op til 5% pålægges ved optankning. Gebyret dækker omkostninger til betalingsformidling og er indeholdt i den samlede transaktion, der trækkes fra dit betalingskort.

Person-til-person overførsler (P2P):
De første 10 overførsler pr. kalendermåned er gratis. Herefter pålægges et gebyr på 0,5% pr. overførsel.

Butiksbetalinger:
Gratis for brugere. Butikker betaler et transaktionsgebyr på 1-2%.

Udbetaling til bankkonto:
5,00 DKK pr. udbetaling.

Gebyrer kan ændres med 30 dages varsel via appen eller e-mail.`,
  },
  {
    title: '5. Transaktionsgrænser',
    body: `Følgende grænser gælder afhængigt af dit verifikationsniveau:

Basis-verificeret (Tier 1):
• Daglig grænse: 5.000 DKK
• Månedlig grænse: 10.000 DKK

Fuldt verificeret (Tier 2):
• Daglig grænse: 10.000 DKK
• Månedlig grænse: 50.000 DKK

Grænser kan justeres af Payway i henhold til gældende lovgivning.`,
  },
  {
    title: '6. Sikkerhed og ansvar',
    body: `Payway anvender branchestandarder for sikkerhed:
• Kortdata håndteres af Stripe (PCI DSS Level 1)
• Al kommunikation er krypteret (TLS/HTTPS)
• Betalinger bekræftes med PIN-kode eller biometri

Payway er ikke ansvarlig for:
• Tab som følge af, at du har delt dine adgangsoplysninger
• Fejl forårsaget af din bank eller kortudsteder
• Driftsforstyrrelser forårsaget af force majeure

Ved mistanke om misbrug skal du straks kontakte os på support@payway.fo.`,
  },
  {
    title: '7. Persondata',
    body: `Payway behandler persondata i overensstemmelse med gældende databeskyttelseslovgivning.

Vi indsamler og behandler:
• Telefonnummer og navn
• Transaktionshistorik
• Enhedsoplysninger (til sikkerhedsformål)

Vi deler ikke dine data med tredjeparter undtagen:
• Stripe (betalingsformidling)
• Firebase (autentificering og notifikationer)
• Myndigheder (ved lovkrav)

Du kan til enhver tid anmode om indsigt i eller sletning af dine data ved at kontakte support@payway.fo.`,
  },
  {
    title: '8. Opsigelse',
    body: `Du kan til enhver tid lukke din Payway-konto via appen eller ved at kontakte os.

Ved lukning af kontoen:
• Resterende saldo udbetales til din bankkonto
• Dine data opbevares i op til 5 år jf. bogføringslovgivningen
• Din konto kan ikke genaktiveres

Payway forbeholder sig retten til at lukke eller fryse konti ved mistanke om misbrug, hvidvask eller overtrædelse af disse vilkår.`,
  },
];

export function TermsScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.heading}>Vilkår & Betingelser</Text>
        <Text style={styles.updated}>Sidst opdateret: 1. april 2026</Text>

        {SECTIONS.map((section, i) => (
          <View key={i} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionBody}>{section.body}</Text>
          </View>
        ))}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Spørgsmål til vilkårene? Kontakt os på support@payway.fo
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.xl, paddingBottom: SPACING.xxl * 2 },
  heading: { fontSize: 22, fontWeight: '800', color: COLORS.text },
  updated: { fontSize: 13, color: COLORS.textLight, marginTop: SPACING.xs, marginBottom: SPACING.lg },
  section: { marginBottom: SPACING.lg },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.sm },
  sectionBody: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 22 },
  footer: {
    backgroundColor: '#e8faf0', padding: SPACING.md, borderRadius: 12, marginTop: SPACING.md,
  },
  footerText: { fontSize: 13, color: COLORS.accent, textAlign: 'center' },
});
