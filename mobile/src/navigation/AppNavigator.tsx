import React from 'react';
import { Image, View, Text, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../store/auth';
import { LoginScreen } from '../screens/LoginScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { SendScreen } from '../screens/SendScreen';
import { ScanScreen } from '../screens/ScanScreen';
import { TopUpScreen } from '../screens/TopUpScreen';
import { HistoryScreen } from '../screens/HistoryScreen';
import { TransfersScreen } from '../screens/TransfersScreen';
import { PersonChatScreen } from '../screens/PersonChatScreen';
import { GroupDetailScreen } from '../screens/GroupDetailScreen';
import { CreateGroupScreen } from '../screens/CreateGroupScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { CardsScreen } from '../screens/CardsScreen';
import { ChangePinScreen } from '../screens/ChangePinScreen';
import { BiometricsScreen } from '../screens/BiometricsScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { NotificationCenterScreen } from '../screens/NotificationCenterScreen';
import { KycScreen } from '../screens/KycScreen';
import { SupportScreen } from '../screens/SupportScreen';
import { TermsScreen } from '../screens/TermsScreen';
import { EditProfileScreen } from '../screens/EditProfileScreen';
import { RequestScreen } from '../screens/RequestScreen';
import { PrivacyPolicyScreen } from '../screens/PrivacyPolicyScreen';
import { CookiePolicyScreen } from '../screens/CookiePolicyScreen';
import { DataProcessingScreen } from '../screens/DataProcessingScreen';
import { LiveChatScreen } from '../screens/LiveChatScreen';
import { TransactionDetailScreen } from '../screens/TransactionDetailScreen';
import { COLORS } from '../utils/constants';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: COLORS.accent,
        tabBarInactiveTintColor: COLORS.textLight,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
          paddingBottom: 4,
          height: 84,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        headerStyle: {
          backgroundColor: COLORS.surface,
        },
        headerTitleStyle: {
          fontWeight: '700',
          color: COLORS.text,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={({ navigation }) => ({
          headerTitle: '',
          headerLeft: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 16 }}>
              <Image
                source={require('../../assets/payway-logo.png')}
                style={{ width: 30, height: 30, borderRadius: 7 }}
                resizeMode="contain"
              />
              <Text style={{ fontSize: 20, fontWeight: '800', color: COLORS.primary, marginLeft: 8 }}>
                PayWay
              </Text>
            </View>
          ),
          headerRight: () => (
            <TouchableOpacity
              onPress={() => navigation.getParent()?.navigate('NotificationCenter')}
              style={{ marginRight: 16, position: 'relative' }}
            >
              <Ionicons name="notifications-outline" size={24} color={COLORS.primary} />
              <View style={{
                position: 'absolute', top: -3, right: -4,
                width: 16, height: 16, borderRadius: 8,
                backgroundColor: COLORS.danger, justifyContent: 'center', alignItems: 'center',
              }}>
                <Text style={{ color: '#fff', fontSize: 9, fontWeight: '800' }}>3</Text>
              </View>
            </TouchableOpacity>
          ),
          tabBarLabel: 'Hjem',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        })}
      />
      <Tab.Screen
        name="Transfers"
        component={TransfersScreen}
        options={{
          title: 'Overførsler',
          tabBarLabel: 'Overførsler',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubbles" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ScanTab"
        component={ScanScreen}
        options={{
          title: 'Scan',
          tabBarLabel: 'Scan',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="qr-code" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Profil',
          tabBarLabel: 'Profil',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  const { isAuthenticated } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: COLORS.surface },
          headerTintColor: COLORS.text,
          headerTitleStyle: { fontWeight: '700' },
        }}
      >
        {!isAuthenticated ? (
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
        ) : (
          <>
            <Stack.Screen
              name="Main"
              component={MainTabs}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Send"
              component={SendScreen}
              options={{ title: 'Send penge', presentation: 'modal' }}
            />
            <Stack.Screen
              name="Scan"
              component={ScanScreen}
              options={{ title: 'Scan QR', presentation: 'fullScreenModal' }}
            />
            <Stack.Screen
              name="TopUp"
              component={TopUpScreen}
              options={{ title: 'Fyld op', presentation: 'modal' }}
            />
            <Stack.Screen name="Cards" component={CardsScreen} options={{ title: 'Betalingskort' }} />
            <Stack.Screen name="ChangePin" component={ChangePinScreen} options={{ title: 'Skift PIN' }} />
            <Stack.Screen name="Biometrics" component={BiometricsScreen} options={{ title: 'Biometri' }} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Notifikationer' }} />
            <Stack.Screen name="NotificationCenter" component={NotificationCenterScreen} options={{ title: 'Notifikationer' }} />
            <Stack.Screen name="KYC" component={KycScreen} options={{ title: 'Verifikation' }} />
            <Stack.Screen name="Support" component={SupportScreen} options={{ title: 'Hjælp & Support' }} />
            <Stack.Screen name="Terms" component={TermsScreen} options={{ title: 'Vilkår & Betingelser' }} />
            <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} options={{ title: 'Privatlivspolitik' }} />
            <Stack.Screen name="CookiePolicy" component={CookiePolicyScreen} options={{ title: 'Cookiepolitik' }} />
            <Stack.Screen name="DataProcessing" component={DataProcessingScreen} options={{ title: 'Databehandling' }} />
            <Stack.Screen name="About" component={TermsScreen} options={{ title: 'Om Payway' }} />
            <Stack.Screen name="LiveChat" component={LiveChatScreen} options={{ title: 'Live Chat' }} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: 'Rediger profil' }} />
            <Stack.Screen name="PersonChat" component={PersonChatScreen} options={{ title: '' }} />
            <Stack.Screen name="GroupDetail" component={GroupDetailScreen} options={{ title: 'Gruppe' }} />
            <Stack.Screen name="CreateGroup" component={CreateGroupScreen} options={{ title: 'Ny gruppe', presentation: 'modal' }} />
            <Stack.Screen name="History" component={HistoryScreen} options={{ title: 'Historik' }} />
            <Stack.Screen name="TransactionDetail" component={TransactionDetailScreen} options={{ title: 'Detaljer' }} />
            <Stack.Screen
              name="Request"
              component={RequestScreen}
              options={{ title: 'Anmod om penge', presentation: 'modal' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
