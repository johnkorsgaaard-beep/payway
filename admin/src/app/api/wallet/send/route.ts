import { NextResponse } from "next/server";
import { getServiceClient, getUserFromRequest, unauthorized, badRequest } from "@/lib/api-helpers";

export async function POST(req: Request) {
  const authUser = await getUserFromRequest(req);
  if (!authUser) return unauthorized();

  const { amount, description, recipientTag, recipientPhone, pin } = await req.json();

  if (!amount || amount <= 0) return badRequest("Ugyldigt beløb");
  if (!recipientTag && !recipientPhone) return badRequest("Modtager er påkrævet");

  const supabase = getServiceClient();

  // Verify PIN if provided
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

  // Find recipient
  let recipientQuery = supabase.from("profiles").select("id, full_name");
  if (recipientTag) {
    recipientQuery = recipientQuery.eq("payway_tag", recipientTag);
  } else {
    recipientQuery = recipientQuery.eq("phone", recipientPhone);
  }

  const { data: recipient } = await recipientQuery.maybeSingle();
  if (!recipient) return badRequest("Modtager ikke fundet");
  if (recipient.id === authUser.id) return badRequest("Du kan ikke sende til dig selv");

  // Execute atomic transfer
  const { data: txId, error } = await supabase.rpc("transfer_p2p", {
    p_sender_id: authUser.id,
    p_receiver_id: recipient.id,
    p_amount: amount,
    p_description: description || null,
  });

  if (error) {
    const msg =
      error.message === "insufficient_balance"
        ? "Ikke nok penge på kontoen"
        : error.message === "sender_wallet_not_found"
        ? "Wallet ikke fundet"
        : "Overførsel mislykkedes";
    return badRequest(msg);
  }

  // Get updated wallet balance
  const { data: wallet } = await supabase
    .from("wallets")
    .select("balance")
    .eq("user_id", authUser.id)
    .single();

  return NextResponse.json({
    transactionId: txId,
    recipientName: recipient.full_name,
    newBalance: Number(wallet?.balance ?? 0),
  });
}
