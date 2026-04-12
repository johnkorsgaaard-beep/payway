import { NextResponse } from "next/server";
import { getServiceClient, getUserFromRequest, unauthorized, badRequest } from "@/lib/api-helpers";

export async function POST(req: Request) {
  const authUser = await getUserFromRequest(req);
  if (!authUser) return unauthorized();

  const { paymentIntentId, amount } = await req.json();
  if (!paymentIntentId || !amount) return badRequest("paymentIntentId og amount er påkrævet");

  const stripeSecret = process.env.STRIPE_SECRET_KEY;

  // Verify the payment intent if Stripe is configured
  if (stripeSecret) {
    try {
      const res = await fetch(
        `https://api.stripe.com/v1/payment_intents/${paymentIntentId}`,
        { headers: { Authorization: `Bearer ${stripeSecret}` } }
      );
      const pi = await res.json();

      if (pi.status !== "succeeded") {
        return badRequest("Betaling er ikke gennemført endnu");
      }
    } catch {
      return badRequest("Kunne ikke verificere betaling");
    }
  }

  const supabase = getServiceClient();

  const { data: txId, error } = await supabase.rpc("topup_wallet", {
    p_user_id: authUser.id,
    p_amount: amount,
    p_stripe_pi_id: paymentIntentId,
  });

  if (error) {
    return NextResponse.json({ message: "Optankning mislykkedes" }, { status: 500 });
  }

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
