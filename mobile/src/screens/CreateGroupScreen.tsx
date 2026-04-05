import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SPACING } from '../utils/constants';
import { useColors } from '../utils/theme';


interface MemberDraft {
  id: string;
  name: string;
  tag: string;
  percentage: string;
}

type SplitMode = 'equal' | 'percentage';

export function CreateGroupScreen({ navigation }: any) {
  const C = useColors();
  const styles = makeStyles(C);
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('🍻');
  const emojiInputRef = useRef<TextInput>(null);
  const [splitMode, setSplitMode] = useState<SplitMode>('equal');
  const [members, setMembers] = useState<MemberDraft[]>([
    { id: '1', name: '', tag: '', percentage: '' },
  ]);

  const totalMembers = members.length + 1; // +1 for "you"
  const equalShare = (100 / totalMembers).toFixed(1);

  const totalPercentage = members.reduce(
    (sum, m) => sum + (parseFloat(m.percentage) || 0),
    0
  );

  const addMember = () => {
    setMembers([
      ...members,
      { id: Date.now().toString(), name: '', tag: '', percentage: '' },
    ]);
  };

  const removeMember = (id: string) => {
    if (members.length <= 1) return;
    setMembers(members.filter((m) => m.id !== id));
  };

  const updateMember = (id: string, field: keyof MemberDraft, value: string) => {
    setMembers(
      members.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    );
  };

  const handleCreate = () => {
    if (!name.trim()) {
      Alert.alert('Fejl', 'Giv gruppen et navn.');
      return;
    }
    if (members.some((m) => !m.tag.trim())) {
      Alert.alert('Fejl', 'Alle medlemmer skal have et PayWay-Tag.');
      return;
    }
    if (splitMode === 'percentage') {
      const yourShare = 100 - totalPercentage;
      if (yourShare < 0 || totalPercentage > 100) {
        Alert.alert('Fejl', 'Procentfordelingen må ikke overstige 100%.');
        return;
      }
    }

    Alert.alert('Gruppe oprettet!', `"${name}" med ${totalMembers} medlemmer.`, [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Group Name + Emoji */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gruppenavn</Text>
          <View style={styles.nameRow}>
            <TouchableOpacity
              style={styles.emojiPicker}
              onPress={() => emojiInputRef.current?.focus()}
            >
              <Text style={styles.emojiText}>{emoji}</Text>
              <TextInput
                ref={emojiInputRef}
                style={styles.emojiHiddenInput}
                value=""
                onChangeText={(text) => {
                  const emojiMatch = text.match(/\p{Emoji_Presentation}/u);
                  if (emojiMatch) setEmoji(emojiMatch[0]);
                }}
                autoCorrect={false}
                blurOnSubmit
              />
            </TouchableOpacity>
            <TextInput
              style={styles.nameInput}
              value={name}
              onChangeText={setName}
              placeholder="Fx Fredagsbar, Roomies..."
              placeholderTextColor={C.textLight}
            />
          </View>
        </View>

        {/* Split Mode */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fordelingsmodel</Text>
          <View style={styles.splitToggle}>
            <TouchableOpacity
              style={[styles.splitOption, splitMode === 'equal' && styles.splitOptionActive]}
              onPress={() => setSplitMode('equal')}
            >
              <Ionicons
                name="git-compare-outline"
                size={20}
                color={splitMode === 'equal' ? C.primary : C.textSecondary}
              />
              <Text style={[styles.splitText, splitMode === 'equal' && styles.splitTextActive]}>
                Lige deling
              </Text>
              <Text style={styles.splitDesc}>Alt deles ligeligt</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.splitOption, splitMode === 'percentage' && styles.splitOptionActive]}
              onPress={() => setSplitMode('percentage')}
            >
              <Ionicons
                name="pie-chart-outline"
                size={20}
                color={splitMode === 'percentage' ? C.primary : C.textSecondary}
              />
              <Text style={[styles.splitText, splitMode === 'percentage' && styles.splitTextActive]}>
                Procent
              </Text>
              <Text style={styles.splitDesc}>Sæt andele manuelt</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Members */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Medlemmer</Text>

          {/* You */}
          <View style={styles.memberCard}>
            <View style={styles.memberHeader}>
              <View style={styles.youAvatar}>
                <Text style={{ fontSize: 18 }}>🙋</Text>
              </View>
              <View style={styles.memberFields}>
                <Text style={styles.youLabel}>Dig</Text>
              </View>
              {splitMode === 'equal' ? (
                <View style={styles.shareBadge}>
                  <Text style={styles.shareText}>{equalShare}%</Text>
                </View>
              ) : (
                <View style={styles.shareBadge}>
                  <Text style={styles.shareText}>
                    {Math.max(0, 100 - totalPercentage).toFixed(1)}%
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Other Members */}
          {members.map((member, index) => (
            <View key={member.id} style={styles.memberCard}>
              <View style={styles.memberHeader}>
                <View style={styles.memberAvatar}>
                  <Text style={styles.memberAvatarText}>
                    {member.tag ? member.tag.charAt(0).toUpperCase() : '?'}
                  </Text>
                </View>
                <View style={styles.memberFields}>
                  <View style={styles.tagInputRow}>
                    <Text style={styles.tagAt}>@</Text>
                    <TextInput
                      style={styles.memberTagInput}
                      value={member.tag}
                      onChangeText={(v) => updateMember(member.id, 'tag', v.toLowerCase().replace(/[^a-z0-9._]/g, ''))}
                      placeholder="payway-tag"
                      placeholderTextColor={C.textLight}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>
                </View>
                {splitMode === 'equal' ? (
                  <View style={styles.shareBadge}>
                    <Text style={styles.shareText}>{equalShare}%</Text>
                  </View>
                ) : (
                  <View style={styles.percentInputWrap}>
                    <TextInput
                      style={styles.percentInput}
                      value={member.percentage}
                      onChangeText={(v) => updateMember(member.id, 'percentage', v)}
                      placeholder="0"
                      placeholderTextColor={C.textLight}
                      keyboardType="numeric"
                      maxLength={4}
                    />
                    <Text style={styles.percentSign}>%</Text>
                  </View>
                )}
                {members.length > 1 && (
                  <TouchableOpacity
                    style={styles.removeBtn}
                    onPress={() => removeMember(member.id)}
                  >
                    <Ionicons name="close-circle" size={22} color={C.danger} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}

          <TouchableOpacity style={styles.addMemberBtn} onPress={addMember}>
            <Ionicons name="add-circle-outline" size={22} color={C.primary} />
            <Text style={styles.addMemberText}>Tilføj medlem</Text>
          </TouchableOpacity>
        </View>

        {/* Summary */}
        {splitMode === 'percentage' && (
          <View style={styles.summaryBox}>
            <Ionicons
              name={totalPercentage <= 100 ? 'checkmark-circle' : 'alert-circle'}
              size={18}
              color={totalPercentage <= 100 ? C.success : C.danger}
            />
            <Text style={styles.summaryText}>
              Fordelt: {totalPercentage.toFixed(1)}% + din andel:{' '}
              {Math.max(0, 100 - totalPercentage).toFixed(1)}% = 100%
            </Text>
          </View>
        )}

        {/* Create Button */}
        <TouchableOpacity
          style={[styles.createButton, !name.trim() && styles.createButtonDisabled]}
          onPress={handleCreate}
          disabled={!name.trim()}
        >
          <Text style={styles.createButtonText}>Opret gruppe</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function makeStyles(C: any) {
  return StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.background,
  },
  content: {
    paddingBottom: SPACING.xxl * 2,
  },
  section: {
    marginHorizontal: SPACING.md,
    marginTop: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: C.text,
    marginBottom: SPACING.sm,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  emojiPicker: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#e8eef5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.border,
  },
  emojiText: {
    fontSize: 26,
  },
  emojiHiddenInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
  nameInput: {
    flex: 1,
    height: 52,
    backgroundColor: C.surface,
    borderRadius: 14,
    paddingHorizontal: SPACING.md,
    fontSize: 16,
    fontWeight: '500',
    color: C.text,
    letterSpacing: 0,
    borderWidth: 1,
    borderColor: C.border,
  },
  splitToggle: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  splitOption: {
    flex: 1,
    backgroundColor: C.surface,
    borderRadius: 14,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: C.border,
    gap: 4,
  },
  splitOptionActive: {
    borderColor: C.primary,
    backgroundColor: '#e8eef5',
  },
  splitText: {
    fontSize: 14,
    fontWeight: '600',
    color: C.textSecondary,
  },
  splitTextActive: {
    color: C.primary,
  },
  splitDesc: {
    fontSize: 11,
    color: C.textLight,
  },
  memberCard: {
    backgroundColor: C.surface,
    borderRadius: 14,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: C.borderLight,
  },
  memberHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  youAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e8eef5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  memberAvatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  memberFields: {
    flex: 1,
    gap: 4,
  },
  youLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: C.text,
  },
  tagInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagAt: {
    fontSize: 16,
    fontWeight: '700',
    color: C.primary,
  },
  memberTagInput: {
    flex: 1,
    fontSize: 15,
    color: C.primary,
    fontWeight: '600',
    letterSpacing: 0,
    padding: 0,
  },
  shareBadge: {
    backgroundColor: '#e8eef5',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 8,
    marginLeft: SPACING.sm,
  },
  shareText: {
    fontSize: 13,
    fontWeight: '700',
    color: C.primary,
  },
  percentInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8eef5',
    borderRadius: 8,
    paddingHorizontal: SPACING.sm,
    marginLeft: SPACING.sm,
  },
  percentInput: {
    fontSize: 14,
    fontWeight: '700',
    color: C.primary,
    width: 36,
    textAlign: 'right',
    paddingVertical: SPACING.xs,
  },
  percentSign: {
    fontSize: 13,
    fontWeight: '600',
    color: C.primary,
    marginLeft: 1,
  },
  removeBtn: {
    marginLeft: SPACING.sm,
  },
  addMemberBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: C.border,
    borderStyle: 'dashed',
  },
  addMemberText: {
    fontSize: 15,
    fontWeight: '600',
    color: C.primary,
  },
  summaryBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    backgroundColor: C.surface,
    borderRadius: 12,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: C.borderLight,
  },
  summaryText: {
    fontSize: 13,
    fontWeight: '500',
    color: C.textSecondary,
    flex: 1,
  },
  createButton: {
    marginHorizontal: SPACING.md,
    marginTop: SPACING.xl,
    backgroundColor: C.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  createButtonDisabled: {
    opacity: 0.4,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
}
