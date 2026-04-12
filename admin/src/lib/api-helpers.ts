import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function getUserFromRequest(req: Request) {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;

  const token = auth.slice(7);
  const supabase = getServiceClient();
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) return null;
  return user;
}

export function unauthorized() {
  return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
}

export function badRequest(message: string) {
  return NextResponse.json({ message }, { status: 400 });
}

export function serverError(message = "Internal server error") {
  return NextResponse.json({ message }, { status: 500 });
}

export async function buildUserResponse(supabase: ReturnType<typeof getServiceClient>, userId: string) {
  const [profileRes, walletRes] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).single(),
    supabase.from("wallets").select("*").eq("user_id", userId).single(),
  ]);

  const p = profileRes.data;
  const w = walletRes.data;

  return {
    id: userId,
    phone: p?.phone ?? "",
    name: p?.full_name ?? "",
    email: p?.email ?? "",
    profileImage: p?.avatar_url ?? null,
    paywayTag: p?.payway_tag ?? null,
    role: (p?.role ?? "user").toUpperCase(),
    kycStatus: (p?.kyc_status ?? "none").toUpperCase(),
    wallet: w
      ? {
          balance: Number(w.balance),
          currency: w.currency,
          status: w.is_frozen ? "FROZEN" : "ACTIVE",
        }
      : { balance: 0, currency: "DKK", status: "ACTIVE" },
    cards: [],
  };
}
