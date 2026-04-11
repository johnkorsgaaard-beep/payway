import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function supa() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET() {
  const supabase = supa();

  const [profiles, merchants, transactions] = await Promise.all([
    supabase.from("profiles").select("id, role, full_name, phone, email, kyc_status, is_active, created_at", { count: "exact" }),
    supabase.from("merchants").select("id, name, fee_rate", { count: "exact" }),
    supabase.from("transactions").select("*").order("created_at", { ascending: false }).limit(200),
  ]);

  const txList = transactions.data ?? [];
  const totalVolume = txList.reduce((s, t) => s + (t.amount || 0), 0);
  const totalFees = txList.reduce((s, t) => s + (t.fee_amount || 0), 0);

  const byType: Record<string, { count: number; amount: number; fee: number }> = {};
  for (const tx of txList) {
    const t = tx.type || "unknown";
    if (!byType[t]) byType[t] = { count: 0, amount: 0, fee: 0 };
    byType[t].count++;
    byType[t].amount += tx.amount || 0;
    byType[t].fee += tx.fee_amount || 0;
  }

  const volumeByType = Object.entries(byType).map(([type, v]) => ({
    type: type.toUpperCase(),
    _sum: { amount: v.amount, fee: v.fee },
    _count: v.count,
  }));

  const recentTransactions = txList.slice(0, 10).map((tx) => ({
    id: tx.id,
    amount: tx.amount,
    fee: tx.fee_amount || 0,
    type: (tx.type || "").toUpperCase(),
    status: (tx.status || "").toUpperCase(),
    createdAt: tx.created_at,
    fromWallet: null,
    toWallet: null,
  }));

  return NextResponse.json({
    totalUsers: profiles.count ?? 0,
    totalMerchants: merchants.count ?? 0,
    totalTransactions: txList.length,
    totalVolume,
    totalFees,
    volumeByType,
    recentTransactions,
  });
}
