import { NextResponse } from "next/server";
import { getUserFromRequest, unauthorized } from "@/lib/api-helpers";

export async function GET(req: Request) {
  const authUser = await getUserFromRequest(req);
  if (!authUser) return unauthorized();

  // Stripe payment methods will be integrated when Stripe keys are configured
  // For now, return empty array
  return NextResponse.json([]);
}
