"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Search, SlidersHorizontal, ChevronDown, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Lead } from "@/lib/types";
import LeadPanel, { ScoreBadge, AdTypeBadge } from "@/components/lead-panel";

export type { Lead };

const F = "var(--font-osh), sans-serif";

type SortKey = "company_name" | "business_score" | "created_at";
type SortDir = "asc" | "desc";

interface Filters {
  tier: "all" | "hot" | "warm" | "cold";
  adType: string[];
  niche: string[];
  hasEmail: "all" | "yes" | "no";
  lemlist: "all" | "sent" | "pending";
  minScore: number;
}

const DEFAULT_FILTERS: Filters = { tier: "all", adType: [], niche: [], hasEmail: "all", lemlist: "all", minScore: 0 };

// ── Filter panel ──────────────────────────────────────────────────────────────

function FilterPanel({
  filters, onChange, niches,
}: {
  filters: Filters;
  onChange: (f: Filters) => void;
  niches: string[];
}) {
  const hasActive = filters.tier !== "all" || filters.adType.length > 0 || filters.niche.length > 0
    || filters.hasEmail !== "all" || filters.lemlist !== "all" || filters.minScore > 0;

  const tierLabels = { all: "הכל", hot: "🔥 חם", warm: "🌡 ביניים", cold: "❄️ קר" };
  const adTypeLabels: Record<string, string> = { video: "וידאו", carousel: "קרוסלה", image: "תמונה" };

  function toggle<T>(arr: T[], val: T) {
    return arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val];
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ delay: 0.04 }}
      className="flex h-full flex-col space-y-5 overflow-y-auto bg-card p-5 border-l border-border"
      dir="rtl" style={{ fontFamily: F }}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-foreground">סינון</h3>
        {hasActive && (
          <Button variant="ghost" size="sm" onClick={() => onChange(DEFAULT_FILTERS)} className="h-6 text-xs text-muted-foreground">
            נקה
          </Button>
        )}
      </div>

      {/* Tier */}
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">דרגה</p>
        {(["all", "hot", "warm", "cold"] as const).map((t) => {
          const sel = filters.tier === t;
          return (
            <motion.button key={t} whileHover={{ x: 2 }} onClick={() => onChange({ ...filters, tier: t })}
              className={`flex w-full items-center justify-between gap-2 border rounded-md px-3 py-2 text-sm transition-colors ${sel ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/40 hover:bg-white/[0.03]"}`}>
              <span>{tierLabels[t]}</span>
              {sel && <Check className="h-3.5 w-3.5" />}
            </motion.button>
          );
        })}
      </div>

      {/* Min score */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">ציון מינימלי</p>
          <span className="text-xs font-bold text-primary">{filters.minScore}+</span>
        </div>
        <input type="range" min={0} max={10} step={1} value={filters.minScore}
          onChange={(e) => onChange({ ...filters, minScore: Number(e.target.value) })}
          className="w-full accent-indigo-500" />
        <div className="flex justify-between text-muted-foreground" style={{ fontSize: "0.68rem" }}>
          <span>0</span><span>5</span><span>10</span>
        </div>
      </div>

      {/* Ad type */}
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">סוג מודעה</p>
        {["video", "carousel", "image"].map((t) => {
          const sel = filters.adType.includes(t);
          return (
            <motion.button key={t} whileHover={{ x: 2 }} onClick={() => onChange({ ...filters, adType: toggle(filters.adType, t) })}
              className={`flex w-full items-center justify-between gap-2 border rounded-md px-3 py-2 text-sm transition-colors ${sel ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/40 hover:bg-white/[0.03]"}`}>
              <span>{adTypeLabels[t]}</span>
              {sel && <Check className="h-3.5 w-3.5" />}
            </motion.button>
          );
        })}
      </div>

      {/* Niche */}
      {niches.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">נישה</p>
          {niches.map((n) => {
            const sel = filters.niche.includes(n);
            return (
              <motion.button key={n} whileHover={{ x: 2 }} onClick={() => onChange({ ...filters, niche: toggle(filters.niche, n) })}
                className={`flex w-full items-center justify-between gap-2 border rounded-md px-3 py-2 text-sm transition-colors ${sel ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/40 hover:bg-white/[0.03]"}`}>
                <span className="truncate">{n}</span>
                {sel && <Check className="h-3.5 w-3.5 shrink-0" />}
              </motion.button>
            );
          })}
        </div>
      )}

      {/* Email */}
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">מייל</p>
        {(["all", "yes", "no"] as const).map((v) => {
          const sel = filters.hasEmail === v;
          return (
            <motion.button key={v} whileHover={{ x: 2 }} onClick={() => onChange({ ...filters, hasEmail: v })}
              className={`flex w-full items-center justify-between gap-2 border rounded-md px-3 py-2 text-sm transition-colors ${sel ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/40 hover:bg-white/[0.03]"}`}>
              <span>{v === "all" ? "הכל" : v === "yes" ? "יש מייל" : "אין מייל"}</span>
              {sel && <Check className="h-3.5 w-3.5" />}
            </motion.button>
          );
        })}
      </div>

      {/* Lemlist */}
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Lemlist</p>
        {(["all", "sent", "pending"] as const).map((v) => {
          const sel = filters.lemlist === v;
          return (
            <motion.button key={v} whileHover={{ x: 2 }} onClick={() => onChange({ ...filters, lemlist: v })}
              className={`flex w-full items-center justify-between gap-2 border rounded-md px-3 py-2 text-sm transition-colors ${sel ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/40 hover:bg-white/[0.03]"}`}>
              <span>{v === "all" ? "הכל" : v === "sent" ? "✓ נשלח" : "ממתין"}</span>
              {sel && <Check className="h-3.5 w-3.5" />}
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}

// ── Lead row ──────────────────────────────────────────────────────────────────

function LeadRow({
  lead, expanded, onToggle, onOpenPanel, checked, onCheck, onDelete, confirmId, deletingId, onConfirm, onCancelConfirm,
}: {
  lead: Lead; expanded: boolean; onToggle: () => void;
  onOpenPanel: (l: Lead) => void;
  checked: boolean; onCheck: (e: React.MouseEvent) => void;
  onDelete: (id: string) => void; confirmId: string | null; deletingId: string | null;
  onConfirm: (id: string) => void; onCancelConfirm: () => void;
}) {
  return (
    <>
      <motion.div
        onClick={onToggle}
        className="w-full px-5 py-3.5 text-right transition-colors hover:bg-white/[0.025] cursor-pointer border-b border-white/[0.04]"
        style={{ background: checked ? "rgba(99,102,241,0.06)" : expanded ? "rgba(99,102,241,0.04)" : "transparent" }}
        dir="rtl"
      >
        <div className="flex items-center gap-3">
          {/* Checkbox */}
          <span onClick={onCheck} className="shrink-0">
            <input type="checkbox" checked={checked} onChange={() => {}} className="accent-indigo-500 w-3.5 h-3.5 cursor-pointer" />
          </span>

          {/* Chevron */}
          <motion.span animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }} className="shrink-0">
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </motion.span>

          {/* Score */}
          <span className="shrink-0"><ScoreBadge score={lead.business_score} tier={lead.lead_quality} /></span>

          {/* Company name */}
          <span className="flex-1 min-w-0 font-bold text-sm text-white truncate" style={{ fontFamily: F }}>
            {lead.company_name}
          </span>

          {/* Ad type */}
          {lead.ad_type && <span className="shrink-0"><AdTypeBadge type={lead.ad_type} /></span>}

          {/* Niche */}
          <span className="shrink-0 text-xs text-muted-foreground hidden md:block" style={{ minWidth: "80px" }}>
            {lead.niche ?? "—"}
          </span>

          {/* Email */}
          <span className="shrink-0 text-xs hidden lg:block" style={{ color: lead.email_address ? "rgba(255,255,255,0.45)" : "rgba(255,255,255,0.18)", minWidth: "140px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {lead.email_address ?? "אין מייל"}
          </span>

          {/* Lemlist */}
          <span className="shrink-0 text-xs" style={{ minWidth: "60px" }}>
            {lead.lemlist_status === "sent"
              ? <span style={{ color: "rgb(74,222,128)" }}>✓ נשלח</span>
              : <span style={{ color: "rgba(255,255,255,0.2)" }}>ממתין</span>}
          </span>

          {/* Date */}
          <span className="shrink-0 font-mono text-xs text-muted-foreground hidden xl:block">
            {new Date(lead.created_at).toLocaleDateString("he-IL")}
          </span>

          {/* Delete */}
          <span className="shrink-0" onClick={(e) => e.stopPropagation()}>
            {confirmId === lead.id ? (
              <span className="flex items-center gap-1">
                <button onClick={() => onDelete(lead.id)} disabled={deletingId === lead.id}
                  className="rounded-lg px-2 py-0.5 text-xs font-bold transition-colors"
                  style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", color: "rgb(248,113,113)", fontFamily: F }}>
                  {deletingId === lead.id ? "..." : "מחק"}
                </button>
                <button onClick={onCancelConfirm}
                  className="rounded-lg px-1.5 py-0.5 text-xs transition-colors hover:bg-white/[0.06]"
                  style={{ color: "rgba(255,255,255,0.3)", fontFamily: F }}>ביטול</button>
              </span>
            ) : (
              <button onClick={(e) => { e.stopPropagation(); onConfirm(lead.id); }}
                className="rounded-lg p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/[0.06]"
                style={{ color: "rgba(255,255,255,0.25)", lineHeight: 1, fontSize: "0.85rem" }}>
                🗑
              </button>
            )}
          </span>
        </div>
      </motion.div>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="expanded"
            initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-b border-white/[0.04] bg-white/[0.015]"
            dir="rtl"
          >
            <div className="p-5 space-y-4">
              {/* Links */}
              <div className="flex flex-wrap gap-2">
                {lead.ad_url && (
                  <a href={lead.ad_url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
                    className="rounded-lg px-3 py-1.5 text-xs font-medium transition-colors hover:opacity-80"
                    style={{ color: "rgb(129,140,248)", background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)" }}>
                    📢 מודעה
                  </a>
                )}
                {lead.facebook_page && (
                  <a href={lead.facebook_page} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
                    className="rounded-lg px-3 py-1.5 text-xs font-medium transition-colors hover:opacity-80"
                    style={{ color: "rgb(129,140,248)", background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)" }}>
                    📘 פייסבוק
                  </a>
                )}
                {lead.instagram_page && (
                  <a href={lead.instagram_page} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
                    className="rounded-lg px-3 py-1.5 text-xs font-medium transition-colors hover:opacity-80"
                    style={{ color: "rgb(129,140,248)", background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)" }}>
                    📸 אינסטגרם
                  </a>
                )}
                {lead.website_url && (
                  <a href={lead.website_url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
                    className="rounded-lg px-3 py-1.5 text-xs font-medium transition-colors hover:opacity-80"
                    style={{ color: "rgb(129,140,248)", background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)" }}>
                    🌐 אתר
                  </a>
                )}
              </div>

              {/* Ad type breakdown */}
              {((lead.video_count ?? 0) > 0 || (lead.image_count ?? 0) > 0 || (lead.carousel_count ?? 0) > 0) && (
                <div className="flex gap-4 text-xs text-muted-foreground">
                  {(lead.video_count ?? 0) > 0    && <span>🎬 {lead.video_count} וידאו</span>}
                  {(lead.image_count ?? 0) > 0    && <span>🖼 {lead.image_count} סטטיות</span>}
                  {(lead.carousel_count ?? 0) > 0 && <span>📂 {lead.carousel_count} קרוסלה</span>}
                  {lead.oldest_ad_date && (
                    <span>
                      📅 ותיקה: {lead.oldest_ad_date}
                      {lead.oldest_ad_url && (
                        <a href={lead.oldest_ad_url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
                          className="mr-1.5" style={{ color: "rgb(129,140,248)" }}>← צפה</a>
                      )}
                    </span>
                  )}
                </div>
              )}

              {/* Ad copy */}
              {lead.ad_copy && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">טקסט המודעה</p>
                  <p className="rounded-lg bg-white/[0.03] border border-white/[0.05] px-3 py-2.5 text-sm text-white/60 leading-relaxed whitespace-pre-wrap line-clamp-4" style={{ fontFamily: F }}>
                    {lead.ad_copy}
                  </p>
                </div>
              )}

              {/* Research preview */}
              {lead.perplexity_research && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">מחקר</p>
                  <p className="rounded-lg bg-white/[0.03] border border-white/[0.05] px-3 py-2.5 text-sm text-white/60 leading-relaxed line-clamp-3" style={{ fontFamily: F }}>
                    {lead.perplexity_research}
                  </p>
                </div>
              )}

              {/* Open full panel */}
              <button
                onClick={(e) => { e.stopPropagation(); onOpenPanel(lead); }}
                className="rounded-xl px-4 py-2 text-sm font-bold transition-colors"
                style={{ background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)", color: "rgb(129,140,248)", fontFamily: F }}>
                ✉️ פתח פרטים מלאים / כתיבת מייל
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function LeadsTable({ leads: initialLeads, mode = "active" }: { leads: Lead[]; mode?: "active" | "archive" }) {
  const [leads, setLeads]           = useState<Lead[]>(initialLeads);
  useEffect(() => { setLeads(initialLeads); }, [initialLeads]);

  const [selected, setSelected]     = useState<Lead | null>(null);
  const [search, setSearch]         = useState("");
  const [filters, setFilters]       = useState<Filters>(DEFAULT_FILTERS);
  const [showFilters, setShowFilters] = useState(false);
  const [sort, setSort]             = useState<{ key: SortKey; dir: SortDir }>({ key: "business_score", dir: "desc" });
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [confirmId, setConfirmId]   = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  const [bulkConfirm, setBulkConfirm] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);
  const router = useRouter();

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
    return [...list].sort((a, b) => {
      const av = a[sort.key] ?? "";
      const bv = b[sort.key] ?? "";
      const cmp = typeof av === "number" && typeof bv === "number" ? av - bv : String(av).localeCompare(String(bv), "he");
      return sort.dir === "asc" ? cmp : -cmp;
    });
  }, [leads, search, filters, sort]);

  function toggleCheck(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    setBulkConfirm(false);
    setCheckedIds((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  async function handleBulkAction(action: "delete" | "archive" | "restore") {
    setBulkLoading(true);
    const ids = [...checkedIds];
    await fetch("/api/leads/bulk", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ids, action }) });
    setLeads((prev) => prev.filter((l) => !ids.includes(l.id)));
    if (selected && ids.includes(selected.id)) setSelected(null);
    setCheckedIds(new Set()); setBulkConfirm(false); setBulkLoading(false);
    router.refresh();
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    await fetch(`/api/leads/${id}`, { method: "DELETE" });
    setLeads((prev) => prev.filter((l) => l.id !== id));
    if (selected?.id === id) setSelected(null);
    setConfirmId(null); setDeletingId(null);
    router.refresh();
  }

  return (
    <div className="relative flex h-full" style={{ fontFamily: F }}>
      <AnimatePresence>
        {selected && (
          <motion.div key="overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSelected(null)} className="fixed inset-0 z-30 bg-black/40" />
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border" dir="rtl">
          <div className="relative flex-1 max-w-[280px]">
            <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="חיפוש לפי שם עסק..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pr-9 text-sm bg-white/[0.04] border-white/[0.1] focus-visible:ring-primary/30"
              dir="rtl"
            />
          </div>

          <Button
            variant={showFilters ? "default" : "outline"} size="sm"
            onClick={() => setShowFilters((v) => !v)}
            className="relative gap-1.5"
          >
            <SlidersHorizontal className="h-4 w-4" />
            סינון
            {activeFilterCount > 0 && (
              <Badge className="absolute -right-2 -top-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-destructive">
                {activeFilterCount}
              </Badge>
            )}
          </Button>

          {/* Sort */}
          <div className="flex gap-1.5 mr-auto">
            {([
              { key: "business_score" as SortKey, label: "ציון" },
              { key: "created_at" as SortKey, label: "תאריך" },
              { key: "company_name" as SortKey, label: "שם" },
            ]).map(({ key, label }) => (
              <button key={key}
                onClick={() => setSort((p) => ({ key, dir: p.key === key ? (p.dir === "asc" ? "desc" : "asc") : (key === "business_score" ? "desc" : "asc") }))}
                className="rounded-lg px-2.5 py-1 text-xs transition-all"
                style={{
                  fontWeight: sort.key === key ? 700 : 400, fontFamily: F,
                  background: sort.key === key ? "rgba(99,102,241,0.15)" : "rgba(255,255,255,0.04)",
                  border: sort.key === key ? "1px solid rgba(99,102,241,0.3)" : "1px solid rgba(255,255,255,0.08)",
                  color: sort.key === key ? "rgb(129,140,248)" : "rgba(255,255,255,0.35)",
                }}>
                {sort.key === key ? (sort.dir === "asc" ? "↑" : "↓") : "↕"} {label}
              </button>
            ))}
          </div>

          <span className="text-xs text-muted-foreground shrink-0" style={{ fontFamily: F }}>
            {processed.length} / {leads.length}
          </span>
        </div>

        {/* Rows */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="popLayout">
            {processed.length === 0 ? (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="p-16 text-center" style={{ color: "rgba(255,255,255,0.25)", fontFamily: F, fontSize: "0.88rem" }}>
                לא נמצאו לידים התואמים את הסינון
              </motion.div>
            ) : (
              processed.map((lead, i) => (
                <motion.div key={lead.id} className="group"
                  initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.18, delay: i * 0.01 }}>
                  <LeadRow
                    lead={lead}
                    expanded={expandedId === lead.id}
                    onToggle={() => setExpandedId((c) => c === lead.id ? null : lead.id)}
                    onOpenPanel={setSelected}
                    checked={checkedIds.has(lead.id)}
                    onCheck={(e) => toggleCheck(lead.id, e)}
                    onDelete={handleDelete}
                    confirmId={confirmId}
                    deletingId={deletingId}
                    onConfirm={setConfirmId}
                    onCancelConfirm={() => setConfirmId(null)}
                  />
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Side filter panel */}
      <AnimatePresence initial={false}>
        {showFilters && (
          <motion.div key="filters"
            initial={{ width: 0, opacity: 0 }} animate={{ width: 260, opacity: 1 }} exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.22 }} className="overflow-hidden shrink-0">
            <FilterPanel filters={filters} onChange={setFilters} niches={niches} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bulk bar */}
      <AnimatePresence>
        {checkedIds.size > 0 && (
          <motion.div
            initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", damping: 26, stiffness: 300 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl"
            style={{ background: "#111", border: "1px solid rgba(255,255,255,0.12)", boxShadow: "0 16px 48px rgba(0,0,0,0.7)", fontFamily: F }}
            dir="rtl"
          >
            <span style={{ fontWeight: 700, fontSize: "0.85rem", color: "rgba(255,255,255,0.7)" }}>{checkedIds.size} נבחרו</span>
            <div style={{ width: "1px", height: "20px", background: "rgba(255,255,255,0.1)" }} />
            <button onClick={() => handleBulkAction(mode === "archive" ? "restore" : "archive")} disabled={bulkLoading}
              className="rounded-xl px-4 py-1.5 transition-all disabled:opacity-40"
              style={{ fontWeight: 600, fontSize: "0.82rem", background: mode === "archive" ? "rgba(74,222,128,0.1)" : "rgba(250,204,21,0.1)", border: mode === "archive" ? "1px solid rgba(74,222,128,0.25)" : "1px solid rgba(250,204,21,0.25)", color: mode === "archive" ? "rgb(74,222,128)" : "rgb(250,204,21)" }}>
              {bulkLoading ? "..." : mode === "archive" ? "↩️ שחזר" : "📦 ארכיון"}
            </button>
            {!bulkConfirm ? (
              <button onClick={() => setBulkConfirm(true)} disabled={bulkLoading}
                className="rounded-xl px-4 py-1.5 transition-all disabled:opacity-40"
                style={{ fontWeight: 600, fontSize: "0.82rem", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "rgb(248,113,113)" }}>
                🗑 מחק
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.5)" }}>בטוח?</span>
                <button onClick={() => handleBulkAction("delete")} disabled={bulkLoading}
                  className="rounded-xl px-3 py-1.5 transition-all disabled:opacity-40"
                  style={{ fontWeight: 700, fontSize: "0.82rem", background: "rgba(239,68,68,0.2)", border: "1px solid rgba(239,68,68,0.4)", color: "rgb(248,113,113)" }}>
                  {bulkLoading ? "..." : "כן, מחק"}
                </button>
                <button onClick={() => setBulkConfirm(false)}
                  className="rounded-xl px-3 py-1.5 transition-all hover:bg-white/[0.06]"
                  style={{ fontWeight: 400, fontSize: "0.82rem", color: "rgba(255,255,255,0.35)" }}>
                  ביטול
                </button>
              </div>
            )}
            <button onClick={() => { setCheckedIds(new Set()); setBulkConfirm(false); }}
              className="rounded-lg p-1 hover:bg-white/[0.07] transition-colors"
              style={{ color: "rgba(255,255,255,0.3)", lineHeight: 1 }}>✕</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lead panel */}
      <AnimatePresence>
        {selected && (
          <LeadPanel lead={selected} onClose={() => setSelected(null)}
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
