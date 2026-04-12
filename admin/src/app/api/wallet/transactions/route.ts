import { NextResponse } from "next/server";
import { getServiceClient, getUserFromRequest, unauthorized } from "@/lib/api-helpers";

export async function GET(req: Request) {
  const authUser = await getUserFromRequest(req);
  if (!authUser) return unauthorized();

  const url = new URL(req.url);
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
  const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get("limit") || "20")));
  const offset = (page - 1) * limit;

  const supabase = getServiceClient();

  const { data: wallet } = await supabase
    .from("wallets")
    .select("id")
    .eq("user_id", authUser.id)
    .single();

  if (!wallet) {
    return NextResponse.json({ transactions: [], totalPages: 0 });
  }

  const walletId = wallet.id;

  const { count } = await supabase
    .from("transactions")
    .select("id", { count: "exact", head: true })
    .or(`from_wallet_id.eq.${walletId},to_wallet_id.eq.${walletId}`);

  const { data: rows, error } = await supabase
    .from("transactions")
    .select(`
      id, type, status, amount, fee, net_amount, description,
      created_at, completed_at, from_wallet_id, to_wallet_id, merchant_id
    `)
    .or(`from_wallet_id.eq.${walletId},to_wallet_id.eq.${walletId}`)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  const transactions = (rows ?? []).map((tx) => {
    const isSender = tx.from_wallet_id === walletId;
    return {
      id: tx.id,
      type: tx.type,
      status: tx.status,
      amount: Number(tx.amount),
      fee: Number(tx.fee),
      netAmount: Number(tx.net_amount),
      description: tx.description,
      createdAt: tx.created_at,
      completedAt: tx.completed_at,
      direction: isSender ? "outgoing" : "incoming",
      fromUser: null,
      toUser: null,
    };
  });

  const totalPages = Math.ceil((count ?? 0) / limit);

  return NextResponse.json({ transactions, totalPages });
}
