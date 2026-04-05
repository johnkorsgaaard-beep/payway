import React, { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';
import { AppLockProvider } from './src/components/AppLockProvider';
import { OfflineBanner } from './src/components/OfflineBanner';
import { useAuth } from './src/store/auth';
import { api } from './src/services/api';
let StripeProvider: any = null;
if (Platform.OS !== 'web') {
  try {
    StripeProvider = require('@stripe/stripe-react-native').StripeProvider;
  } catch {}
}

const MERCHANT_ID = 'merchant.fo.payway';

export default function App() {
  const { refreshUser } = useAuth();
  const isDark = false;
  const [stripeKey, setStripeKey] = useState<string>('pk_test_placeholder');

  useEffect(() => {
    refreshUser();
    api
      .get<{ publishableKey: string }>('/wallet/stripe-config')
      .then((res) => { if (res.publishableKey) setStripeKey(res.publishableKey); })
      .catch(() => {});
  }, [refreshUser]);

  const content = (
    <AppLockProvider>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <AppNavigator />
      <OfflineBanner />
    </AppLockProvider>
  );

  return (
    <SafeAreaProvider>
      {StripeProvider ? (
        <StripeProvider publishableKey={stripeKey} merchantIdentifier={MERCHANT_ID}>
          {content}
        </StripeProvider>
      ) : (
        content
      )}
    </SafeAreaProvider>
  );
}
