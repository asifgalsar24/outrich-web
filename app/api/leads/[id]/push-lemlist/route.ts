import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { data: lead } = await supabase
    .from("leads")
    .select("id, company_name, email_address, hebrew_email_draft, lemlist_status, client_id")
    .eq("id", id)
    .eq("client_id", user.id)
    .single();

  if (!lead) return Response.json({ error: "Lead not found" }, { status: 404 });
  if (!lead.email_address) return Response.json({ error: "אין כתובת מייל לליד זה" }, { status: 400 });
  if (!lead.hebrew_email_draft) return Response.json({ error: "אין טיוטת מייל — צור מסר אישי קודם" }, { status: 400 });

  const { data: settings } = await supabase
    .from("settings")
    .select("lemlist_api_key, lemlist_campaign_id")
    .eq("user_id", user.id)
    .single();

  const apiKey    = settings?.lemlist_api_key    || process.env.LEMLIST_API_KEY;
  const campaignId = settings?.lemlist_campaign_id || process.env.LEMLIST_CAMPAIGN_ID;

  if (!apiKey || !campaignId) {
    return Response.json(
      { error: "Lemlist לא מוגדר — הכנס API Key ו-Campaign ID בהגדרות" },
      { status: 400 }
    );
  }

  const auth = Buffer.from(`:${apiKey}`).toString("base64");
  const firstName = lead.company_name?.split(" ")[0] ?? lead.company_name ?? "שלום";

  const lemRes = await fetch(
    `https://api.lemlist.com/api/v2/campaigns/${campaignId}/leads/${encodeURIComponent(lead.email_address)}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify({
        firstName,
        companyName: lead.company_name,
        icebreaker: lead.hebrew_email_draft,
      }),
    }
  );

  if (!lemRes.ok) {
    const text = await lemRes.text();
    return Response.json({ error: `Lemlist שגיאה: ${lemRes.status} — ${text.slice(0, 120)}` }, { status: 502 });
  }

  await supabase
    .from("leads")
    .update({ lemlist_status: "sent", email_status: "contacted" })
    .eq("id", id);

  return Response.json({ ok: true });
}
