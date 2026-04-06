import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS_LIGHT, COLORS_DARK, type AppColors } from './constants';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  mode: ThemeMode;
  setMode: (m: ThemeMode) => void;
  colors: AppColors;
  isDark: boolean;
}

const STORAGE_KEY = '@payway_theme';

const ThemeContext = createContext<ThemeContextValue>({
  mode: 'system',
  setMode: () => {},
  colors: COLORS_LIGHT,
  isDark: false,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('system');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((v) => {
      if (v === 'light' || v === 'dark' || v === 'system') setModeState(v);
      setLoaded(true);
    });
  }, []);

  const setMode = (m: ThemeMode) => {
    setModeState(m);
    AsyncStorage.setItem(STORAGE_KEY, m);
  };

  const isDark =
    mode === 'dark' || (mode === 'system' && systemScheme === 'dark');

  const colors = isDark ? COLORS_DARK : COLORS_LIGHT;

  return React.createElement(
    ThemeContext.Provider,
    { value: { mode, setMode, colors, isDark } },
    loaded ? children : null
  );
}

export function useColors(): AppColors {
  return useContext(ThemeContext).colors;
}

export function useTheme() {
  return useContext(ThemeContext);
}
