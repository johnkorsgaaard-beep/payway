import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { SPACING } from '../utils/constants';
import { useColors } from '../utils/theme';
import { useAuth } from '../store/auth';

export function EditProfileScreen({ navigation }: any) {
  const C = useColors();
  const { user, updateUser } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [paywayTag, setPaywayTag] = useState(user?.paywayTag || '');
  const [profileImage, setProfileImage] = useState<string | null>(
    user?.profileImage || null
  );
  const [saving, setSaving] = useState(false);

  const sanitizeTag = (input: string) =>
    input.toLowerCase().replace(/[^a-z0-9._]/g, '').slice(0, 20);

  const hasChanges =
    name !== (user?.name || '') ||
    email !== (user?.email || '') ||
    phone !== (user?.phone || '') ||
    paywayTag !== (user?.paywayTag || '') ||
    profileImage !== (user?.profileImage || null);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Tilladelse påkrævet',
        'Vi har brug for adgang til dit fotobibliotek for at vælge et profilbillede.'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Tilladelse påkrævet',
        'Vi har brug for adgang til dit kamera for at tage et profilbillede.'
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const showImageOptions = () => {
    const options = [
      { text: 'Tag billede', onPress: takePhoto },
      { text: 'Vælg fra bibliotek', onPress: pickImage },
    ];

    if (profileImage) {
      options.push({
        text: 'Fjern billede',
        onPress: () => setProfileImage(null),
      });
    }

    Alert.alert('Profilbillede', 'Hvordan vil du tilføje et billede?', [
      ...options,
      { text: 'Annuller', style: 'cancel', onPress: () => {} },
    ]);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Fejl', 'Navn kan ikke være tomt.');
      return;
    }

    setSaving(true);
    try {
      await updateUser({
        name: name.trim(),
        email: email.trim() || undefined,
        phone: phone.trim(),
        paywayTag: paywayTag.trim() || undefined,
        profileImage,
      });
      navigation.goBack();
    } catch {
      Alert.alert('Fejl', 'Kunne ikke gemme ændringer. Prøv igen.');
    } finally {
      setSaving(false);
    }
  };

  const initials = name
    ? name.charAt(0).toUpperCase()
    : user?.name?.charAt(0)?.toUpperCase() || '?';

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={[styles.container, { backgroundColor: C.background }]} contentContainerStyle={styles.content}>
        {/* Profile Picture */}
        <TouchableOpacity style={styles.avatarSection} onPress={showImageOptions}>
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatarPlaceholder, { backgroundColor: C.primary }]}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
          )}
          <View style={[styles.cameraButton, { backgroundColor: C.accent, borderColor: C.background }]}>
            <Ionicons name="camera" size={16} color="#fff" />
          </View>
        </TouchableOpacity>
        <Text style={[styles.avatarHint, { color: C.textSecondary }]}>Tryk for at ændre billede</Text>

        {/* Form Fields */}
        <View style={styles.form}>
          {/* PayWay-Tag */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: C.textSecondary }]}>PayWay-Tag</Text>
            <View style={[styles.inputRow, { backgroundColor: C.surface, borderColor: C.border }]}>
              <Text style={[styles.tagPrefix, { color: C.primary }]}>@</Text>
              <TextInput
                style={[styles.input, { color: C.text }]}
                value={paywayTag}
                onChangeText={(v) => setPaywayTag(sanitizeTag(v))}
                placeholder="ditbrugernavn"
                placeholderTextColor={C.textLight}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            <Text style={[styles.hint, { color: C.textLight }]}>
              Dit unikke tag — del det så andre kan finde dig
            </Text>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: C.textSecondary }]}>Navn</Text>
            <View style={[styles.inputRow, { backgroundColor: C.surface, borderColor: C.border }]}>
              <Ionicons name="person-outline" size={20} color={C.primary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: C.text }]}
                value={name}
                onChangeText={setName}
                placeholder="Dit fulde navn"
                placeholderTextColor={C.textLight}
                autoCapitalize="words"
              />
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: C.textSecondary }]}>Email</Text>
            <View style={[styles.inputRow, { backgroundColor: C.surface, borderColor: C.border }]}>
              <Ionicons name="mail-outline" size={20} color={C.primary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: C.text }]}
                value={email}
                onChangeText={setEmail}
                placeholder="din@email.com"
                placeholderTextColor={C.textLight}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: C.textSecondary }]}>Telefonnummer</Text>
            <View style={[styles.inputRow, { backgroundColor: C.surface, borderColor: C.border }]}>
              <Ionicons name="call-outline" size={20} color={C.primary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: C.text }]}
                value={phone}
                onChangeText={setPhone}
                placeholder="+298 123 456"
                placeholderTextColor={C.textLight}
                keyboardType="phone-pad"
              />
            </View>
            <Text style={[styles.hint, { color: C.textLight }]}>
              Ændring af telefonnummer kræver verifikation
            </Text>
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: C.primary }, !hasChanges && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={!hasChanges || saving}
        >
          <Text style={styles.saveButtonText}>
            {saving ? 'Gemmer...' : 'Gem ændringer'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: SPACING.xxl * 2,
  },
  avatarSection: {
    alignSelf: 'center',
    marginTop: SPACING.xl,
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 38,
    fontWeight: '800',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
  },
  avatarHint: {
    textAlign: 'center',
    fontSize: 13,
    marginTop: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  form: {
    marginHorizontal: SPACING.md,
    gap: SPACING.md,
  },
  fieldGroup: {
    gap: SPACING.xs,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: SPACING.xs,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: SPACING.md,
  },
  inputIcon: {
    marginRight: SPACING.sm,
  },
  tagPrefix: {
    fontSize: 18,
    fontWeight: '700',
    marginRight: SPACING.xs,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    paddingVertical: 14,
  },
  hint: {
    fontSize: 12,
    marginLeft: SPACING.xs,
    marginTop: 2,
  },
  saveButton: {
    marginHorizontal: SPACING.md,
    marginTop: SPACING.xl,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.4,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
