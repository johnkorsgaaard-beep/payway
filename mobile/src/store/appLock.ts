import { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SETTINGS_KEY = 'payway_applock_settings';

export type LockMethod = 'pin' | 'biometric' | 'both';
export type TimeoutMinutes = 0 | 1 | 2 | 5 | 10 | 15 | 30;

export interface AppLockSettings {
  enabled: boolean;
  method: LockMethod;
  timeoutMinutes: TimeoutMinutes;
  lockOnBackground: boolean;
}

const DEFAULT_SETTINGS: AppLockSettings = {
  enabled: false,
  method: 'both',
  timeoutMinutes: 5,
  lockOnBackground: true,
};

export const TIMEOUT_OPTIONS: { value: TimeoutMinutes; label: string }[] = [
  { value: 0, label: 'Med det samme' },
  { value: 1, label: '1 minut' },
  { value: 2, label: '2 minutter' },
  { value: 5, label: '5 minutter' },
  { value: 10, label: '10 minutter' },
  { value: 15, label: '15 minutter' },
  { value: 30, label: '30 minutter' },
];

let globalSettings: AppLockSettings = { ...DEFAULT_SETTINGS };
let globalLocked = false;
let globalLastActive = Date.now();
let settingsLoaded = false;
const listeners = new Set<() => void>();

function emit() { listeners.forEach((fn) => fn()); }

async function persistSettings() {
  try { await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(globalSettings)); } catch {}
}

export function useAppLock() {
  const [, rerender] = useState(0);

  useEffect(() => {
    const listener = () => rerender((n) => n + 1);
    listeners.add(listener);

    if (!settingsLoaded) {
      settingsLoaded = true;
      AsyncStorage.getItem(SETTINGS_KEY).then((raw) => {
        if (raw) {
          try { globalSettings = { ...DEFAULT_SETTINGS, ...JSON.parse(raw) }; } catch {}
        }
        emit();
      }).catch(() => {});
    }

    return () => { listeners.delete(listener); };
  }, []);

  const settings = globalSettings;
  const isLocked = globalLocked;

  const updateSettings = useCallback(async (updates: Partial<AppLockSettings>) => {
    globalSettings = { ...globalSettings, ...updates };
    emit();
    await persistSettings();
  }, []);

  const lock = useCallback(() => {
    if (globalSettings.enabled) {
      globalLocked = true;
      emit();
    }
  }, []);

  const unlock = useCallback(() => {
    globalLocked = false;
    globalLastActive = Date.now();
    emit();
  }, []);

  const recordActivity = useCallback(() => {
    globalLastActive = Date.now();
  }, []);

  const checkTimeout = useCallback(() => {
    if (!globalSettings.enabled || globalLocked) return;
    if (globalSettings.timeoutMinutes === 0) return;

    const elapsed = Date.now() - globalLastActive;
    const timeoutMs = globalSettings.timeoutMinutes * 60 * 1000;

    if (elapsed >= timeoutMs) {
      globalLocked = true;
      emit();
    }
  }, []);

  const handleBackground = useCallback(() => {
    if (!globalSettings.enabled) return;
    if (globalSettings.lockOnBackground) {
      globalLocked = true;
      emit();
    }
  }, []);

  const handleForeground = useCallback(() => {
    if (!globalSettings.enabled || !globalLocked) {
      checkTimeout();
      return;
    }
  }, [checkTimeout]);

  return {
    settings,
    isLocked,
    updateSettings,
    lock,
    unlock,
    recordActivity,
    checkTimeout,
    handleBackground,
    handleForeground,
  };
}
