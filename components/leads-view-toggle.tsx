"use client";

import { useState } from "react";
import { IoListOutline, IoAppsOutline, IoArchiveOutline } from "react-icons/io5";
import type { Lead } from "@/lib/types";
import LeadsTable from "@/components/leads-table";
import CrmBoard from "@/components/crm-board";

type View = "table" | "board" | "archive";

const TABS: { key: View; label: string; icon: React.ReactNode; gf: string; gt: string }[] = [
  { key: "table",   label: "טבלה",   icon: <IoListOutline />,    gf: "#a955ff", gt: "#ea51ff" },
  { key: "board",   label: "לוח",    icon: <IoAppsOutline />,    gf: "#56CCF2", gt: "#2F80ED" },
  { key: "archive", label: "ארכיון", icon: <IoArchiveOutline />, gf: "#FF9966", gt: "#FF5E62" },
];

export default function LeadsViewToggle({ leads, archivedLeads }: { leads: Lead[]; archivedLeads: Lead[] }) {
  const [view, setView] = useState<View>("table");

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-white/[0.06]" dir="rtl">
        <ul className="flex gap-3">
          {TABS.map(({ key, label, icon, gf, gt }) => {
            const active = view === key;
            return (
              <li
                key={key}
                onClick={() => setView(key)}
                className={`relative h-[42px] rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 border border-white/[0.08] overflow-hidden group ${
                  active ? "w-[110px]" : "w-[42px] hover:w-[110px]"
                }`}
                style={{ background: "rgba(255,255,255,0.05)", "--gf": gf, "--gt": gt } as React.CSSProperties}
              >
                <span
                  className="absolute inset-0 bg-[linear-gradient(45deg,var(--gf),var(--gt))] transition-opacity duration-300"
                  style={{ opacity: active ? 1 : 0 }}
                />
                <span
                  className="absolute top-[5px] inset-x-0 h-full bg-[linear-gradient(45deg,var(--gf),var(--gt))] blur-[14px] -z-10 transition-opacity duration-300"
                  style={{ opacity: active ? 0.45 : 0 }}
                />
                <span
                  className="relative z-10 text-lg transition-all duration-200"
                  style={{
                    color: "rgba(255,255,255,0.55)",
                    opacity: active ? 0 : 1,
                    transform: active ? "scale(0)" : "scale(1)",
                    position: active ? "absolute" : "relative",
                  }}
                >
                  {icon}
                </span>
                <span
                  className="absolute z-10 text-white text-sm font-bold tracking-wide transition-all duration-200 flex items-center gap-1"
                  style={{
                    opacity: active ? 1 : 0,
                    transform: active ? "scale(1)" : "scale(0.8)",
                  }}
                >
                  {label}
                  {key === "archive" && archivedLeads.length > 0 && (
                    <span className="text-xs opacity-70">({archivedLeads.length})</span>
                  )}
                </span>
                {/* hover label for inactive */}
                {!active && (
                  <span
                    className="absolute z-10 text-white text-sm font-bold tracking-wide transition-all duration-200 flex items-center gap-1 opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100"
                  >
                    {label}
                    {key === "archive" && archivedLeads.length > 0 && (
                      <span className="text-xs opacity-70">({archivedLeads.length})</span>
                    )}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      <div className="flex-1 overflow-hidden">
        {view === "table"   && <LeadsTable leads={leads} />}
        {view === "board"   && <CrmBoard leads={leads} />}
        {view === "archive" && <LeadsTable leads={archivedLeads} mode="archive" />}
      </div>
    </div>
  );
}
