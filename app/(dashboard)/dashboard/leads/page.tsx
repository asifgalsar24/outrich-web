import { createClient } from "@/lib/supabase/server";
import LeadsViewToggle from "@/components/leads-view-toggle";
import RunSearch from "@/components/run-search";

export const dynamic = "force-dynamic";

const F = "var(--font-osh), sans-serif";

export default async function LeadsPage() {
  const supabase = await createClient();

  const [{ data: leads, error }, { data: archivedLeads }] = await Promise.all([
    supabase.from("leads").select("*").neq("archived", true).order("created_at", { ascending: false }),
    supabase.from("leads").select("*").eq("archived", true).order("created_at", { ascending: false }),
  ]);

  if (error) {
    return (
      <div className="p-8" style={{ fontFamily: F }} dir="rtl">
        <p style={{ fontWeight: 300, fontSize: "0.9rem", color: "rgb(248,113,113)" }}>
          שגיאה בטעינת לידים: {error.message}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full" style={{ fontFamily: F }}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06]" dir="rtl">
        <div>
          <h1 style={{ fontWeight: 800, fontSize: "1.5rem", color: "#fff" }}>לידים</h1>
          <p style={{ fontWeight: 300, fontSize: "0.82rem", color: "rgba(255,255,255,0.35)", marginTop: "2px" }}>
            {leads?.length ?? 0} לידים במערכת · לחץ על כרטיס או שורה לצפייה בפרטים
          </p>
        </div>
        <RunSearch />
      </div>

      <div className="flex-1 overflow-hidden">
        <LeadsViewToggle leads={leads ?? []} archivedLeads={archivedLeads ?? []} />
      </div>
    </div>
  );
}
