import { NextResponse } from "next/server";
import { getServiceClient, getUserFromRequest, unauthorized, buildUserResponse } from "@/lib/api-helpers";

export async function GET(req: Request) {
  const authUser = await getUserFromRequest(req);
  if (!authUser) return unauthorized();

  const supabase = getServiceClient();
  const user = await buildUserResponse(supabase, authUser.id);

  return NextResponse.json(user);
}
