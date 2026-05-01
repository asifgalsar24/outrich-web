"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { IoListOutline, IoAppsOutline, IoArchiveOutline } from "react-icons/io5";
import type { Lead } from "@/lib/types";
import LeadsTable from "@/components/leads-table";
import CrmBoard from "@/components/crm-board";

type View = "table" | "board" | "archive";

const TABS: { key: View; label: string; icon: React.ReactNode; from: string; to: string }[] = [
  { key: "table",   label: "טבלה",   icon: <IoListOutline />,    from: "#a955ff", to: "#ea51ff" },
  { key: "board",   label: "לוח",    icon: <IoAppsOutline />,    from: "#56CCF2", to: "#2F80ED" },
  { key: "archive", label: "ארכיון", icon: <IoArchiveOutline />, from: "#FF9966", to: "#FF5E62" },
];

export default function LeadsViewToggle({ leads, archivedLeads }: { leads: Lead[]; archivedLeads: Lead[] }) {
  const [view, setView] = useState<View>("table");

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-white/[0.06]" dir="rtl">
        <ul className="flex gap-3">
          {TABS.map(({ key, label, icon, from, to }) => {
            const active = view === key;
            const gradient = `linear-gradient(45deg, ${from}, ${to})`;
            return (
              <motion.li
                key={key}
                onClick={() => setView(key)}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.94 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className={`relative h-[42px] rounded-full flex items-center justify-center cursor-pointer border border-white/[0.08] overflow-hidden group ${
                  active ? "w-[110px]" : "w-[42px] hover:w-[110px]"
                }`}
                style={{
                  background: "rgba(255,255,255,0.05)",
                  transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              >
                {/* Gradient fill */}
                <span
                  className="absolute inset-0 rounded-full transition-opacity duration-300 pointer-events-none"
                  style={{ background: gradient, opacity: active ? 1 : 0 }}
                />
                {/* Glow — strengthened */}
                <span
                  className="absolute top-[5px] inset-x-0 h-full rounded-full blur-[24px] -z-10 transition-opacity duration-300 pointer-events-none"
                  style={{ background: gradient, opacity: active ? 0.7 : 0 }}
                />
                {/* Icon (visible when collapsed) */}
                <span
                  className="relative z-10 text-lg pointer-events-none transition-all duration-200"
                  style={{
                    color: "rgba(255,255,255,0.55)",
                    opacity: active ? 0 : 1,
                    transform: active ? "scale(0)" : "scale(1)",
                    position: active ? "absolute" : "relative",
                  }}
                >
                  {icon}
                </span>
                {/* Label (visible when active) */}
                <span
                  className="absolute z-10 text-white text-sm font-bold tracking-wide pointer-events-none transition-all duration-200 flex items-center gap-1"
                  style={{ opacity: active ? 1 : 0, transform: active ? "scale(1)" : "scale(0.8)" }}
                >
                  {label}
                  {key === "archive" && archivedLeads.length > 0 && (
                    <span className="text-xs opacity-70">({archivedLeads.length})</span>
                  )}
                </span>
                {/* Hover label (visible on hover when inactive) */}
                {!active && (
                  <span className="absolute z-10 text-white text-sm font-bold tracking-wide pointer-events-none flex items-center gap-1 opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200">
                    {label}
                    {key === "archive" && archivedLeads.length > 0 && (
                      <span className="text-xs opacity-70">({archivedLeads.length})</span>
                    )}
                  </span>
                )}
              </motion.li>
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
