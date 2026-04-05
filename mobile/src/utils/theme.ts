import { useState, useEffect, useCallback } from 'react';
import { useColorScheme } from 'react-native';
import { COLORS_LIGHT, COLORS_DARK, type AppColors } from './constants';

export type ThemeMode = 'light' | 'dark' | 'system';

let globalMode: ThemeMode = 'system';

export function useTheme() {
  const systemScheme = useColorScheme();
  const isDark = globalMode === 'dark' || (globalMode === 'system' && systemScheme === 'dark');

  const setMode = (m: ThemeMode) => {
    globalMode = m;
  };

  return {
    mode: globalMode,
    setMode,
    colors: isDark ? COLORS_DARK : COLORS_LIGHT,
    isDark,
  };
}

export function useColors(): AppColors {
  return COLORS_LIGHT;
}
