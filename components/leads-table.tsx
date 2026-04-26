"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import type { Lead } from "@/lib/types";
import LeadPanel, { ScoreBadge, AdTypeBadge } from "@/components/lead-panel";

const F = "var(--font-osh), sans-serif";

export type { Lead };

type SortKey = "company_name" | "business_score" | "ad_type" | "niche" | "created_at";
type SortDir = "asc" | "desc";

interface Filters {
  tier: "all" | "hot" | "warm" | "cold";
  adType: string[];
  niche: string[];
  hasEmail: "all" | "yes" | "no";
  lemlist: "all" | "sent" | "pending";
  minScore: number;
}

const DEFAULT_FILTERS: Filters = {
  tier: "all",
  adType: [],
  niche: [],
  hasEmail: "all",
  lemlist: "all",
  minScore: 0,
};

// ── Badges ────────────────────────────────────────────────────────────────────

function LemlistBadge({ status }: { status: string | null }) {
  if (status === "sent")
    return <span style={{ fontWeight: 400, fontSize: "0.8rem", color: "rgb(74,222,128)" }}>✓ נשלח</span>;
  return <span style={{ fontWeight: 300, fontSize: "0.8rem", color: "rgba(255,255,255,0.2)" }}>ממתין</span>;
}

// ── Sort icon ─────────────────────────────────────────────────────────────────

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  return (
    <span style={{ fontSize: "0.65rem", color: active ? "rgb(129,140,248)" : "rgba(255,255,255,0.2)", marginRight: "4px" }}>
      {active ? (dir === "asc" ? "↑" : "↓") : "↕"}
    </span>
  );
}

// ── Filter Panel ──────────────────────────────────────────────────────────────

