import { NextResponse } from "next/server";
import { getServiceClient, getUserFromRequest, unauthorized, badRequest } from "@/lib/api-helpers";

export async function POST(req: Request) {
  const authUser = await getUserFromRequest(req);
  if (!authUser) return unauthorized();

  const { amount } = await req.json();

  if (!amount || amount <= 0) {
    return badRequest("Ugyldigt beløb");
  }

  const supabase = getServiceClient();

  const { data: txId, error } = await supabase.rpc("topup_wallet", {
    p_user_id: authUser.id,
    p_amount: amount,
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
