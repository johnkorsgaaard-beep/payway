import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../utils/constants';
import { formatPhone } from '../utils/format';
import { useAuth } from '../store/auth';

export function ProfileScreen({ navigation }: any) {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Log ud', 'Er du sikker på at du vil logge ud?', [
      { text: 'Annuller', style: 'cancel' },
      {
        text: 'Log ud',
        style: 'destructive',
        onPress: logout,
      },
    ]);
  };

  const menuItems = [
    { icon: 'card' as const, label: 'Betalingskort', screen: 'Cards' },
    { icon: 'lock-closed' as const, label: 'Skift PIN', screen: 'ChangePin' },
    { icon: 'finger-print' as const, label: 'Biometri', screen: 'Biometrics' },
    { icon: 'notifications' as const, label: 'Notifikationer', screen: 'Notifications' },
    { icon: 'shield-checkmark' as const, label: 'KYC Verifikation', screen: 'KYC' },
    { icon: 'help-circle' as const, label: 'Hjælp & Support', screen: 'Support' },
    { icon: 'document-text' as const, label: 'Vilkår & Betingelser', screen: 'Terms' },
    { icon: 'information-circle' as const, label: 'Om Payway', screen: 'About' },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <TouchableOpacity
        style={styles.header}
        onPress={() => navigation.navigate('EditProfile')}
        activeOpacity={0.7}
      >
        {user?.profileImage ? (
          <Image source={{ uri: user.profileImage }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarFallback}>
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0)?.toUpperCase() || '?'}
            </Text>
          </View>
        )}
        <View style={styles.headerInfo}>
          <Text style={styles.name}>{user?.name || 'Ukendt'}</Text>
          {user?.paywayTag ? (
            <Text style={styles.tag}>@{user.paywayTag}</Text>
          ) : (
            <Text style={styles.phone}>
              {user?.phone ? formatPhone(user.phone) : ''}
            </Text>
          )}
        </View>
        <View style={styles.editBadge}>
          <Ionicons name="create-outline" size={16} color={COLORS.primary} />
        </View>
      </TouchableOpacity>

      {/* KYC Badge */}
      <View style={styles.kycRow}>
        <View style={styles.kycBadge}>
          <Ionicons
            name={user?.kycStatus === 'VERIFIED' ? 'checkmark-circle' : 'alert-circle'}
            size={14}
            color={user?.kycStatus === 'VERIFIED' ? COLORS.success : COLORS.warning}
          />
          <Text style={styles.kycText}>
            {user?.kycStatus === 'VERIFIED' ? 'Verificeret' : 'Ikke verificeret'}
          </Text>
        </View>
      </View>

      {/* Menu */}
      <View style={styles.menu}>
        {menuItems.map((item, i) => (
          <TouchableOpacity
            key={i}
            style={styles.menuItem}
            onPress={() => navigation.navigate(item.screen)}
          >
            <View style={styles.menuIcon}>
              <Ionicons name={item.icon} size={20} color={COLORS.primary} />
            </View>
            <Text style={styles.menuLabel}>{item.label}</Text>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textLight} />
          </TouchableOpacity>
        ))}
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color={COLORS.danger} />
        <Text style={styles.logoutText}>Log ud</Text>
      </TouchableOpacity>

      <Text style={styles.version}>Payway v1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SPACING.md,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
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
    backgroundColor: COLORS.primary,
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
    color: COLORS.text,
  },
  phone: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  tag: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
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
    marginBottom: SPACING.md,
  },
  kycBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  kycText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  menu: {
    marginHorizontal: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#e8eef5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.text,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.lg,
    paddingVertical: 14,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.danger,
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    color: COLORS.textLight,
    marginVertical: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
});
