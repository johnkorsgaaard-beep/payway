import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function supa() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(req: Request) {
  const supabase = supa();
  const { userId } = await req.json();

  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

  const { data: merchant, error } = await supabase
    .from("merchants")
    .select("*")
    .eq("owner_id", userId)
    .single();

  if (error || !merchant) {
    return NextResponse.json({ error: "Merchant not found" }, { status: 404 });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [txResult, payoutResult] = await Promise.all([
    supabase
      .from("transactions")
      .select("*")
      .eq("merchant_id", merchant.id)
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("payouts")
      .select("*")
      .eq("merchant_id", merchant.id)
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  return NextResponse.json({
    merchant,
    transactions: txResult.data ?? [],
    payouts: payoutResult.data ?? [],
  });
}
