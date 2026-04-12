import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/api-helpers";

export async function GET() {
  const supabase = getServiceClient();

  const { data: merchants } = await supabase
    .from("merchants")
    .select("id, name, fee_rate, plan")
    .order("name");

  const fees = (merchants ?? []).map((m) => ({
    id: m.id,
    merchantName: m.name,
    feeRate: m.fee_rate,
    plan: m.plan,
    feePercentage: (m.fee_rate / 100).toFixed(2) + "%",
  }));

  return NextResponse.json({ fees });
}

export async function PUT(req: Request) {
  const { merchantId, feeRate } = await req.json();

  if (!merchantId || feeRate === undefined) {
    return NextResponse.json(
      { message: "merchantId og feeRate er påkrævet" },
      { status: 400 }
    );
  }

  const supabase = getServiceClient();

  const { error } = await supabase
    .from("merchants")
    .update({ fee_rate: feeRate })
    .eq("id", merchantId);

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
