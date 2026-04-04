import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../utils/constants';

interface NotifSetting {
  key: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const SETTINGS: NotifSetting[] = [
  {
    key: 'received',
    title: 'Betalinger modtaget',
    description: 'Få besked når nogen sender dig penge',
    icon: 'arrow-down-circle',
  },
  {
    key: 'requests',
    title: 'Betalingsanmodninger',
    description: 'Få besked når nogen anmoder om penge',
    icon: 'hand-left',
  },
  {
    key: 'topups',
    title: 'Optankninger',
    description: 'Bekræftelse når din wallet er fyldt op',
    icon: 'wallet',
  },
  {
    key: 'news',
    title: 'Nyheder og tilbud',
    description: 'Bliv informeret om nye funktioner og tilbud',
    icon: 'megaphone',
  },
];

export function NotificationsScreen() {
  const [enabled, setEnabled] = useState<Record<string, boolean>>({
    received: true,
    requests: true,
    topups: true,
    news: true,
  });

  const toggle = (key: string) => {
    setEnabled((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.heading}>Notifikationer</Text>
        <Text style={styles.subtitle}>
          Vælg hvilke push-notifikationer du vil modtage
        </Text>

        <View style={styles.list}>
          {SETTINGS.map((setting, i) => (
            <View key={setting.key}>
              <View style={styles.row}>
                <View style={styles.iconBox}>
                  <Ionicons name={setting.icon} size={20} color={COLORS.accent} />
                </View>
                <View style={styles.info}>
                  <Text style={styles.title}>{setting.title}</Text>
                  <Text style={styles.desc}>{setting.description}</Text>
                </View>
                <Switch
                  value={enabled[setting.key]}
                  onValueChange={() => toggle(setting.key)}
                  trackColor={{ false: COLORS.border, true: COLORS.accentLight }}
                  thumbColor={enabled[setting.key] ? COLORS.accent : '#f4f4f5'}
                />
              </View>
              {i < SETTINGS.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>

        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={18} color={COLORS.accent} />
          <Text style={styles.infoText}>
            Du kan altid ændre notifikationsindstillinger i din enheds indstillinger under Payway.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.xl },
  heading: { fontSize: 22, fontWeight: '800', color: COLORS.text },
  subtitle: { fontSize: 14, color: COLORS.textSecondary, marginTop: SPACING.xs, marginBottom: SPACING.lg },
  list: {
    backgroundColor: COLORS.surface, borderRadius: 16, borderWidth: 1,
    borderColor: COLORS.border, overflow: 'hidden',
  },
  row: {
    flexDirection: 'row', alignItems: 'center',
    padding: SPACING.md, gap: SPACING.md,
  },
  iconBox: {
    width: 40, height: 40, borderRadius: 10,
    backgroundColor: '#e8faf0', justifyContent: 'center', alignItems: 'center',
  },
  info: { flex: 1 },
  title: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  desc: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  divider: { height: 1, backgroundColor: COLORS.borderLight, marginHorizontal: SPACING.md },
  infoBox: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    backgroundColor: '#e8faf0', padding: SPACING.md, borderRadius: 12, marginTop: SPACING.lg,
  },
  infoText: { flex: 1, fontSize: 13, color: COLORS.accent, lineHeight: 18 },
});
