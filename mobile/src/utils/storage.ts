import { Platform } from 'react-native';

let SecureStore: typeof import('expo-secure-store') | null = null;
if (Platform.OS !== 'web') {
  try {
    SecureStore = require('expo-secure-store');
  } catch {}
}

export async function getItem(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    try { return localStorage.getItem(key); } catch { return null; }
  }
  return SecureStore?.getItemAsync(key) ?? null;
}

export async function setItem(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    try { localStorage.setItem(key, value); } catch {}
    return;
  }
  await SecureStore?.setItemAsync(key, value);
}

export async function deleteItem(key: string): Promise<void> {
  if (Platform.OS === 'web') {
    try { localStorage.removeItem(key); } catch {}
    return;
  }
  await SecureStore?.deleteItemAsync(key);
}
