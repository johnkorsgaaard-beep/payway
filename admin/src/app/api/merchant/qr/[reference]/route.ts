import { NextResponse } from "next/server";
import { getServiceClient, getUserFromRequest, unauthorized } from "@/lib/api-helpers";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ reference: string }> }
) {
  const authUser = await getUserFromRequest(req);
  if (!authUser) return unauthorized();

  const { reference } = await params;
  const supabase = getServiceClient();

  // Try dynamic QR session first
  const { data: qr } = await supabase
    .from("qr_sessions")
    .select("id, merchant_id, amount, status, expires_at, merchants(name, logo_url)")
    .eq("id", reference)
    .eq("status", "active")
    .gt("expires_at", new Date().toISOString())
    .single();

  if (qr) {
    const merchant = qr.merchants as unknown as { name: string; logo_url: string | null };
    return NextResponse.json({
      type: "dynamic",
      sessionId: qr.id,
      merchantId: qr.merchant_id,
      merchantName: merchant?.name ?? "",
      merchantLogo: merchant?.logo_url ?? null,
      amount: Number(qr.amount),
    });
  }

  // Try static QR (merchant's permanent qr_code_id)
  const { data: merchant } = await supabase
    .from("merchants")
    .select("id, name, logo_url, qr_code_id")
    .eq("qr_code_id", reference)
    .eq("is_active", true)
    .single();

  if (merchant) {
    return NextResponse.json({
      type: "static",
      merchantId: merchant.id,
      merchantName: merchant.name,
      merchantLogo: merchant.logo_url,
      amount: null,
    });
  }

  return NextResponse.json({ message: "QR-kode ikke fundet" }, { status: 404 });
}
