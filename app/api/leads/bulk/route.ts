import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const { ids, action } = await request.json() as { ids: string[]; action: "delete" | "archive" | "restore" };

  if (!Array.isArray(ids) || ids.length === 0) {
    return Response.json({ error: "ids required" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "unauthorized" }, { status: 401 });

  if (action === "delete") {
    const { error } = await supabase.from("leads").delete().in("id", ids).eq("client_id", user.id);
    if (error) return Response.json({ error: error.message }, { status: 500 });
  } else if (action === "archive") {
    const { error } = await supabase.from("leads").update({ archived: true }).in("id", ids).eq("client_id", user.id);
    if (error) return Response.json({ error: error.message }, { status: 500 });
  } else if (action === "restore") {
    const { error } = await supabase.from("leads").update({ archived: false }).in("id", ids).eq("client_id", user.id);
    if (error) return Response.json({ error: error.message }, { status: 500 });
  } else {
    return Response.json({ error: "invalid action" }, { status: 400 });
  }

  return Response.json({ ok: true });
}
