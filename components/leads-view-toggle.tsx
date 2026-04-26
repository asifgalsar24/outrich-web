"use client";

import { useState } from "react";
import type { Lead } from "@/lib/types";
import LeadsTable from "@/components/leads-table";
import CrmBoard from "@/components/crm-board";

const F = "var(--font-osh), sans-serif";
type View = "table" | "board" | "archive";

const TABS: { key: View; label: string }[] = [
  { key: "table",   label: "☰ טבלה"   },
  { key: "board",   label: "🗂 לוח"    },
  { key: "archive", label: "📦 ארכיון" },
];

export default function LeadsViewToggle({
  leads,
  archivedLeads,
}: {
  leads: Lead[];
  archivedLeads: Lead[];
}) {
  const [view, setView] = useState<View>("table");

  return (
    <div className="flex flex-col h-full">
      {/* View tabs */}
      <div className="flex items-center gap-1 px-6 pt-3 border-b border-white/[0.06]" dir="rtl" style={{ fontFamily: F }}>
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setView(key)}
            className="rounded-t-xl px-4 py-2 -mb-px transition-all"
            style={{
              fontWeight: view === key ? 700 : 400,
              fontSize: "0.85rem",
              color: view === key ? "rgb(129,140,248)" : "rgba(255,255,255,0.35)",
              background: view === key ? "rgba(99,102,241,0.08)" : "transparent",
              border: view === key ? "1px solid rgba(99,102,241,0.2)" : "1px solid transparent",
              borderBottom: view === key ? "1px solid #0d0d0d" : "1px solid transparent",
            }}
          >
            {label}
            {key === "archive" && archivedLeads.length > 0 && (
              <span
                className="mr-1.5 rounded-full px-1.5 py-0.5"
                style={{ fontSize: "0.68rem", fontWeight: 700, background: "rgba(250,204,21,0.15)", color: "rgb(250,204,21)" }}
              >
                {archivedLeads.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {view === "table"   && <LeadsTable leads={leads} />}
        {view === "board"   && <CrmBoard leads={leads} />}
        {view === "archive" && <LeadsTable leads={archivedLeads} mode="archive" />}
      </div>
    </div>
  );
}
