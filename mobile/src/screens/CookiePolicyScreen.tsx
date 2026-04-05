import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SPACING } from '../utils/constants';
import { useColors } from '../utils/theme';

const SECTIONS = [
  {
    title: '1. Hvad er cookies',
    body: `Cookies er små tekstfiler, der gemmes på din enhed, når du bruger en hjemmeside eller app. De hjælper os med at huske dine præferencer og forbedre din oplevelse.\n\nPayway-appen bruger lignende teknologier (lokal lagring, tokens) til at fungere korrekt.`,
  },
  {
    title: '2. Nødvendige cookies',
    body: `Disse er påkrævet for at appen fungerer:\n\n• Autentificeringstokens – holder dig logget ind\n• Sessionstokens – sikrer sikker kommunikation\n• Sikkerhedsindstillinger – PIN/biometri-præferencer\n\nDisse kan ikke deaktiveres.`,
  },
  {
    title: '3. Funktionelle cookies',
    body: `Disse forbedrer din oplevelse:\n\n• Sprogpræferencer\n• Seneste modtagere (hurtigvalg)\n• Visningstilstand og layout-præferencer\n\nDu kan nulstille disse ved at logge ud.`,
  },
  {
    title: '4. Analytiske cookies',
    body: `Vi bruger anonymiseret analyse til at forstå, hvordan appen bruges:\n\n• Skærmvisninger og navigation\n• Fejlrapporter (crash analytics)\n• Ydeevnedata\n\nIngen persondata deles med analysetjenester.`,
  },
  {
    title: '5. Tredjepartscookies',
    body: `Vores samarbejdspartnere kan sætte cookies:\n\n• Stripe – til sikker betalingsformidling\n• Firebase – til autentificering og push\n\nVi har ingen kontrol over tredjeparters cookies. Se deres respektive privatlivspolitikker.`,
  },
  {
    title: '6. Dine valgmuligheder',
    body: `Du kan administrere cookies via:\n\n• Enhedsindstillinger – slet appdata\n• Log ud – fjerner sessionsdata\n• Kontakt os – anmod om fuld datasletning\n\nBemærk: Deaktivering af nødvendige cookies kan gøre appen ubrugelig.`,
  },
];

export function CookiePolicyScreen() {
  const C = useColors();
  const styles = makeStyles(C);
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.badge}>
          <Ionicons name="ellipse" size={18} color={C.primary} />
          <Text style={styles.badgeText}>Cookie-information</Text>
        </View>
        <Text style={styles.heading}>Cookiepolitik</Text>
        <Text style={styles.updated}>Sidst opdateret: 1. april 2026</Text>

        {SECTIONS.map((section, i) => (
          <View key={i} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionBody}>{section.body}</Text>
          </View>
        ))}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Spørgsmål om cookies? Kontakt privacy@payway.fo
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
