import { NextResponse } from "next/server";
import { getServiceClient, getUserFromRequest, unauthorized, badRequest } from "@/lib/api-helpers";

export async function POST(req: Request) {
  const authUser = await getUserFromRequest(req);
  if (!authUser) return unauthorized();

  const body = await req.json();
  const { name, email, phone, profileImage, paywayTag } = body;

  const updates: Record<string, unknown> = {};
  if (name !== undefined) updates.full_name = name;
  if (email !== undefined) updates.email = email;
  if (phone !== undefined) updates.phone = phone;
  if (profileImage !== undefined) updates.avatar_url = profileImage;
  if (paywayTag !== undefined) updates.payway_tag = paywayTag;

  if (Object.keys(updates).length === 0) {
    return badRequest("Ingen felter at opdatere");
  }

  const supabase = getServiceClient();

  if (paywayTag) {
    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("payway_tag", paywayTag)
      .neq("id", authUser.id)
      .maybeSingle();

    if (existing) {
      return badRequest("PayWay-tag er allerede taget");
    }
  }

  const { error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", authUser.id);

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
