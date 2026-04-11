import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function supa() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET() {
  const supabase = supa();

  const { data, error } = await supabase
    .from("merchants")
    .select("*, owner:profiles!owner_id(full_name, phone, email)")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ merchants: data });
}

export async function POST(req: Request) {
  const supabase = supa();
  const body = await req.json();

  const { ownerEmail, ownerName, ownerPhone, password, ...merchantData } = body;

  const slug = (merchantData.name as string)
    .toLowerCase()
    .replace(/[æ]/g, "ae")
    .replace(/[ø]/g, "oe")
    .replace(/[å]/g, "aa")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  // 1) Create auth user for merchant owner
  const { data: authUser, error: authErr } = await supabase.auth.admin.createUser({
    email: ownerEmail,
    password,
    email_confirm: true,
  });

  if (authErr) return NextResponse.json({ error: authErr.message }, { status: 400 });

  // 2) Update profile with role + name
  const { error: profileErr } = await supabase
    .from("profiles")
    .update({ role: "merchant", full_name: ownerName, phone: ownerPhone, email: ownerEmail })
    .eq("id", authUser.user.id);

  if (profileErr) return NextResponse.json({ error: profileErr.message }, { status: 500 });

  // 3) Create merchant
  const { data: merchant, error: merchantErr } = await supabase
    .from("merchants")
    .insert({
      owner_id: authUser.user.id,
      name: merchantData.name,
      slug,
      description: merchantData.description || "",
      address: merchantData.address || "",
      city: merchantData.city || "",
      postal_code: merchantData.postal_code || "",
      phone: merchantData.phone || "",
      email: ownerEmail,
      fee_rate: merchantData.fee_rate ?? 250,
      plan: merchantData.plan || "free",
      onboarding_status: "active",
      is_active: true,
    })
    .select()
    .single();

  if (merchantErr) return NextResponse.json({ error: merchantErr.message }, { status: 500 });

  return NextResponse.json({ merchant }, { status: 201 });
}
