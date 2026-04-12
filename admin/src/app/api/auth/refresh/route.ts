import { NextResponse } from "next/server";
import { getServiceClient, badRequest } from "@/lib/api-helpers";

export async function POST(req: Request) {
  const { refreshToken } = await req.json();

  if (!refreshToken) {
    return badRequest("refreshToken er påkrævet");
  }

  const supabase = getServiceClient();

  const { data, error } = await supabase.auth.refreshSession({
    refresh_token: refreshToken,
  });

  if (error || !data.session) {
    return NextResponse.json(
      { message: "Ugyldig refresh token" },
      { status: 401 }
    );
  }

  return NextResponse.json({
    token: data.session.access_token,
    refreshToken: data.session.refresh_token,
  });
}
