"use client";

import { useState } from "react";
import type { Lead } from "@/lib/types";
import LeadsTable from "@/components/leads-table";
import CrmBoard from "@/components/crm-board";

const F = "var(--font-osh), sans-serif";
type View = "table" | "board";

export default function LeadsViewToggle({ leads }: { leads: Lead[] }) {
  const [view, setView] = useState<View>("table");

  return (
    <div className="flex flex-col h-full">
      {/* View tabs */}
      <div className="flex items-center gap-1 px-6 pt-3 border-b border-white/[0.06]" dir="rtl" style={{ fontFamily: F }}>
        {(["table", "board"] as View[]).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className="rounded-t-xl px-4 py-2 -mb-px transition-all"
            style={{
              fontWeight: view === v ? 700 : 400,
              fontSize: "0.85rem",
              color: view === v ? "rgb(129,140,248)" : "rgba(255,255,255,0.35)",
              background: view === v ? "rgba(99,102,241,0.08)" : "transparent",
              border: view === v ? "1px solid rgba(99,102,241,0.2)" : "1px solid transparent",
              borderBottom: view === v ? "1px solid #0d0d0d" : "1px solid transparent",
            }}
          >
            {v === "table" ? "☰ טבלה" : "⬛ לוח"}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {view === "table" ? <LeadsTable leads={leads} /> : <CrmBoard leads={leads} />}
      </div>
    </div>
  );
}
