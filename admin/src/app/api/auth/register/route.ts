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

  // Send welcome email via Resend (non-blocking)
  sendWelcomeEmail(supabase, email, name || "").catch(() => {});

  return NextResponse.json(
    {
      user,
      token: authData.session.access_token,
      refreshToken: authData.session.refresh_token,
    },
    { status: 201 }
  );
}

async function sendWelcomeEmail(
  supabase: ReturnType<typeof getServiceClient>,
  to: string,
  name: string
) {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) return;

  const { data: template } = await supabase
    .from("email_templates")
    .select("subject, body")
    .eq("type", "welcome")
    .single();

  if (!template) return;

  const subject = template.subject.replaceAll("{{name}}", name);
  const body = template.body.replaceAll("{{name}}", name);

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM_EMAIL || "PayWay <onboarding@resend.dev>",
      to,
      subject,
      html: body,
    }),
  });
}
