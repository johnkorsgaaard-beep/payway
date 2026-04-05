import { useState, useEffect, useCallback, useRef } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

export type NetworkStatus = 'online' | 'offline' | 'unknown';

interface NetworkState {
  status: NetworkStatus;
  isConnected: boolean;
  type: string | null;
  justReconnected: boolean;
}

const listeners = new Set<() => void>();
let globalState: NetworkState = {
  status: 'unknown',
  isConnected: true,
  type: null,
  justReconnected: false,
};

function emit() {
  listeners.forEach((fn) => fn());
}

let subscribed = false;

function subscribe() {
  if (subscribed) return;
  subscribed = true;

  NetInfo.addEventListener((state: NetInfoState) => {
    const wasOffline = !globalState.isConnected;
    const isNowConnected = state.isConnected ?? true;

    globalState = {
      status: isNowConnected ? 'online' : 'offline',
      isConnected: isNowConnected,
      type: state.type ?? null,
      justReconnected: wasOffline && isNowConnected,
    };
    emit();

    if (globalState.justReconnected) {
      setTimeout(() => {
        globalState = { ...globalState, justReconnected: false };
        emit();
      }, 3000);
    }
  });
}

export function useNetworkStatus(): NetworkState {
  const [, rerender] = useState(0);

  useEffect(() => {
    subscribe();
    const listener = () => rerender((n) => n + 1);
    listeners.add(listener);
    return () => { listeners.delete(listener); };
  }, []);

  return globalState;
}

export function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError && error.message === 'Network request failed') {
    return true;
  }
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    return (
      msg.includes('network request failed') ||
      msg.includes('failed to fetch') ||
      msg.includes('network error') ||
      msg.includes('no internet') ||
      msg.includes('socket') ||
      msg.includes('timeout')
    );
  }
  return false;
}
