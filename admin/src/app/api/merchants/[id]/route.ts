import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function supa() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = supa();
  const body = await req.json();

  const { data, error } = await supabase
    .from("merchants")
    .update({ ...body, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ merchant: data });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = supa();

  const { data: merchant } = await supabase
    .from("merchants")
    .select("owner_id")
    .eq("id", id)
    .single();

  const { error } = await supabase.from("merchants").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (merchant?.owner_id) {
    await supabase.auth.admin.deleteUser(merchant.owner_id);
  }

  return NextResponse.json({ success: true });
}
