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
    .select("instantly_api_key, instantly_campaign_id")
    .eq("user_id", user.id)
    .single();

  const apiKey     = settings?.instantly_api_key     || process.env.INSTANTLY_API_KEY;
  const campaignId = settings?.instantly_campaign_id || process.env.INSTANTLY_CAMPAIGN_ID;

  if (!apiKey || !campaignId) {
    return Response.json(
      { error: "Instantly לא מוגדר — הכנס API Key ו-Campaign ID בהגדרות" },
      { status: 400 }
    );
  }

  const firstName = lead.company_name?.split(" ")[0] ?? lead.company_name ?? "";

  const instRes = await fetch("https://api.instantly.ai/api/v2/leads/add", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      campaign_id: campaignId,
      leads: [
        {
          email: lead.email_address,
          first_name: firstName,
          company_name: lead.company_name,
          custom_variables: {
            icebreaker: lead.hebrew_email_draft,
          },
        },
      ],
    }),
  });

  if (!instRes.ok) {
    const text = await instRes.text();
    const msg =
      instRes.status === 401 ? "API Key שגוי או פג תוקף" :
      instRes.status === 402 ? "אין מנוי פעיל ב-Instantly" :
      instRes.status === 404 ? "Campaign ID לא נמצא" :
      `שגיאה ${instRes.status}: ${text.slice(0, 120)}`;
    return Response.json({ error: msg }, { status: 502 });
  }

  await supabase
    .from("leads")
    .update({ lemlist_status: "sent", email_status: "contacted" })
    .eq("id", id);

  return Response.json({ ok: true });
}
