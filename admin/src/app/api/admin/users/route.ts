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

  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("id, full_name, phone, email, role, kyc_status, is_active, created_at")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: wallets } = await supabase
    .from("wallets")
    .select("user_id, balance, is_frozen");

  const walletMap = new Map((wallets ?? []).map((w) => [w.user_id, w]));

  const users = (profiles ?? []).map((p) => {
    const w = walletMap.get(p.id);
    return {
      id: p.id,
      name: p.full_name || null,
      phone: p.phone || "",
      role: (p.role || "user").toUpperCase(),
      kycStatus: (p.kyc_status || "none").toUpperCase(),
      isActive: p.is_active,
      createdAt: p.created_at,
      wallet: w ? { balance: w.balance, status: w.is_frozen ? "FROZEN" : "ACTIVE" } : null,
    };
  });

  return NextResponse.json({
    users,
    total: users.length,
    page: 1,
    totalPages: 1,
  });
}
