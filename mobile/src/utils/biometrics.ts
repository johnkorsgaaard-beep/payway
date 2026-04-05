import { Platform } from 'react-native';

let LocalAuth: typeof import('expo-local-authentication') | null = null;
if (Platform.OS !== 'web') {
  try {
    LocalAuth = require('expo-local-authentication');
  } catch {}
}

export async function hasHardwareAsync(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  return LocalAuth?.hasHardwareAsync() ?? false;
}

export async function supportedAuthenticationTypesAsync(): Promise<number[]> {
  if (Platform.OS === 'web') return [];
  return LocalAuth?.supportedAuthenticationTypesAsync() ?? [];
}

export async function authenticateAsync(options?: {
  promptMessage?: string;
  cancelLabel?: string;
  disableDeviceFallback?: boolean;
}): Promise<{ success: boolean }> {
  if (Platform.OS === 'web') return { success: false };
  return LocalAuth?.authenticateAsync(options as any) ?? { success: false };
}

export const AuthenticationType = {
  FACIAL_RECOGNITION: 1,
  FINGERPRINT: 2,
  IRIS: 3,
};
