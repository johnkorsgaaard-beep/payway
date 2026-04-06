import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';
import { useAuth } from './src/store/auth';
import { api } from './src/services/api';
import { ThemeProvider, useTheme } from './src/utils/theme';
let StripeProvider: any = null;
try {
  StripeProvider = require('@stripe/stripe-react-native').StripeProvider;
} catch {}

const MERCHANT_ID = 'merchant.fo.payway';

export default function App() {
  const { refreshUser } = useAuth();
  const [stripeKey, setStripeKey] = useState<string>('pk_test_placeholder');

  useEffect(() => {
    refreshUser();
    api
      .get<{ publishableKey: string }>('/wallet/stripe-config')
      .then((res) => { if (res.publishableKey) setStripeKey(res.publishableKey); })
      .catch(() => {});
  }, [refreshUser]);

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppInner stripeKey={stripeKey} />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

function AppInner({ stripeKey }: { stripeKey: string }) {
  const { isDark } = useTheme();

  const content = (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <AppNavigator />
    </>
  );

  if (StripeProvider) {
    return (
      <StripeProvider publishableKey={stripeKey} merchantIdentifier={MERCHANT_ID}>
        {content}
      </StripeProvider>
    );
  }
  return <>{content}</>;
}
