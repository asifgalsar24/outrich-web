import { createClient } from "@/lib/supabase/server";
import SettingsForm from "@/components/settings-form";

export const dynamic = "force-dynamic";

const F = "var(--font-osh), sans-serif";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: settings } = user
    ? await supabase.from("settings").select("*").eq("user_id", user!.id).single()
    : { data: null };

  return (
    <div className="flex flex-col h-full" style={{ fontFamily: F }}>
      {/* Header */}
      <div className="px-4 sm:px-6 py-4 border-b border-white/[0.06]" dir="rtl">
        <h1 style={{ fontWeight: 800, fontSize: "1.5rem", color: "#fff" }}>הגדרות</h1>
        <p style={{ fontWeight: 300, fontSize: "0.82rem", color: "rgba(255,255,255,0.35)", marginTop: "2px" }}>
          פרופיל המותג שלך — כאן נבנה כל מייל שאנחנו כותבים עבורך
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">
        <SettingsForm initialSettings={settings} userId={user?.id ?? ""} />
      </div>
    </div>
  );
}