function FilterPanel({
  filters,
  onChange,
  onClose,
  adTypes,
  niches,
}: {
  filters: Filters;
  onChange: (f: Filters) => void;
  onClose: () => void;
  adTypes: string[];
  niches: string[];
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  const adTypeLabels: Record<string, string> = { video: "וידאו", carousel: "קרוסלה", image: "תמונה" };

  function toggleAdType(t: string) {
    const next = filters.adType.includes(t) ? filters.adType.filter((x) => x !== t) : [...filters.adType, t];
    onChange({ ...filters, adType: next });
  }

  function toggleNiche(n: string) {
    const next = filters.niche.includes(n) ? filters.niche.filter((x) => x !== n) : [...filters.niche, n];
    onChange({ ...filters, niche: next });
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: -6, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.98 }}
      transition={{ duration: 0.15 }}
      className="absolute top-full mt-2 z-50 flex flex-col gap-5 p-5"
      style={{
        right: 0,
        width: "300px",
        background: "#111",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "1rem",
        fontFamily: F,
        boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
      }}
      dir="rtl"
    >
      <p style={{ fontWeight: 700, fontSize: "0.8rem", color: "rgba(255,255,255,0.5)", letterSpacing: "0.08em" }} className="uppercase">
        סינון מתקדם
      </p>

      {/* Tier */}
      <div>
        <p style={{ fontWeight: 600, fontSize: "0.75rem", color: "rgba(255,255,255,0.35)", marginBottom: "0.5rem" }}>דרגה</p>
        <div className="flex gap-1.5 flex-wrap">
          {(["all", "hot", "warm", "cold"] as const).map((t) => (
            <button
              key={t}
              onClick={() => onChange({ ...filters, tier: t })}
              className="rounded-lg px-3 py-1 transition-all"
              style={{
                fontWeight: filters.tier === t ? 700 : 400, fontSize: "0.8rem",
                background: filters.tier === t ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.04)",
                border: filters.tier === t ? "1px solid rgba(99,102,241,0.4)" : "1px solid rgba(255,255,255,0.08)",
                color: filters.tier === t ? "rgb(129,140,248)" : "rgba(255,255,255,0.4)",
              }}
            >
              {t === "all" ? "הכל" : t === "hot" ? "🔥 חם" : t === "warm" ? "🌡 ביניים" : "❄️ קר"}
            </button>
          ))}
        </div>
      </div>

      {/* Min score */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p style={{ fontWeight: 600, fontSize: "0.75rem", color: "rgba(255,255,255,0.35)" }}>ציון מינימלי</p>
          <span style={{ fontWeight: 700, fontSize: "0.85rem", color: "rgb(129,140,248)" }}>{filters.minScore}+</span>
        </div>
        <input
          type="range" min={0} max={10} step={1}
          value={filters.minScore}
          onChange={(e) => onChange({ ...filters, minScore: Number(e.target.value) })}
          className="w-full accent-indigo-500"
        />
        <div className="flex justify-between" style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.2)", marginTop: "2px" }}>
          <span>0</span><span>5</span><span>10</span>
        </div>
      </div>

      {/* Ad type */}
      {adTypes.length > 0 && (
        <div>
          <p style={{ fontWeight: 600, fontSize: "0.75rem", color: "rgba(255,255,255,0.35)", marginBottom: "0.5rem" }}>סוג מודעה</p>
          <div className="flex gap-1.5 flex-wrap">
            {adTypes.map((t) => (
              <button
                key={t}
                onClick={() => toggleAdType(t)}
                className="rounded-lg px-3 py-1 transition-all"
                style={{
                  fontWeight: filters.adType.includes(t) ? 700 : 400, fontSize: "0.8rem",
                  background: filters.adType.includes(t) ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.04)",
                  border: filters.adType.includes(t) ? "1px solid rgba(99,102,241,0.4)" : "1px solid rgba(255,255,255,0.08)",
                  color: filters.adType.includes(t) ? "rgb(129,140,248)" : "rgba(255,255,255,0.4)",
                }}
              >
                {adTypeLabels[t] ?? t}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Niche */}
      {niches.length > 0 && (
        <div>
          <p style={{ fontWeight: 600, fontSize: "0.75rem", color: "rgba(255,255,255,0.35)", marginBottom: "0.5rem" }}>נישה</p>
          <div className="flex gap-1.5 flex-wrap">
            {niches.map((n) => (
              <button
                key={n}
                onClick={() => toggleNiche(n)}
                className="rounded-lg px-3 py-1 transition-all"
                style={{
                  fontWeight: filters.niche.includes(n) ? 700 : 400, fontSize: "0.8rem",
                  background: filters.niche.includes(n) ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.04)",
                  border: filters.niche.includes(n) ? "1px solid rgba(99,102,241,0.4)" : "1px solid rgba(255,255,255,0.08)",
                  color: filters.niche.includes(n) ? "rgb(129,140,248)" : "rgba(255,255,255,0.4)",
                }}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Has email */}
      <div>
        <p style={{ fontWeight: 600, fontSize: "0.75rem", color: "rgba(255,255,255,0.35)", marginBottom: "0.5rem" }}>כתובת מייל</p>
        <div className="flex gap-1.5">
          {(["all", "yes", "no"] as const).map((v) => (
            <button
              key={v}
              onClick={() => onChange({ ...filters, hasEmail: v })}
              className="rounded-lg px-3 py-1 transition-all"
              style={{
                fontWeight: filters.hasEmail === v ? 700 : 400, fontSize: "0.8rem",
                background: filters.hasEmail === v ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.04)",
                border: filters.hasEmail === v ? "1px solid rgba(99,102,241,0.4)" : "1px solid rgba(255,255,255,0.08)",
                color: filters.hasEmail === v ? "rgb(129,140,248)" : "rgba(255,255,255,0.4)",
              }}
            >
              {v === "all" ? "הכל" : v === "yes" ? "יש מייל" : "אין מייל"}
            </button>
          ))}
        </div>
      </div>

      {/* Lemlist */}
      <div>
        <p style={{ fontWeight: 600, fontSize: "0.75rem", color: "rgba(255,255,255,0.35)", marginBottom: "0.5rem" }}>סטטוס Lemlist</p>
        <div className="flex gap-1.5">
          {(["all", "sent", "pending"] as const).map((v) => (
            <button
              key={v}
              onClick={() => onChange({ ...filters, lemlist: v })}
              className="rounded-lg px-3 py-1 transition-all"
              style={{
                fontWeight: filters.lemlist === v ? 700 : 400, fontSize: "0.8rem",
                background: filters.lemlist === v ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.04)",
                border: filters.lemlist === v ? "1px solid rgba(99,102,241,0.4)" : "1px solid rgba(255,255,255,0.08)",
                color: filters.lemlist === v ? "rgb(129,140,248)" : "rgba(255,255,255,0.4)",
              }}
            >
              {v === "all" ? "הכל" : v === "sent" ? "✓ נשלח" : "ממתין"}
            </button>
          ))}
        </div>
      </div>

      {/* Reset */}
      <button
        onClick={() => onChange(DEFAULT_FILTERS)}
        className="rounded-lg py-2 transition-colors hover:bg-white/[0.06]"
        style={{ fontWeight: 400, fontSize: "0.8rem", color: "rgba(255,255,255,0.3)", border: "1px solid rgba(255,255,255,0.08)" }}
      >
        נקה סינון
      </button>
    </motion.div>
  );
}

// ── Main Table ────────────────────────────────────────────────────────────────

const COLUMNS: { key: SortKey; label: string }[] = [
  { key: "company_name",   label: "שם עסק"    },
  { key: "business_score", label: "ציון"       },
  { key: "ad_type",        label: "סוג מודעה"  },
  { key: "niche",          label: "ניישה"      },
  { key: "created_at",     label: "תאריך"      },
];

export default function LeadsTable({ leads: initialLeads }: { leads: Lead[] }) {
  const [leads, setLeads]               = useState<Lead[]>(initialLeads);
  const [selected, setSelected]         = useState<Lead | null>(null);
  const [search, setSearch]             = useState("");
  const [filters, setFilters]           = useState<Filters>(DEFAULT_FILTERS);
  const [filterOpen, setFilterOpen]     = useState(false);
  const [sort, setSort]                 = useState<{ key: SortKey; dir: SortDir }>({ key: "business_score", dir: "desc" });
  const [confirmId, setConfirmId]       = useState<string | null>(null);
  const [deletingId, setDeletingId]     = useState<string | null>(null);
  const [checkedIds, setCheckedIds]     = useState<Set<string>>(new Set());
  const [bulkConfirm, setBulkConfirm]   = useState(false);
  const [bulkLoading, setBulkLoading]   = useState(false);
  const router = useRouter();

  const adTypes = ["image", "video", "carousel"];
  const niches = useMemo(() => [...new Set(leads.map((l) => l.niche).filter(Boolean))] as string[], [leads]);

  const activeFilterCount = useMemo(() => {
    let n = 0;
    if (filters.tier !== "all") n++;
    if (filters.adType.length) n++;
    if (filters.niche.length) n++;
    if (filters.hasEmail !== "all") n++;
    if (filters.lemlist !== "all") n++;
    if (filters.minScore > 0) n++;
    return n;
  }, [filters]);

  const processed = useMemo(() => {
    let list = leads.filter((l) => {
      if (search) {
        const q = search.toLowerCase();
        if (!l.company_name?.toLowerCase().includes(q) && !(l.niche ?? "").toLowerCase().includes(q)) return false;
      }
      if (filters.tier !== "all" && l.lead_quality !== filters.tier) return false;
      if (filters.minScore > 0 && (l.business_score ?? 0) < filters.minScore) return false;
      if (filters.adType.length && !filters.adType.includes(l.ad_type ?? "")) return false;
      if (filters.niche.length && !filters.niche.includes(l.niche ?? "")) return false;
      if (filters.hasEmail === "yes" && !l.email_address) return false;
      if (filters.hasEmail === "no" && l.email_address) return false;
      if (filters.lemlist === "sent" && l.lemlist_status !== "sent") return false;
      if (filters.lemlist === "pending" && l.lemlist_status === "sent") return false;
      return true;
    });

    list = [...list].sort((a, b) => {
      const av = a[sort.key] ?? "";
      const bv = b[sort.key] ?? "";
      const cmp = typeof av === "number" && typeof bv === "number"
        ? av - bv
        : String(av).localeCompare(String(bv), "he");
      return sort.dir === "asc" ? cmp : -cmp;
    });

    return list;
  }, [leads, search, filters, sort]);

  function toggleSort(key: SortKey) {
    setSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { key, dir: key === "business_score" ? "desc" : "asc" }
    );
  }

  function toggleCheck(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    setBulkConfirm(false);
    setCheckedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setBulkConfirm(false);
    if (checkedIds.size === processed.length) {
      setCheckedIds(new Set());
    } else {
      setCheckedIds(new Set(processed.map((l) => l.id)));
    }
  }

  async function handleBulkAction(action: "delete" | "archive") {
    setBulkLoading(true);
    const ids = [...checkedIds];
    await fetch("/api/leads/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids, action }),
    });
    setLeads((prev) => prev.filter((l) => !ids.includes(l.id)));
    if (selected && ids.includes(selected.id)) setSelected(null);
    setCheckedIds(new Set());
    setBulkConfirm(false);
    setBulkLoading(false);
    router.refresh();
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    await fetch(`/api/leads/${id}`, { method: "DELETE" });
    setLeads((prev) => prev.filter((l) => l.id !== id));
    if (selected?.id === id) setSelected(null);
    setConfirmId(null);
    setDeletingId(null);
    router.refresh();
  }

  return (
    <div className="relative flex h-full" style={{ fontFamily: F }}>
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

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-white/[0.06] flex-wrap" dir="rtl">
          <input
            type="text"
            placeholder="חיפוש לפי שם עסק..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-xl border border-white/[0.1] bg-white/[0.04] px-4 py-2 text-white placeholder:text-white/20 outline-none focus:border-indigo-500/50 transition-all"
            style={{ fontFamily: F, fontWeight: 300, fontSize: "0.88rem", width: "220px" }}
            dir="rtl"
          />

          <div className="relative">
            <button
              onClick={() => setFilterOpen((v) => !v)}
              className="flex items-center gap-2 rounded-xl px-3 py-2 transition-all"
              style={{
                fontFamily: F, fontWeight: 600, fontSize: "0.82rem",
                background: activeFilterCount > 0 ? "rgba(99,102,241,0.15)" : "rgba(255,255,255,0.04)",
                border: activeFilterCount > 0 ? "1px solid rgba(99,102,241,0.35)" : "1px solid rgba(255,255,255,0.08)",
                color: activeFilterCount > 0 ? "rgb(129,140,248)" : "rgba(255,255,255,0.45)",
              }}
            >
              ⚙ סינון
              {activeFilterCount > 0 && (
                <span className="rounded-full px-1.5 py-0.5 text-xs font-bold"
                  style={{ background: "rgba(99,102,241,0.3)", color: "rgb(129,140,248)", fontSize: "0.7rem" }}>
                  {activeFilterCount}
                </span>
              )}
              <span style={{ fontSize: "0.65rem", opacity: 0.5 }}>{filterOpen ? "▲" : "▼"}</span>
            </button>

            <AnimatePresence>
              {filterOpen && (
                <FilterPanel
                  filters={filters}
                  onChange={setFilters}
                  onClose={() => setFilterOpen(false)}
                  adTypes={adTypes}
                  niches={niches}
                />
              )}
            </AnimatePresence>
          </div>

          <span style={{ fontWeight: 300, fontSize: "0.8rem", color: "rgba(255,255,255,0.25)", marginRight: "auto" }}>
            {processed.length} / {leads.length} לידים
          </span>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full border-collapse" dir="rtl">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {/* Select-all checkbox */}
                <th className="px-4 py-3 w-8" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={processed.length > 0 && checkedIds.size === processed.length}
                    ref={(el) => { if (el) el.indeterminate = checkedIds.size > 0 && checkedIds.size < processed.length; }}
                    onChange={toggleAll}
                    className="accent-indigo-500 w-3.5 h-3.5 cursor-pointer"
                  />
                </th>
                {COLUMNS.map(({ key, label }) => (
                  <th
                    key={key}
                    onClick={() => toggleSort(key)}
                    className="px-5 py-3 text-right cursor-pointer select-none transition-colors hover:bg-white/[0.03]"
                    style={{ fontWeight: 700, fontSize: "0.72rem", color: sort.key === key ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.3)", letterSpacing: "0.08em", whiteSpace: "nowrap" }}
                  >
                    <SortIcon active={sort.key === key} dir={sort.dir} />
                    {label}
                  </th>
                ))}
                {(["מייל", "Lemlist", ""] as const).map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3 text-right"
                    style={{ fontWeight: 700, fontSize: "0.72rem", color: "rgba(255,255,255,0.3)", letterSpacing: "0.08em", whiteSpace: "nowrap" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {processed.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-16 text-center"
                    style={{ fontWeight: 300, fontSize: "0.88rem", color: "rgba(255,255,255,0.25)" }}>
                    לא נמצאו לידים התואמים את הסינון
                  </td>
                </tr>
              )}
              {processed.map((lead) => {
                const isSelected = selected?.id === lead.id;
                return (
                  <tr
                    key={lead.id}
                    onClick={() => setSelected(isSelected ? null : lead)}
                    className="group border-b border-white/[0.04] cursor-pointer transition-all duration-150"
                    style={{ background: checkedIds.has(lead.id) ? "rgba(99,102,241,0.06)" : isSelected ? "rgba(99,102,241,0.08)" : "transparent" }}
                    onMouseEnter={(e) => { if (!isSelected && !checkedIds.has(lead.id)) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)"; }}
                    onMouseLeave={(e) => { if (!isSelected && !checkedIds.has(lead.id)) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                  >
                    {/* Row checkbox */}
                    <td className="px-4 py-3.5" onClick={(e) => toggleCheck(lead.id, e)}>
                      <input
                        type="checkbox"
                        checked={checkedIds.has(lead.id)}
                        onChange={() => {}}
                        className="accent-indigo-500 w-3.5 h-3.5 cursor-pointer"
                      />
                    </td>
                    <td className="px-5 py-3.5">
                      <span style={{ fontWeight: 700, fontSize: "0.9rem", color: "#fff" }}>{lead.company_name}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <ScoreBadge score={lead.business_score} tier={lead.lead_quality} />
                    </td>
                    <td className="px-5 py-3.5">
                      <AdTypeBadge type={lead.ad_type} />
                    </td>
                    <td className="px-5 py-3.5">
                      <span style={{ fontWeight: 300, fontSize: "0.85rem", color: "rgba(255,255,255,0.45)" }}>{lead.niche ?? "—"}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span style={{ fontWeight: 300, fontSize: "0.8rem", color: "rgba(255,255,255,0.25)" }}>
                        {new Date(lead.created_at).toLocaleDateString("he-IL")}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span style={{ fontWeight: 300, fontSize: "0.82rem", color: lead.email_address ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.2)" }}>
                        {lead.email_address ?? "לא נמצא"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <LemlistBadge status={lead.lemlist_status} />
                    </td>
                    <td className="px-3 py-3.5" onClick={(e) => e.stopPropagation()}>
                      {confirmId === lead.id ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleDelete(lead.id)}
                            disabled={deletingId === lead.id}
                            className="rounded-lg px-2.5 py-1 transition-colors"
                            style={{ fontFamily: F, fontWeight: 600, fontSize: "0.75rem", background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", color: "rgb(248,113,113)" }}
                          >
                            {deletingId === lead.id ? "..." : "מחק"}
                          </button>
                          <button
                            onClick={() => setConfirmId(null)}
                            className="rounded-lg px-2 py-1 transition-colors hover:bg-white/[0.06]"
                            style={{ fontFamily: F, fontWeight: 400, fontSize: "0.75rem", color: "rgba(255,255,255,0.3)" }}
                          >
                            ביטול
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmId(lead.id)}
                          className="rounded-lg p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/[0.06]"
                          style={{ color: "rgba(255,255,255,0.25)", fontSize: "0.9rem", lineHeight: 1 }}
                          title="מחק ליד"
                        >
                          🗑
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bulk action bar */}
      <AnimatePresence>
        {checkedIds.size > 0 && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", damping: 26, stiffness: 300 }}
            className="fixed bottom-6 left-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl"
            style={{
              transform: "translateX(-50%)",
              background: "#111",
              border: "1px solid rgba(255,255,255,0.12)",
              boxShadow: "0 16px 48px rgba(0,0,0,0.7)",
              fontFamily: F,
            }}
            dir="rtl"
          >
            <span style={{ fontWeight: 700, fontSize: "0.85rem", color: "rgba(255,255,255,0.7)" }}>
              {checkedIds.size} נבחרו
            </span>
            <div style={{ width: "1px", height: "20px", background: "rgba(255,255,255,0.1)" }} />

            {/* Archive */}
            <button
              onClick={() => handleBulkAction("archive")}
              disabled={bulkLoading}
              className="rounded-xl px-4 py-1.5 transition-all disabled:opacity-40"
              style={{
                fontWeight: 600, fontSize: "0.82rem",
                background: "rgba(250,204,21,0.1)",
                border: "1px solid rgba(250,204,21,0.25)",
                color: "rgb(250,204,21)",
              }}
            >
              {bulkLoading ? "..." : "📦 ארכיון"}
            </button>

            {/* Delete with confirm */}
            {!bulkConfirm ? (
              <button
                onClick={() => setBulkConfirm(true)}
                disabled={bulkLoading}
                className="rounded-xl px-4 py-1.5 transition-all disabled:opacity-40"
                style={{
                  fontWeight: 600, fontSize: "0.82rem",
                  background: "rgba(239,68,68,0.1)",
                  border: "1px solid rgba(239,68,68,0.25)",
                  color: "rgb(248,113,113)",
                }}
              >
                🗑 מחק
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.5)" }}>בטוח?</span>
                <button
                  onClick={() => handleBulkAction("delete")}
                  disabled={bulkLoading}
                  className="rounded-xl px-3 py-1.5 transition-all disabled:opacity-40"
                  style={{
                    fontWeight: 700, fontSize: "0.82rem",
                    background: "rgba(239,68,68,0.2)",
                    border: "1px solid rgba(239,68,68,0.4)",
                    color: "rgb(248,113,113)",
                  }}
                >
                  {bulkLoading ? "..." : "כן, מחק"}
                </button>
                <button
                  onClick={() => setBulkConfirm(false)}
                  className="rounded-xl px-3 py-1.5 transition-all hover:bg-white/[0.06]"
                  style={{ fontWeight: 400, fontSize: "0.82rem", color: "rgba(255,255,255,0.35)" }}
                >
                  ביטול
                </button>
              </div>
            )}

            {/* Clear selection */}
            <button
              onClick={() => { setCheckedIds(new Set()); setBulkConfirm(false); }}
              className="rounded-lg p-1 hover:bg-white/[0.07] transition-colors"
              style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.9rem", lineHeight: 1 }}
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Slide-in panel */}
      <AnimatePresence>
        {selected && (
          <LeadPanel
            lead={selected}
            onClose={() => setSelected(null)}
            onEmailGenerated={(id, draft) => {
              setLeads((prev) => prev.map((l) => l.id === id ? { ...l, hebrew_email_draft: draft } : l));
              setSelected((prev) => prev?.id === id ? { ...prev, hebrew_email_draft: draft } : prev);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
