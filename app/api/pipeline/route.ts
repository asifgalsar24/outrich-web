import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const { keyword, max_leads } = await request.json();

  // Get the authenticated user and their voice profile settings
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

  // Proxy the SSE stream from outrich-app, passing user context
  const backendUrl = process.env.PIPELINE_BACKEND_URL || "http://localhost:3001";
  const upstream = await fetch(`${backendUrl}/pipeline`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      keyword,
      max_leads,
      user_id: user?.id ?? null,
      voice_profile,
    }),
  });

  if (!upstream.ok || !upstream.body) {
    return new Response(
      JSON.stringify({ error: "Pipeline server unavailable" }),
      { status: 502 }
    );
  }

  return new Response(upstream.body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "X-Accel-Buffering": "no",
    },
  });
}
