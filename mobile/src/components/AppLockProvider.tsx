import React, { useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { useAppLock } from '../store/appLock';
import { useAuth } from '../store/auth';
import { LockScreen } from '../screens/LockScreen';

interface Props {
  children: React.ReactNode;
}

export function AppLockProvider({ children }: Props) {
  const { settings, isLocked, handleBackground, handleForeground, checkTimeout } = useAppLock();
  const { isAuthenticated } = useAuth();
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (appStateRef.current === 'active' && nextState.match(/inactive|background/)) {
        handleBackground();
      }
      if (appStateRef.current.match(/inactive|background/) && nextState === 'active') {
        handleForeground();
      }
      appStateRef.current = nextState;
    });

    return () => subscription.remove();
  }, [handleBackground, handleForeground]);

  useEffect(() => {
    if (settings.enabled && settings.timeoutMinutes > 0 && !isLocked) {
      intervalRef.current = setInterval(checkTimeout, 30000);
      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [settings.enabled, settings.timeoutMinutes, isLocked, checkTimeout]);

  if (isAuthenticated && settings.enabled && isLocked) {
    return <LockScreen />;
  }

  return <>{children}</>;
}
