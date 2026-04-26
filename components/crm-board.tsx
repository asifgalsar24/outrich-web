"use client";

import { useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import type { Lead, CrmStatus } from "@/lib/types";
import LeadPanel, { ScoreBadge, AdTypeBadge, STAGES } from "@/components/lead-panel";

const F = "var(--font-osh), sans-serif";

// ── Kanban Card ───────────────────────────────────────────────────────────────

function KanbanCard({
  lead,
  stage,
  onOpenPanel,
  onStatusChange,
  onDragStart,
}: {
  lead: Lead;
  stage: typeof STAGES[number];
  onOpenPanel: (lead: Lead) => void;
  onStatusChange: (id: string, status: CrmStatus) => void;
  onDragStart: (id: string) => void;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.18 }}
      draggable
      onDragStart={(e) => {
        onDragStart(lead.id);
        (e.target as HTMLElement).style.opacity = "0.5";
      }}
      onDragEnd={(e) => {
        (e.target as HTMLElement).style.opacity = "1";
      }}
      className="rounded-2xl p-4 flex flex-col gap-3 cursor-grab active:cursor-grabbing select-none"
      style={{
        background: "#111",
        border: "1px solid rgba(255,255,255,0.07)",
        fontFamily: F,
        borderRight: `3px solid ${stage.borderActive}`,
      }}
      dir="rtl"
    >
      {/* Company name */}
      <p style={{ fontWeight: 800, fontSize: "0.92rem", color: "#fff", lineHeight: 1.25 }}>
        {lead.company_name}
      </p>

      {/* Score + ad type */}
      <div className="flex items-center gap-2 flex-wrap">
        <ScoreBadge score={lead.business_score} tier={lead.lead_quality} />
        {lead.ad_type && <AdTypeBadge type={lead.ad_type} />}
      </div>

      {/* Niche + ad count */}
      {(lead.niche || lead.active_ads_count != null) && (
        <div className="flex items-center gap-1.5" style={{ fontSize: "0.77rem", color: "rgba(255,255,255,0.38)" }}>
          {lead.niche && <span>{lead.niche}</span>}
          {lead.active_ads_count != null && (
            <span>· 📢 {lead.active_ads_count}</span>
          )}
          {lead.page_followers != null && (
            <span>· 👥 {lead.page_followers >= 1000 ? `${(lead.page_followers / 1000).toFixed(1)}K` : lead.page_followers}</span>
          )}
        </div>
      )}

      {/* Email */}
      {lead.email_address && (
        <p style={{ fontSize: "0.74rem", color: "rgba(255,255,255,0.28)", fontWeight: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          ✉ {lead.email_address}
        </p>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1 border-t border-white/[0.06]" style={{ position: "relative" }}>
        <button
          onClick={() => onOpenPanel(lead)}
          className="rounded-lg px-2.5 py-1 transition-colors hover:bg-white/[0.08]"
          style={{ fontSize: "0.74rem", fontWeight: 600, fontFamily: F, color: "rgba(255,255,255,0.5)", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          ✉️ מייל
        </button>

        <button
          onClick={() => setPickerOpen((v) => !v)}
          className="rounded-lg px-2.5 py-1 transition-colors hover:bg-white/[0.08]"
          style={{ fontSize: "0.74rem", fontWeight: 600, fontFamily: F, color: stage.color, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          ↺ שנה שלב
        </button>

        {/* Stage picker dropdown */}
        <AnimatePresence>
          {pickerOpen && (
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.97 }}
              transition={{ duration: 0.12 }}
              className="absolute bottom-full mb-2 right-0 flex flex-col gap-1 p-2 rounded-xl z-20"
              style={{ background: "#0d0d0d", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 12px 40px rgba(0,0,0,0.7)", minWidth: "150px" }}
            >
              {STAGES.filter((s) => s.key !== lead.crm_status).map((s) => (
                <button
                  key={s.key}
                  onClick={() => { onStatusChange(lead.id, s.key); setPickerOpen(false); }}
                  className="rounded-lg px-3 py-1.5 text-right transition-colors hover:bg-white/[0.07]"
                  style={{ fontSize: "0.8rem", fontWeight: 600, fontFamily: F, color: s.color }}
                >
                  {s.emoji} {s.label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ── Kanban Column ─────────────────────────────────────────────────────────────

function KanbanColumn({
  stage,
  leads,
  onOpenPanel,
  onStatusChange,
  onDragStart,
  onDrop,
}: {
  stage: typeof STAGES[number];
  leads: Lead[];
  onOpenPanel: (lead: Lead) => void;
  onStatusChange: (id: string, status: CrmStatus) => void;
  onDragStart: (id: string) => void;
  onDrop: (status: CrmStatus) => void;
}) {
  const [dragOver, setDragOver] = useState(false);

  return (
    <div
      className="flex flex-col shrink-0"
      style={{ width: "260px" }}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={() => { setDragOver(false); onDrop(stage.key); }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-2.5 rounded-xl mb-3"
        style={{
          background: dragOver ? stage.activeBg : stage.headerBg,
          border: `1px solid ${dragOver ? stage.borderActive : "rgba(255,255,255,0.07)"}`,
          transition: "background 0.15s, border-color 0.15s",
        }}
      >
        <div className="flex items-center gap-2">
          <span style={{ fontSize: "1rem" }}>{stage.emoji}</span>
          <span style={{ fontWeight: 700, fontSize: "0.88rem", color: stage.color, fontFamily: F }}>{stage.label}</span>
        </div>
        <span
          className="rounded-full px-2 py-0.5"
          style={{ fontWeight: 700, fontSize: "0.72rem", background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.4)", fontFamily: F }}
        >
          {leads.length}
        </span>
      </div>

      {/* Cards */}
      <div
        className="flex flex-col gap-3 flex-1 overflow-y-auto rounded-xl p-1 transition-colors"
        style={{ background: dragOver ? "rgba(255,255,255,0.015)" : "transparent", minHeight: "80px" }}
      >
        <AnimatePresence>
          {leads.map((lead) => (
            <KanbanCard
              key={lead.id}
              lead={lead}
              stage={stage}
              onOpenPanel={onOpenPanel}
              onStatusChange={onStatusChange}
              onDragStart={onDragStart}
            />
          ))}
        </AnimatePresence>

        {leads.length === 0 && (
          <div
            className="flex-1 rounded-xl flex items-center justify-center"
            style={{
              minHeight: "80px",
              border: `1px dashed ${dragOver ? stage.borderActive : "rgba(255,255,255,0.06)"}`,
              color: "rgba(255,255,255,0.18)",
              fontSize: "0.78rem",
              fontFamily: F,
              transition: "border-color 0.15s",
            }}
          >
            {dragOver ? "שחרר כאן" : "ריק"}
          </div>
        )}
      </div>
    </div>
  );
}

// ── CRM Board ─────────────────────────────────────────────────────────────────

export default function CrmBoard({ leads: initialLeads }: { leads: Lead[] }) {
  const [leads, setLeads]       = useState<Lead[]>(initialLeads);
  const [selected, setSelected] = useState<Lead | null>(null);
  const dragIdRef               = useRef<string | null>(null);
  const router                  = useRouter();

  const columns = useMemo(
    () => STAGES.map((s) => ({ stage: s, leads: leads.filter((l) => l.crm_status === s.key) })),
    [leads]
  );

  async function handleStatusChange(id: string, status: CrmStatus) {
    const prev = leads.find((l) => l.id === id)?.crm_status;
    setLeads((ls) => ls.map((l) => (l.id === id ? { ...l, crm_status: status } : l)));
    setSelected((s) => (s?.id === id ? { ...s, crm_status: status } : s));

    try {
      const res = await fetch(`/api/leads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ crm_status: status }),
      });
      if (res.ok) router.refresh();
      else throw new Error("patch failed");
    } catch {
      if (prev) setLeads((ls) => ls.map((l) => (l.id === id ? { ...l, crm_status: prev } : l)));
    }
  }

  function handleDrop(status: CrmStatus) {
    if (!dragIdRef.current) return;
    handleStatusChange(dragIdRef.current, status);
    dragIdRef.current = null;
  }

  return (
    <div className="relative flex flex-col h-full" style={{ fontFamily: F }} dir="rtl">
      {/* Overlay */}
      <AnimatePresence>
        {selected && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
            className="fixed inset-0 z-30 bg-black/40"
          />
        )}
      </AnimatePresence>

      {/* Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden" style={{ scrollbarWidth: "thin" }}>
        <div className="flex gap-4 h-full px-6 py-5" style={{ minWidth: "max-content" }}>
          {columns.map(({ stage, leads: stageleads }) => (
            <div key={stage.key} className="flex flex-col" style={{ height: "100%" }}>
              <KanbanColumn
                stage={stage}
                leads={stageleads}
                onOpenPanel={setSelected}
                onStatusChange={handleStatusChange}
                onDragStart={(id) => { dragIdRef.current = id; }}
                onDrop={handleDrop}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Lead panel */}
      <AnimatePresence>
        {selected && (
          <LeadPanel
            lead={selected}
            onClose={() => setSelected(null)}
            onStatusChange={handleStatusChange}
            onEmailGenerated={(id, draft) => {
              setLeads((ls) => ls.map((l) => (l.id === id ? { ...l, hebrew_email_draft: draft } : l)));
              setSelected((s) => (s?.id === id ? { ...s, hebrew_email_draft: draft } : s));
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
