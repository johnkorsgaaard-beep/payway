import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Image,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SPACING } from '../utils/constants';
import { useColors, useTheme, type ThemeMode } from '../utils/theme';
import { formatPhone } from '../utils/format';
import { useAuth } from '../store/auth';

type MenuItem = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  screen: string;
  destructive?: boolean;
};

function MenuSection({ title, items, onPress }: {
  title: string;
  items: MenuItem[];
  onPress: (screen: string) => void;
}) {
  const C = useColors();
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: C.textLight }]}>{title}</Text>
      <View style={[styles.menu, { backgroundColor: C.surface, borderColor: C.border }]}>
        {items.map((item, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.menuItem, { borderBottomColor: C.borderLight }, i === items.length - 1 && styles.menuItemLast]}
            onPress={() => onPress(item.screen)}
          >
            <View style={[styles.menuIcon, item.destructive && styles.menuIconDanger]}>
              <Ionicons name={item.icon} size={20} color={item.destructive ? C.danger : C.primary} />
            </View>
            <Text style={[styles.menuLabel, { color: item.destructive ? C.danger : C.text }]}>
              {item.label}
            </Text>
            <Ionicons name="chevron-forward" size={18} color={C.textLight} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const THEME_OPTIONS: { value: ThemeMode; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: 'light', label: 'Lys', icon: 'sunny' },
  { value: 'dark', label: 'Mørk', icon: 'moon' },
  { value: 'system', label: 'System', icon: 'phone-portrait-outline' },
];

