import { NextResponse } from "next/server";
import { getUserFromRequest, unauthorized, badRequest, serverError } from "@/lib/api-helpers";

export async function POST(req: Request) {
  const authUser = await getUserFromRequest(req);
  if (!authUser) return unauthorized();

  const { amount } = await req.json();
  if (!amount || amount <= 0) return badRequest("Ugyldigt beløb");

  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecret) {
    return NextResponse.json({ message: "Stripe er ikke konfigureret" }, { status: 503 });
  }

  try {
    const res = await fetch("https://api.stripe.com/v1/payment_intents", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${stripeSecret}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        amount: amount.toString(),
        currency: "dkk",
        "metadata[user_id]": authUser.id,
        "metadata[type]": "topup",
      }),
    });

    const pi = await res.json();

    if (pi.error) {
      return NextResponse.json({ message: pi.error.message }, { status: 400 });
    }

    return NextResponse.json({
      clientSecret: pi.client_secret,
      paymentIntentId: pi.id,
    });
  } catch {
    return serverError("Kunne ikke oprette betaling");
  }
}
