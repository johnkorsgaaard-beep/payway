import { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'payway_scheduled_payments';

export type Frequency = 'once' | 'weekly' | 'biweekly' | 'monthly';

export interface ScheduledPayment {
  id: string;
  recipientName: string;
  recipientTag?: string;
  recipientPhone?: string;
  amount: number;
  description: string;
  frequency: Frequency;
  dayOfMonth?: number;
  dayOfWeek?: number;
  nextDate: string;
  active: boolean;
  createdAt: string;
}

const FREQUENCY_LABELS: Record<Frequency, string> = {
  once: 'Én gang',
  weekly: 'Hver uge',
  biweekly: 'Hver 2. uge',
  monthly: 'Hver måned',
};

export function getFrequencyLabel(f: Frequency): string {
  return FREQUENCY_LABELS[f] || f;
}

export function computeNextDate(frequency: Frequency, dayOfMonth?: number, dayOfWeek?: number): Date {
  const now = new Date();

  if (frequency === 'once') {
    const d = new Date(now);
    d.setDate(d.getDate() + 1);
    return d;
  }

  if (frequency === 'monthly' && dayOfMonth) {
    const d = new Date(now.getFullYear(), now.getMonth(), dayOfMonth);
    if (d <= now) d.setMonth(d.getMonth() + 1);
    return d;
  }

  if (frequency === 'weekly' || frequency === 'biweekly') {
    const target = dayOfWeek ?? 1;
    const d = new Date(now);
    const diff = (target - d.getDay() + 7) % 7 || 7;
    d.setDate(d.getDate() + diff);
    if (frequency === 'biweekly') d.setDate(d.getDate() + 7);
    return d;
  }

  return now;
}

let globalPayments: ScheduledPayment[] = [];
let loaded = false;
const listeners = new Set<() => void>();

function emit() { listeners.forEach((fn) => fn()); }

async function persist() {
  try { await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(globalPayments)); } catch {}
}

async function loadFromStorage() {
  if (loaded) return;
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) globalPayments = JSON.parse(raw);
  } catch {}
  loaded = true;
  emit();
}

const MOCK_PAYMENTS: ScheduledPayment[] = [
  {
    id: 'sp-1',
    recipientName: 'Jónas Djurhuus',
    recipientTag: 'jonas.d',
    amount: 350000,
    description: 'Husleje',
    frequency: 'monthly',
    dayOfMonth: 1,
    nextDate: (() => { const d = new Date(); d.setMonth(d.getMonth() + (d.getDate() >= 1 ? 1 : 0)); d.setDate(1); return d.toISOString(); })(),
    active: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
  },
  {
    id: 'sp-2',
    recipientName: 'Sara Petersen',
    recipientTag: 'sarap',
    amount: 10000,
    description: 'Netflix halvdel',
    frequency: 'monthly',
    dayOfMonth: 15,
    nextDate: (() => { const d = new Date(); if (d.getDate() >= 15) d.setMonth(d.getMonth() + 1); d.setDate(15); return d.toISOString(); })(),
    active: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
  },
  {
    id: 'sp-3',
    recipientName: 'Magnus Hansen',
    recipientTag: 'magnus.h',
    amount: 5000,
    description: 'Fredagskaffe',
    frequency: 'weekly',
    dayOfWeek: 5,
    nextDate: (() => { const d = new Date(); const diff = (5 - d.getDay() + 7) % 7 || 7; d.setDate(d.getDate() + diff); return d.toISOString(); })(),
    active: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
  },
];

export function useScheduledPayments() {
  const [, rerender] = useState(0);

  useEffect(() => {
    const listener = () => rerender((n) => n + 1);
    listeners.add(listener);
    loadFromStorage().then(() => {
      if (globalPayments.length === 0) {
        globalPayments = MOCK_PAYMENTS;
        persist();
        emit();
      }
    });
    return () => { listeners.delete(listener); };
  }, []);

  const payments = globalPayments;

  const addPayment = useCallback(async (data: Omit<ScheduledPayment, 'id' | 'createdAt'>) => {
    const payment: ScheduledPayment = {
      ...data,
      id: `sp-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    globalPayments = [payment, ...globalPayments];
    emit();
    await persist();
    return payment;
  }, []);

  const updatePayment = useCallback(async (id: string, updates: Partial<ScheduledPayment>) => {
    globalPayments = globalPayments.map((p) => (p.id === id ? { ...p, ...updates } : p));
    emit();
    await persist();
  }, []);

  const deletePayment = useCallback(async (id: string) => {
    globalPayments = globalPayments.filter((p) => p.id !== id);
    emit();
    await persist();
  }, []);

  const togglePayment = useCallback(async (id: string) => {
    globalPayments = globalPayments.map((p) => (p.id === id ? { ...p, active: !p.active } : p));
    emit();
    await persist();
  }, []);

  return { payments, addPayment, updatePayment, deletePayment, togglePayment };
}