export function ProfileScreen({ navigation }: any) {
  const C = useColors();
  const { mode, setMode } = useTheme();
  const { user, logout } = useAuth();
  const [deleteStep, setDeleteStep] = useState(0);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  const handleLogout = () => {
    Alert.alert('Log ud', 'Er du sikker på at du vil logge ud?', [
      { text: 'Annuller', style: 'cancel' },
      { text: 'Log ud', style: 'destructive', onPress: logout },
    ]);
  };

  const handleDeleteAccount = () => {
    setDeleteStep(1);
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirmText !== 'SLET') return;
    Alert.alert(
      'Endelig bekræftelse',
      'Din konto, saldo og alle data vil blive permanent slettet. Resterende saldo udbetales til din bankkonto inden for 5 hverdage.\n\nDenne handling kan IKKE fortrydes.',
      [
        { text: 'Annuller', style: 'cancel', onPress: () => { setDeleteStep(0); setDeleteConfirmText(''); } },
        {
          text: 'Slet min konto permanent',
          style: 'destructive',
          onPress: () => {
            setDeleteStep(0);
            setDeleteConfirmText('');
            Alert.alert('Konto slettet', 'Din konto er blevet slettet. Du vil nu blive logget ud.', [
              { text: 'OK', onPress: logout },
            ]);
          },
        },
      ],
    );
  };

  const accountItems: MenuItem[] = [
    { icon: 'card', label: 'Betalingskort', screen: 'Cards' },
    { icon: 'lock-closed', label: 'Skift PIN', screen: 'ChangePin' },
    { icon: 'finger-print', label: 'Biometri', screen: 'Biometrics' },
    { icon: 'notifications', label: 'Notifikationer', screen: 'Notifications' },
    { icon: 'shield-checkmark', label: 'KYC Verifikation', screen: 'KYC' },
  ];

  const supportItems: MenuItem[] = [
    { icon: 'help-circle', label: 'Hjælp & Support', screen: 'Support' },
  ];

  const legalItems: MenuItem[] = [
    { icon: 'document-text', label: 'Vilkår & Betingelser', screen: 'Terms' },
    { icon: 'shield', label: 'Privatlivspolitik', screen: 'PrivacyPolicy' },
    { icon: 'cookie', label: 'Cookiepolitik', screen: 'CookiePolicy' },
    { icon: 'server', label: 'Databehandlingsaftale', screen: 'DataProcessing' },
    { icon: 'information-circle', label: 'Om Payway', screen: 'About' },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: C.background }]}>
      {/* Profile Header */}
      <TouchableOpacity
        style={[styles.header, { backgroundColor: C.surface, borderColor: C.border }]}
        onPress={() => navigation.navigate('EditProfile')}
        activeOpacity={0.7}
      >
        {user?.profileImage ? (
          <Image source={{ uri: user.profileImage }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatarFallback, { backgroundColor: C.primary }]}>
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0)?.toUpperCase() || '?'}
            </Text>
          </View>
        )}
        <View style={styles.headerInfo}>
          <Text style={[styles.name, { color: C.text }]}>{user?.name || 'Ukendt'}</Text>
          {user?.paywayTag ? (
            <Text style={[styles.tag, { color: C.primary }]}>@{user.paywayTag}</Text>
          ) : (
            <Text style={[styles.phone, { color: C.textSecondary }]}>
              {user?.phone ? formatPhone(user.phone) : ''}
            </Text>
          )}
        </View>
        <View style={styles.editBadge}>
          <Ionicons name="create-outline" size={16} color={C.primary} />
        </View>
      </TouchableOpacity>

      {/* KYC Badge */}
      <View style={styles.kycRow}>
        <View style={[styles.kycBadge, { backgroundColor: C.surface, borderColor: C.border }]}>
          <Ionicons
            name={user?.kycStatus === 'VERIFIED' ? 'checkmark-circle' : 'alert-circle'}
            size={14}
            color={user?.kycStatus === 'VERIFIED' ? C.success : C.warning}
          />
          <Text style={[styles.kycText, { color: C.textSecondary }]}>
            {user?.kycStatus === 'VERIFIED' ? 'Verificeret' : 'Ikke verificeret'}
          </Text>
        </View>
      </View>

      {/* Theme Picker */}
      <View style={[styles.themeSection, { backgroundColor: C.surface, borderColor: C.border }]}>
        <Text style={[styles.themeSectionTitle, { color: C.textSecondary }]}>UDSEENDE</Text>
        <View style={styles.themeRow}>
          {THEME_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              style={[
                styles.themeOption,
                { borderColor: mode === opt.value ? C.accent : C.border },
                mode === opt.value && { backgroundColor: C.accent + '15' },
              ]}
              onPress={() => setMode(opt.value)}
            >
              <Ionicons
                name={opt.icon}
                size={20}
                color={mode === opt.value ? C.accent : C.textSecondary}
              />
              <Text style={[
                styles.themeLabel,
                { color: mode === opt.value ? C.accent : C.text },
                mode === opt.value && styles.themeLabelActive,
              ]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Account & Security */}
      <MenuSection
        title="KONTO & SIKKERHED"
        items={accountItems}
        onPress={(screen) => navigation.navigate(screen)}
      />

      {/* Support */}
      <MenuSection
        title="SUPPORT"
        items={supportItems}
        onPress={(screen) => navigation.navigate(screen)}
      />

      {/* Legal */}
      <MenuSection
        title="JURIDISK"
        items={legalItems}
        onPress={(screen) => navigation.navigate(screen)}
      />

      {/* Logout */}
      <TouchableOpacity style={[styles.logoutButton, { backgroundColor: C.surface, borderColor: C.border }]} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color={C.danger} />
        <Text style={[styles.logoutText, { color: C.danger }]}>Log ud</Text>
      </TouchableOpacity>

      {/* Delete Account – Apple App Store Guidelines §5.1.1(v) */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: C.textLight }]}>KONTOSLETNING</Text>
        <View style={[styles.deleteCard, { backgroundColor: C.surface }]}>
          {deleteStep === 0 ? (
            <>
              <View style={styles.deleteInfo}>
                <Ionicons name="warning" size={20} color={C.danger} />
                <Text style={[styles.deleteInfoText, { color: C.textSecondary }]}>
                  Sletning af din konto er permanent og kan ikke fortrydes. Al data, transaktionshistorik og saldo fjernes.
                </Text>
              </View>
              <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
                <Text style={[styles.deleteButtonText, { color: C.danger }]}>Slet min konto</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={styles.deleteInfo}>
                <Ionicons name="alert-circle" size={20} color={C.danger} />
                <Text style={[styles.deleteInfoText, { color: C.textSecondary }]}>
                  Ved sletning af din konto sker følgende:
                </Text>
              </View>
              <View style={styles.deleteConsequences}>
                <Text style={[styles.deleteConsequence, { color: C.textSecondary }]}>• Din wallet-saldo udbetales til din bankkonto</Text>
                <Text style={[styles.deleteConsequence, { color: C.textSecondary }]}>• Al transaktionshistorik slettes</Text>
                <Text style={[styles.deleteConsequence, { color: C.textSecondary }]}>• Dit PayWay-Tag frigives</Text>
                <Text style={[styles.deleteConsequence, { color: C.textSecondary }]}>• Gruppemedlemskaber ophører</Text>
                <Text style={[styles.deleteConsequence, { color: C.textSecondary }]}>• Data opbevares op til 5 år jf. bogføringsloven</Text>
              </View>
              <Text style={[styles.deletePrompt, { color: C.text }]}>
                Skriv <Text style={[styles.deleteBold, { color: C.danger }]}>SLET</Text> for at bekræfte:
              </Text>
              <TextInput
                style={[styles.deleteInput, { backgroundColor: C.background, color: C.text }]}
                value={deleteConfirmText}
                onChangeText={setDeleteConfirmText}
                placeholder="Skriv SLET"
                placeholderTextColor={C.textLight}
                autoCapitalize="characters"
                autoCorrect={false}
              />
              <View style={styles.deleteActions}>
                <TouchableOpacity
                  style={[styles.deleteCancelBtn, { backgroundColor: C.background, borderColor: C.border }]}
                  onPress={() => { setDeleteStep(0); setDeleteConfirmText(''); }}
                >
                  <Text style={[styles.deleteCancelText, { color: C.textSecondary }]}>Annuller</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.deleteConfirmBtn,
                    { backgroundColor: C.danger },
                    deleteConfirmText !== 'SLET' && styles.deleteConfirmDisabled,
                  ]}
                  onPress={handleDeleteConfirm}
                  disabled={deleteConfirmText !== 'SLET'}
                >
                  <Text style={styles.deleteConfirmText}>Slet konto permanent</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>

      <Text style={[styles.version, { color: C.textLight }]}>Payway v1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SPACING.md,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
    borderRadius: 16,
    padding: SPACING.md,
    borderWidth: 1,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarFallback: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
  },
  headerInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
  },
  phone: {
    fontSize: 14,
    marginTop: 2,
  },
  tag: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
  },
  editBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#e8eef5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  kycRow: {
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  kycBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 20,
    borderWidth: 1,
  },
  kycText: {
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    marginTop: SPACING.md,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginLeft: SPACING.xl,
    marginBottom: SPACING.xs,
  },
  menu: {
    marginHorizontal: SPACING.md,
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuIcon: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: '#e8eef5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  menuIconDanger: {
    backgroundColor: '#fde8e8',
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.lg,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '600',
  },
  deleteCard: {
    marginHorizontal: SPACING.md,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#fecaca',
    padding: SPACING.md,
  },
  deleteInfo: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  deleteInfoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
  },
  deleteButton: {
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  deleteButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  deleteConsequences: {
    marginBottom: SPACING.md,
    gap: 6,
  },
  deleteConsequence: {
    fontSize: 13,
    lineHeight: 18,
    marginLeft: 28,
  },
  deletePrompt: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: SPACING.sm,
  },
  deleteBold: {
    fontWeight: '800',
  },
  deleteInput: {
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 10,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 4,
    marginBottom: SPACING.md,
  },
  deleteActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  deleteCancelBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  deleteCancelText: {
    fontSize: 14,
    fontWeight: '600',
  },
  deleteConfirmBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 10,
  },
  deleteConfirmDisabled: {
    opacity: 0.4,
  },
  deleteConfirmText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    marginVertical: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  themeSection: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    borderRadius: 14,
    borderWidth: 1,
    padding: SPACING.md,
  },
  themeSectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: SPACING.sm,
  },
  themeRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  themeOption: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  themeLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  themeLabelActive: {
    fontWeight: '700',
  },
});
