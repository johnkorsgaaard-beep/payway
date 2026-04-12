import { NextResponse } from "next/server";
import { getServiceClient, buildUserResponse, badRequest } from "@/lib/api-helpers";

export async function POST(req: Request) {
  const { email, password, name, phone } = await req.json();

  if (!email || !password) {
    return badRequest("Email og adgangskode er påkrævet");
  }

  const supabase = getServiceClient();

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: name || "" },
      emailRedirectTo: undefined,
    },
  });

  if (authError) {
    const msg =
      authError.message === "User already registered"
        ? "Der findes allerede en bruger med denne email"
        : authError.message;
    return NextResponse.json({ message: msg }, { status: 400 });
  }

  if (!authData.user || !authData.session) {
    return NextResponse.json(
      { message: "Bruger oprettet. Bekræft venligst din email." },
      { status: 200 }
    );
  }

  const userId = authData.user.id;

  if (name || phone) {
    await supabase
      .from("profiles")
      .update({
        ...(name ? { full_name: name } : {}),
        ...(phone ? { phone } : {}),
      })
      .eq("id", userId);
  }

  const user = await buildUserResponse(supabase, userId);

  return NextResponse.json(
    {
      user,
      token: authData.session.access_token,
      refreshToken: authData.session.refresh_token,
    },
    { status: 201 }
  );
}
