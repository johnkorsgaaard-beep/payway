import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/api-helpers";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const supabase = getServiceClient();

  const updates: Record<string, unknown> = {};
  if (body.is_active !== undefined) updates.is_active = body.is_active;
  if (body.role !== undefined) updates.role = body.role;
  if (body.kyc_status !== undefined) updates.kyc_status = body.kyc_status;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ message: "Ingen felter at opdatere" }, { status: 400 });
  }

  const { error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", id);

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  // If deactivating, also freeze wallet
  if (body.is_active === false) {
    await supabase
      .from("wallets")
      .update({ is_frozen: true })
      .eq("user_id", id);
  } else if (body.is_active === true) {
    await supabase
      .from("wallets")
      .update({ is_frozen: false })
      .eq("user_id", id);
  }

  return NextResponse.json({ success: true });
}
