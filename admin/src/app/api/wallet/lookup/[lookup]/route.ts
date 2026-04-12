import { NextResponse } from "next/server";
import { getServiceClient, getUserFromRequest, unauthorized } from "@/lib/api-helpers";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ lookup: string }> }
) {
  const authUser = await getUserFromRequest(req);
  if (!authUser) return unauthorized();

  const { lookup } = await params;
  if (!lookup || lookup.length < 2) {
    return NextResponse.json({ name: null }, { status: 404 });
  }

  const supabase = getServiceClient();

  // Try payway_tag first, then phone
  const { data: byTag } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url, payway_tag")
    .eq("payway_tag", lookup)
    .neq("id", authUser.id)
    .maybeSingle();

  if (byTag) {
    return NextResponse.json({
      id: byTag.id,
      name: byTag.full_name,
      avatar: byTag.avatar_url,
      paywayTag: byTag.payway_tag,
    });
  }

  // Try phone (with or without +)
  const phoneLookup = lookup.startsWith("+") ? lookup : `+${lookup}`;
  const { data: byPhone } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url, payway_tag")
    .eq("phone", phoneLookup)
    .neq("id", authUser.id)
    .maybeSingle();

  if (byPhone) {
    return NextResponse.json({
      id: byPhone.id,
      name: byPhone.full_name,
      avatar: byPhone.avatar_url,
      paywayTag: byPhone.payway_tag,
    });
  }

  return NextResponse.json({ name: null }, { status: 404 });
}
