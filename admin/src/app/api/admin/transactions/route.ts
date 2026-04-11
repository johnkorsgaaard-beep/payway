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

  const { data: txList, error } = await supabase
    .from("transactions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const transactions = (txList ?? []).map((tx) => ({
    id: tx.id,
    amount: tx.amount,
    fee: tx.fee_amount || 0,
    type: (tx.type || "").toUpperCase(),
    status: (tx.status || "").toUpperCase(),
    description: tx.description || null,
    createdAt: tx.created_at,
    fromWallet: null,
    toWallet: null,
  }));

  return NextResponse.json({
    transactions,
    total: transactions.length,
    page: 1,
    totalPages: 1,
  });
}
