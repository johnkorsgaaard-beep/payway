export const API_URL = __DEV__
  ? 'http://localhost:3000/api'
  : 'https://api.payway.fo/api';

export const COLORS_LIGHT = {
  primary: '#0a2f5b',
  primaryDark: '#081f3d',
  primaryLight: '#1a4a7a',
  accent: '#2ec964',
  accentDark: '#25a854',
  accentLight: '#5dd888',
  success: '#2ec964',
  warning: '#f59e0b',
  danger: '#ef4444',
  background: '#f9fafb',
  surface: '#ffffff',
  text: '#111827',
  textSecondary: '#6b7280',
  textLight: '#9ca3af',
  border: '#e5e7eb',
  borderLight: '#f3f4f6',
} as const;

export const COLORS_DARK = {
  primary: '#4a9eff',
  primaryDark: '#3b82f6',
  primaryLight: '#60a5fa',
  accent: '#34d399',
  accentDark: '#2ec964',
  accentLight: '#6ee7b7',
  success: '#34d399',
  warning: '#fbbf24',
  danger: '#f87171',
  background: '#030712',
  surface: '#111827',
  text: '#f9fafb',
  textSecondary: '#9ca3af',
  textLight: '#6b7280',
  border: '#1f2937',
  borderLight: '#1e293b',
} as const;

export const COLORS = COLORS_LIGHT;

export type AppColors = typeof COLORS_LIGHT;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;
