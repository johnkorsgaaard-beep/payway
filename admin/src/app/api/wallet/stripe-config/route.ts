import { NextResponse } from "next/server";
import { getUserFromRequest, unauthorized } from "@/lib/api-helpers";

export async function GET(req: Request) {
  const authUser = await getUserFromRequest(req);
  if (!authUser) return unauthorized();

  const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY;

  if (!publishableKey) {
    return NextResponse.json(
      { message: "Stripe er ikke konfigureret" },
      { status: 503 }
    );
  }

  return NextResponse.json({ publishableKey });
}
