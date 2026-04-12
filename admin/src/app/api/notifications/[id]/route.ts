import { NextResponse } from "next/server";
import { getServiceClient, getUserFromRequest, unauthorized } from "@/lib/api-helpers";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authUser = await getUserFromRequest(req);
  if (!authUser) return unauthorized();

  const { id } = await params;
  const supabase = getServiceClient();

  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", id)
    .eq("user_id", authUser.id);

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
