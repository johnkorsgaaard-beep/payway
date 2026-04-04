import React from 'react';
import { Image, View, Text } from 'react-native';
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
import { KycScreen } from '../screens/KycScreen';
import { SupportScreen } from '../screens/SupportScreen';
import { TermsScreen } from '../screens/TermsScreen';
import { EditProfileScreen } from '../screens/EditProfileScreen';
import { RequestScreen } from '../screens/RequestScreen';
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
        options={{
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
          tabBarLabel: 'Hjem',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
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
            <Stack.Screen name="KYC" component={KycScreen} options={{ title: 'Verifikation' }} />
            <Stack.Screen name="Support" component={SupportScreen} options={{ title: 'Hjælp & Support' }} />
            <Stack.Screen name="Terms" component={TermsScreen} options={{ title: 'Vilkår' }} />
            <Stack.Screen name="About" component={TermsScreen} options={{ title: 'Om Payway' }} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: 'Rediger profil' }} />
            <Stack.Screen name="PersonChat" component={PersonChatScreen} options={{ title: '' }} />
            <Stack.Screen name="GroupDetail" component={GroupDetailScreen} options={{ title: 'Gruppe' }} />
            <Stack.Screen name="CreateGroup" component={CreateGroupScreen} options={{ title: 'Ny gruppe', presentation: 'modal' }} />
            <Stack.Screen name="History" component={HistoryScreen} options={{ title: 'Historik' }} />
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
