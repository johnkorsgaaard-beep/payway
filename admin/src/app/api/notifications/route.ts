import { NextResponse } from "next/server";
import { getServiceClient, getUserFromRequest, unauthorized } from "@/lib/api-helpers";

export async function GET(req: Request) {
  const authUser = await getUserFromRequest(req);
  if (!authUser) return unauthorized();

  const url = new URL(req.url);
  const limit = Math.min(50, parseInt(url.searchParams.get("limit") || "20"));

  const supabase = getServiceClient();

  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", authUser.id)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json({ notifications: data ?? [] });
}
