import { NextResponse } from "next/server";
import { getServiceClient, getUserFromRequest, unauthorized, badRequest } from "@/lib/api-helpers";

export async function POST(req: Request) {
  const authUser = await getUserFromRequest(req);
  if (!authUser) return unauthorized();

  const { qrReference, amount, pin } = await req.json();

  if (!qrReference || !amount || amount <= 0) {
    return badRequest("QR-reference og beløb er påkrævet");
  }

  const supabase = getServiceClient();

  // Verify PIN
  if (pin) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("pin_hash")
      .eq("id", authUser.id)
      .single();

    if (profile?.pin_hash && profile.pin_hash !== pin) {
      return badRequest("Forkert PIN-kode");
    }
  }

  // Look up QR session
  const { data: qr } = await supabase
    .from("qr_sessions")
    .select("id, merchant_id, amount, status, expires_at")
    .eq("id", qrReference)
    .single();

  if (!qr) {
    // Static QR: look up merchant by qr_code_id
    const { data: merchant } = await supabase
      .from("merchants")
      .select("id, name")
      .eq("qr_code_id", qrReference)
      .eq("is_active", true)
      .single();

    if (!merchant) return badRequest("Ugyldig QR-kode");

    const { data: txId, error } = await supabase.rpc("pay_merchant", {
      p_payer_id: authUser.id,
      p_merchant_id: merchant.id,
      p_amount: amount,
      p_description: merchant.name,
    });

    if (error) {
      const msg =
        error.message === "insufficient_balance"
          ? "Ikke nok penge på kontoen"
          : "Betaling mislykkedes";
      return badRequest(msg);
    }

    const { data: wallet } = await supabase
      .from("wallets")
      .select("balance")
      .eq("user_id", authUser.id)
      .single();

    return NextResponse.json({
      transactionId: txId,
      merchantName: merchant.name,
      newBalance: Number(wallet?.balance ?? 0),
    });
  }

  // Dynamic QR session
  if (qr.status !== "active") return badRequest("QR-kode er udløbet");
  if (new Date(qr.expires_at) < new Date()) return badRequest("QR-kode er udløbet");

  const payAmount = Number(qr.amount);

  const { data: txId, error } = await supabase.rpc("pay_merchant", {
    p_payer_id: authUser.id,
    p_merchant_id: qr.merchant_id,
    p_amount: payAmount,
  });

  if (error) {
    const msg =
      error.message === "insufficient_balance"
        ? "Ikke nok penge på kontoen"
        : "Betaling mislykkedes";
    return badRequest(msg);
  }

  // Mark QR session as paid
  await supabase
    .from("qr_sessions")
    .update({ status: "paid", transaction_id: txId })
    .eq("id", qr.id);

  const { data: wallet } = await supabase
    .from("wallets")
    .select("balance")
    .eq("user_id", authUser.id)
    .single();

  return NextResponse.json({
    transactionId: txId,
    newBalance: Number(wallet?.balance ?? 0),
  });
}
