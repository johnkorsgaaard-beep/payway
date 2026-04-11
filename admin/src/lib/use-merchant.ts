"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";

interface Merchant {
  id: string;
  name: string;
  slug: string;
  description: string;
  address: string;
  city: string;
  postal_code: string;
  phone: string;
  email: string;
  logo_url: string | null;
  fee_rate: number;
  plan: string;
  onboarding_status: string;
  is_active: boolean;
  is_open: boolean;
  created_at: string;
}

interface Transaction {
  id: string;
  amount: number;
  fee_amount: number;
  type: string;
  status: string;
  description: string;
  sender_id: string;
  recipient_id: string;
  merchant_id: string;
  created_at: string;
}

interface Payout {
  id: string;
  merchant_id: string;
  amount: number;
  fee_deducted: number;
  net_amount: number;
  status: string;
  period_start: string;
  period_end: string;
  created_at: string;
}

interface MerchantData {
  merchant: Merchant;
  transactions: Transaction[];
  payouts: Payout[];
}

export function useMerchant() {
  const { user } = useAuth();
  const [data, setData] = useState<MerchantData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch("/api/shop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });
      if (!res.ok) throw new Error("Kunne ikke hente butiksdata");
      const json = await res.json();
      setData(json);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ukendt fejl");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { ...data, loading, error, refresh };
}

export type { Merchant, Transaction, Payout, MerchantData };
