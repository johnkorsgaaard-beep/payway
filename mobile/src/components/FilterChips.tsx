import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SPACING } from '../utils/constants';
import { useColors } from '../utils/theme';

export interface FilterOption {
  key: string;
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
}

interface Props {
  options: FilterOption[];
  selected: string;
  onSelect: (key: string) => void;
}

export function FilterChips({ options, selected, onSelect }: Props) {
  const C = useColors();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {options.map((opt) => {
        const active = selected === opt.key;
        return (
          <TouchableOpacity
            key={opt.key}
            style={[
              styles.chip,
              { borderColor: C.border, backgroundColor: C.surface },
              active && { backgroundColor: C.primary, borderColor: C.primary },
            ]}
            onPress={() => onSelect(opt.key)}
            activeOpacity={0.7}
          >
            {opt.icon && (
              <Ionicons
                name={opt.icon}
                size={14}
                color={active ? '#fff' : C.textSecondary}
              />
            )}
            <Text
              style={[
                styles.chipText,
                { color: C.textSecondary },
                active && { color: '#fff' },
              ]}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
