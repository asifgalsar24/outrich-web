import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let voice_profile = {};
  if (user) {
    const { data: settings } = await supabase
      .from("settings")
      .select("*")
      .eq("user_id", user.id)
      .single();
    if (settings) voice_profile = settings;
  }

  const backendUrl = process.env.PIPELINE_BACKEND_URL || "http://localhost:3001";
  const upstream = await fetch(`${backendUrl}/write-email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ lead_id: id, voice_profile }),
  });

  if (!upstream.ok) {
    const text = await upstream.text();
    return Response.json({ error: text }, { status: 502 });
  }

  const data = await upstream.json();
  return Response.json(data);
}
