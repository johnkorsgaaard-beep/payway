import { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, setTokens, clearTokens, getToken } from '../services/api';

const ONBOARDING_KEY = 'payway_onboarding_done';

interface User {
  id: string;
  phone: string;
  name: string;
  email?: string;
  profileImage?: string | null;
  paywayTag?: string;
  role: string;
  kycStatus?: string;
  wallet?: {
    balance: number;
    currency: string;
    status: string;
  };
  cards?: Array<{
    id: string;
    brand: string;
    last4: string;
    isDefault: boolean;
  }>;
}

let globalUser: User | null = null;
let globalOnboardingDone = false;
const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach((fn) => fn());
}

function setGlobalUser(user: User | null) {
  globalUser = user;
  emitChange();
}

export function useAuth() {
  const [, forceRender] = useState(0);

  useEffect(() => {
    const listener = () => forceRender((n) => n + 1);
    listeners.add(listener);
    return () => { listeners.delete(listener); };
  }, []);

  const user = globalUser;
  const isAuthenticated = !!globalUser;

  const skipLogin = useCallback(() => {
    setGlobalUser({
      id: 'demo-user',
      phone: '+298123456',
      name: 'Demo User',
      role: 'USER',
      kycStatus: 'BASIC',
      wallet: { balance: 50000, currency: 'DKK', status: 'ACTIVE' },
      cards: [{ id: 'card-1', brand: 'visa', last4: '4242', isDefault: true }],
      paywayTag: 'demouser',
    });
  }, []);

  const register = useCallback(
    async (firebaseToken: string, phone: string, name: string) => {
      const res = await api.post<{ user: User; token: string; refreshToken: string }>(
        '/auth/register',
        { firebaseToken, phone, name }
      );
      await setTokens(res.token, res.refreshToken);
      setGlobalUser(res.user);
      return res.user;
    },
    []
  );

  const login = useCallback(
    async (firebaseToken: string) => {
      const res = await api.post<{ user: User; token: string; refreshToken: string }>(
        '/auth/login',
        { firebaseToken }
      );
      await setTokens(res.token, res.refreshToken);
      setGlobalUser(res.user);
      return res.user;
    },
    []
  );

  const logout = useCallback(async () => {
    await clearTokens();
    setGlobalUser(null);
  }, []);

  const updateUser = useCallback(async (updates: Partial<Pick<User, 'name' | 'email' | 'phone' | 'profileImage' | 'paywayTag'>>) => {
    if (!globalUser) return;
    try {
      const token = await getToken();
      if (token) {
        await api.post('/auth/profile', updates);
      }
    } catch {}
    setGlobalUser({ ...globalUser, ...updates });
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) return;
      const user = await api.get<User>('/auth/me');
      setGlobalUser(user);
    } catch {
      setGlobalUser(null);
    }
  }, []);

  const hasSeenOnboarding = globalOnboardingDone;

  const completeOnboarding = useCallback(async () => {
    globalOnboardingDone = true;
    emitChange();
    try { await AsyncStorage.setItem(ONBOARDING_KEY, '1'); } catch {}
  }, []);

  const loadOnboardingState = useCallback(async () => {
    try {
      const val = await AsyncStorage.getItem(ONBOARDING_KEY);
      if (val === '1' && !globalOnboardingDone) {
        globalOnboardingDone = true;
        emitChange();
      }
    } catch {}
  }, []);

  return { user, isAuthenticated, isLoading: false, register, login, logout, refreshUser, updateUser, skipLogin, hasSeenOnboarding, completeOnboarding, loadOnboardingState };
}
