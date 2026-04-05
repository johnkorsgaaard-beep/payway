import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SPACING } from '../utils/constants';
import { useColors } from '../utils/theme';

interface Props {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  iconBg?: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
  compact?: boolean;
}

export function EmptyState({
  icon,
  iconColor,
  iconBg,
  title,
  description,
  actionLabel,
  onAction,
  secondaryLabel,
  onSecondary,
  compact,
}: Props) {
  const C = useColors();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim]);

  const resolvedIconColor = iconColor ?? C.primary;
  const resolvedIconBg = iconBg ?? (C.primary + '14');

  return (
    <Animated.View
      style={[
        styles.container,
        compact && styles.containerCompact,
        { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
      ]}
    >
      <View style={[styles.iconOuter, { backgroundColor: resolvedIconBg }]}>
        <View style={[styles.iconInner, { backgroundColor: resolvedIconColor + '20' }]}>
          <Ionicons name={icon} size={compact ? 28 : 36} color={resolvedIconColor} />
        </View>
      </View>

      <Text style={[styles.title, compact && styles.titleCompact, { color: C.text }]}>
        {title}
      </Text>
      <Text style={[styles.description, compact && styles.descriptionCompact, { color: C.textSecondary }]}>
        {description}
      </Text>

      {actionLabel && onAction && (
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: C.accent }]}
          onPress={onAction}
          activeOpacity={0.85}
        >
          <Text style={styles.actionText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}

      {secondaryLabel && onSecondary && (
        <TouchableOpacity style={styles.secondaryButton} onPress={onSecondary}>
          <Text style={[styles.secondaryText, { color: C.accent }]}>{secondaryLabel}</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl * 1.5,
    paddingHorizontal: SPACING.xl,
  },
  containerCompact: {
    paddingVertical: SPACING.xxl,
  },
  iconOuter: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  iconInner: {
    width: 76,
    height: 76,
    borderRadius: 38,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  titleCompact: {
    fontSize: 17,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    maxWidth: 300,
  },
  descriptionCompact: {
    fontSize: 14,
    lineHeight: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: SPACING.xl,
    borderRadius: 12,
    marginTop: SPACING.lg,
    minWidth: 200,
  },
  actionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    marginTop: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  secondaryText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
