import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

export function OfflineBanner() {
  const { status, isConnected, justReconnected } = useNetworkStatus();
  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const visible = useRef(false);

  useEffect(() => {
    if (!isConnected && status === 'offline') {
      visible.current = true;
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 80,
        friction: 12,
      }).start();
    } else if (justReconnected && visible.current) {
      setTimeout(() => {
        Animated.timing(slideAnim, {
          toValue: -100,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          visible.current = false;
        });
      }, 2500);
    } else if (isConnected && !justReconnected) {
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 250,
        useNativeDriver: true,
      }).start(() => {
        visible.current = false;
      });
    }
  }, [isConnected, justReconnected, status, slideAnim]);

  if (status === 'unknown') return null;

  const isReconnected = justReconnected && isConnected;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          paddingTop: insets.top + 8,
          backgroundColor: isReconnected ? '#059669' : '#dc2626',
          transform: [{ translateY: slideAnim }],
        },
      ]}
      pointerEvents="box-none"
    >
      <View style={styles.content}>
        <Ionicons
          name={isReconnected ? 'wifi' : 'cloud-offline'}
          size={18}
          color="#fff"
        />
        <Text style={styles.text}>
          {isReconnected
            ? 'Forbindelsen er genoprettet'
            : 'Ingen internetforbindelse'}
        </Text>
      </View>
      {!isReconnected && (
        <Text style={styles.subtext}>
          Nogle funktioner er utilgængelige offline
        </Text>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    paddingBottom: 12,
    paddingHorizontal: 20,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  text: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  subtext: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 2,
  },
});
