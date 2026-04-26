export type CrmStatus = "new" | "draft" | "sent" | "responded" | "client";

export type Lead = {
  id: string;
  company_name: string;
  ad_type: string | null;
  niche: string | null;
  business_score: number | null;
  lead_quality: string | null;
  score_reasoning: string | null;
  suggested_service: string | null;
  outreach_angle: string | null;
  perplexity_research: string | null;
  hebrew_email_draft: string | null;
  email_address: string | null;
  email_approved: boolean | null;
  lemlist_status: string | null;
  website_url: string | null;
  facebook_page: string | null;
  ad_url: string | null;
  page_followers: number | null;
  active_ads_count: number | null;
  created_at: string;
  crm_status: CrmStatus;
};
