import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/api-helpers";

export async function POST(req: Request) {
  const { to, templateType, variables } = await req.json();

  if (!to || !templateType) {
    return NextResponse.json({ message: "to og templateType er påkrævet" }, { status: 400 });
  }

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    return NextResponse.json({ message: "Resend API key ikke konfigureret" }, { status: 503 });
  }

  const supabase = getServiceClient();

  const { data: template } = await supabase
    .from("email_templates")
    .select("subject, body")
    .eq("type", templateType)
    .single();

  if (!template) {
    return NextResponse.json({ message: `Skabelon '${templateType}' ikke fundet` }, { status: 404 });
  }

  let { subject, body } = template;
  const vars = variables || {};
  for (const [key, value] of Object.entries(vars)) {
    const placeholder = `{{${key}}}`;
    subject = subject.replaceAll(placeholder, String(value));
    body = body.replaceAll(placeholder, String(value));
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
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

    const result = await res.json();

    if (!res.ok) {
      return NextResponse.json({ message: result.message || "Email fejlede" }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: result.id });
  } catch {
    return NextResponse.json({ message: "Kunne ikke sende email" }, { status: 500 });
  }
}
