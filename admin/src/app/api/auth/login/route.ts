import { NextResponse } from "next/server";
import { getServiceClient, buildUserResponse, badRequest } from "@/lib/api-helpers";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return badRequest("Email og adgangskode er påkrævet");
  }

  const supabase = getServiceClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return NextResponse.json(
      { message: "Forkert email eller adgangskode" },
      { status: 401 }
    );
  }

  const user = await buildUserResponse(supabase, data.user.id);

  return NextResponse.json({
    user,
    token: data.session.access_token,
    refreshToken: data.session.refresh_token,
  });
}
