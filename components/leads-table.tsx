"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

const F = "var(--font-osh), sans-serif";

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
};

type SortKey = "company_name" | "business_score" | "ad_type" | "niche" | "created_at";
type SortDir = "asc" | "desc";

interface Filters {
  tier: "all" | "hot" | "warm" | "cold";
  adType: string[];
  hasEmail: "all" | "yes" | "no";
  lemlist: "all" | "sent" | "pending";
  minScore: number;
}

const DEFAULT_FILTERS: Filters = {
  tier: "all",
  adType: [],
  hasEmail: "all",
  lemlist: "all",
  minScore: 0,
};

// ── Badges ────────────────────────────────────────────────────────────────────

function ScoreBadge({ score, tier }: { score: number | null; tier: string | null }) {
  const colors: Record<string, { bg: string; text: string; border: string }> = {
    hot:  { bg: "rgba(251,146,60,0.12)",  text: "rgb(251,146,60)",  border: "rgba(251,146,60,0.3)"  },
    warm: { bg: "rgba(250,204,21,0.1)",   text: "rgb(250,204,21)",  border: "rgba(250,204,21,0.3)"  },
    cold: { bg: "rgba(99,102,241,0.1)",   text: "rgb(129,140,248)", border: "rgba(99,102,241,0.25)" },
  };
  const c = colors[tier ?? "cold"] ?? colors.cold;
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5"
      style={{ background: c.bg, border: `1px solid ${c.border}`, fontWeight: 700, fontSize: "0.78rem", color: c.text }}
    >
      {tier === "hot" ? "🔥" : tier === "warm" ? "🌡" : "❄️"}
      {score ?? "—"}/10
    </span>
  );
}

function AdTypeBadge({ type }: { type: string | null }) {
  const map: Record<string, string> = { video: "וידאו", carousel: "קרוסל", image: "תמונה" };
  return (
    <span
      className="rounded-md px-2 py-0.5"
      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", fontWeight: 400, fontSize: "0.78rem", color: "rgba(255,255,255,0.5)" }}
    >
      {map[type ?? ""] ?? type ?? "—"}
    </span>
  );
}

function LemlistBadge({ status }: { status: string | null }) {
  if (status === "sent")
    return <span style={{ fontWeight: 400, fontSize: "0.8rem", color: "rgb(74,222,128)" }}>✓ נשלח</span>;
  return <span style={{ fontWeight: 300, fontSize: "0.8rem", color: "rgba(255,255,255,0.2)" }}>ממתין</span>;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }
  return (
    <button
      onClick={copy}
      className="rounded-lg px-3 py-1.5 transition-colors"
      style={{
        fontFamily: F, fontWeight: 400, fontSize: "0.78rem",
        background: copied ? "rgba(74,222,128,0.1)" : "rgba(255,255,255,0.06)",
        border: copied ? "1px solid rgba(74,222,128,0.3)" : "1px solid rgba(255,255,255,0.1)",
        color: copied ? "rgb(74,222,128)" : "rgba(255,255,255,0.5)",
      }}
    >
      {copied ? "✓ הועתק" : "העתק"}
    </button>
  );
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
}: {
  filters: Filters;
  onChange: (f: Filters) => void;
  onClose: () => void;
  adTypes: string[];
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  const adTypeLabels: Record<string, string> = { video: "וידאו", carousel: "קרוסל", image: "תמונה" };

  function toggleAdType(t: string) {
    const next = filters.adType.includes(t)
      ? filters.adType.filter((x) => x !== t)
      : [...filters.adType, t];
    onChange({ ...filters, adType: next });
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

// ── Detail Panel ──────────────────────────────────────────────────────────────

function LeadPanel({ lead, onClose }: { lead: Lead; onClose: () => void }) {
  const [emailText, setEmailText]   = useState(lead.hebrew_email_draft ?? "");
  const [saving, setSaving]         = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "error">("idle");
  const isDirty = emailText !== (lead.hebrew_email_draft ?? "");

  async function handleSaveEmail() {
    setSaving(true);
    try {
      const res = await fetch(`/api/leads/${lead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hebrew_email_draft: emailText }),
      });
      setSaveStatus(res.ok ? "saved" : "error");
    } catch {
      setSaveStatus("error");
    }
    setSaving(false);
    setTimeout(() => setSaveStatus("idle"), 2500);
  }

  return (
    <motion.div
      key="panel"
      initial={{ x: "-100%", opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: "-100%", opacity: 0 }}
      transition={{ type: "spring", damping: 28, stiffness: 280 }}
      className="fixed top-0 right-56 bottom-0 z-40 flex flex-col overflow-hidden"
      style={{ width: "min(520px, 42vw)", background: "#0d0d0d", borderLeft: "1px solid rgba(255,255,255,0.07)" }}
      dir="rtl"
    >
      {/* Header */}
      <div className="flex items-start justify-between px-7 py-6 border-b border-white/[0.07]">
        <div className="flex flex-col gap-2">
          <p style={{ fontWeight: 800, fontSize: "1.15rem", color: "#fff", lineHeight: 1.2 }}>
            {lead.company_name}
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            <ScoreBadge score={lead.business_score} tier={lead.lead_quality} />
            {lead.ad_type && <AdTypeBadge type={lead.ad_type} />}
          </div>
          {/* Stats row */}
          <div className="flex items-center gap-4 mt-1" style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.3)" }}>
            {lead.active_ads_count != null && (
              <span>📢 {lead.active_ads_count} מודעות פעילות</span>
            )}
            {lead.page_followers != null && (
              <span>👥 {lead.page_followers.toLocaleString()} עוקבים</span>
            )}
            <span>📅 {new Date(lead.created_at).toLocaleDateString("he-IL")}</span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-1.5 hover:bg-white/[0.07] transition-colors mt-0.5"
          style={{ color: "rgba(255,255,255,0.4)", fontSize: "1.1rem", lineHeight: 1 }}
        >
          ✕
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-7 py-6 flex flex-col gap-7">

        {/* Links */}
        <div className="flex flex-wrap gap-2">
          {lead.website_url && (
            <a href={lead.website_url} target="_blank" rel="noopener noreferrer"
              className="rounded-lg px-3 py-1.5 transition-colors hover:bg-white/[0.08]"
              style={{ fontWeight: 400, fontSize: "0.8rem", color: "rgb(129,140,248)", background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)" }}>
              🌐 אתר
            </a>
          )}
          {lead.facebook_page && (
            <a href={lead.facebook_page} target="_blank" rel="noopener noreferrer"
              className="rounded-lg px-3 py-1.5 transition-colors hover:bg-white/[0.08]"
              style={{ fontWeight: 400, fontSize: "0.8rem", color: "rgb(129,140,248)", background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)" }}>
              📱 פייסבוק
            </a>
          )}
          {lead.ad_url && (
            <a href={lead.ad_url} target="_blank" rel="noopener noreferrer"
              className="rounded-lg px-3 py-1.5 transition-colors hover:bg-white/[0.08]"
              style={{ fontWeight: 400, fontSize: "0.8rem", color: "rgb(129,140,248)", background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)" }}>
              📢 מודעה
            </a>
          )}
        </div>

        {/* Claude analysis */}
        {(lead.score_reasoning || lead.suggested_service || lead.outreach_angle) && (
          <section>
            <p style={{ fontWeight: 700, fontSize: "0.78rem", color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em" }} className="uppercase mb-3">
              ניתוח Claude
            </p>
            <div className="flex flex-col gap-3">
              {lead.score_reasoning && (
                <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <p style={{ fontWeight: 700, fontSize: "0.78rem", color: "rgba(255,255,255,0.35)", marginBottom: "0.4rem" }}>מה גרם לציון</p>
                  <p style={{ fontWeight: 300, fontSize: "0.88rem", color: "rgba(255,255,255,0.65)", lineHeight: 1.65 }}>{lead.score_reasoning}</p>
                </div>
              )}
              {lead.suggested_service && (
                <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <p style={{ fontWeight: 700, fontSize: "0.78rem", color: "rgba(255,255,255,0.35)", marginBottom: "0.4rem" }}>שירות מומלץ</p>
                  <p style={{ fontWeight: 300, fontSize: "0.88rem", color: "rgba(255,255,255,0.65)", lineHeight: 1.65 }}>{lead.suggested_service}</p>
                </div>
              )}
              {lead.outreach_angle && (
                <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <p style={{ fontWeight: 700, fontSize: "0.78rem", color: "rgba(255,255,255,0.35)", marginBottom: "0.4rem" }}>זווית אאוטריץ׳</p>
                  <p style={{ fontWeight: 300, fontSize: "0.88rem", color: "rgba(255,255,255,0.65)", lineHeight: 1.65 }}>{lead.outreach_angle}</p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Perplexity research */}
        {lead.perplexity_research && (
          <section>
            <p style={{ fontWeight: 700, fontSize: "0.78rem", color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em" }} className="uppercase mb-3">
              מחקר Perplexity
            </p>
            <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <p style={{ fontWeight: 300, fontSize: "0.88rem", color: "rgba(255,255,255,0.6)", lineHeight: 1.75, whiteSpace: "pre-wrap" }}>
                {lead.perplexity_research}
              </p>
            </div>
          </section>
        )}

        {/* Editable email draft */}
        {(
          <section>
            <div className="flex items-center justify-between mb-3">
              <p style={{ fontWeight: 700, fontSize: "0.78rem", color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em" }} className="uppercase">
                טיוטת מייל
              </p>
              <div className="flex items-center gap-2">
                {lead.email_approved && !isDirty && (
                  <span style={{ fontWeight: 400, fontSize: "0.75rem", color: "rgb(74,222,128)" }}>✓ אושר</span>
                )}
                {isDirty && (
                  <span style={{ fontWeight: 400, fontSize: "0.75rem", color: "rgb(250,204,21)" }}>● לא נשמר</span>
                )}
                <CopyButton text={emailText} />
              </div>
            </div>

            {/* Editable textarea */}
            <textarea
              value={emailText}
              onChange={(e) => setEmailText(e.target.value)}
              rows={10}
              className="w-full rounded-xl p-5 outline-none resize-none transition-all"
              style={{
                fontFamily: F, fontWeight: 400, fontSize: "0.9rem",
                color: "rgba(255,255,255,0.75)", lineHeight: 1.8,
                background: "rgba(99,102,241,0.05)",
                border: isDirty ? "1px solid rgba(99,102,241,0.4)" : "1px solid rgba(99,102,241,0.15)",
              }}
              dir="rtl"
            />

            {/* Save button */}
            <div className="flex justify-end mt-2">
              <button
                onClick={handleSaveEmail}
                disabled={!isDirty || saving}
                className="rounded-xl px-4 py-2 transition-all disabled:opacity-40"
                style={{
                  fontFamily: F, fontWeight: 700, fontSize: "0.82rem",
                  background: saveStatus === "saved" ? "rgba(74,222,128,0.15)"
                    : saveStatus === "error" ? "rgba(239,68,68,0.15)"
                    : "rgba(99,102,241,0.2)",
                  border: saveStatus === "saved" ? "1px solid rgba(74,222,128,0.3)"
                    : saveStatus === "error" ? "1px solid rgba(239,68,68,0.3)"
                    : "1px solid rgba(99,102,241,0.35)",
                  color: saveStatus === "saved" ? "rgb(74,222,128)"
                    : saveStatus === "error" ? "rgb(248,113,113)"
                    : "rgb(129,140,248)",
                }}
              >
                {saving ? "שומר..." : saveStatus === "saved" ? "✓ נשמר" : saveStatus === "error" ? "שגיאה" : "שמור שינויים"}
              </button>
            </div>
          </section>
        )}

        {!lead.perplexity_research && !lead.hebrew_email_draft && (
          <p style={{ fontWeight: 300, fontSize: "0.85rem", color: "rgba(255,255,255,0.25)", textAlign: "center", paddingTop: "2rem" }}>
            הליד הזה עדיין לא עבר מחקר וכתיבת מייל.
            <br />
            ציון נדרש: 7+ להפעלת הפייפליין.
          </p>
        )}
      </div>
    </motion.div>
  );
}

// ── Main Table ────────────────────────────────────────────────────────────────

const COLUMNS: { key: SortKey; label: string }[] = [
  { key: "company_name", label: "שם עסק" },
  { key: "business_score", label: "ציון" },
  { key: "ad_type", label: "סוג מודעה" },
  { key: "niche", label: "ניישה" },
  { key: "created_at", label: "תאריך" },
];

export default function LeadsTable({ leads: initialLeads }: { leads: Lead[] }) {
  const [leads, setLeads]           = useState<Lead[]>(initialLeads);
  const [selected, setSelected]     = useState<Lead | null>(null);
  const [search, setSearch]         = useState("");
  const [filters, setFilters]       = useState<Filters>(DEFAULT_FILTERS);
  const [filterOpen, setFilterOpen] = useState(false);
  const [sort, setSort]             = useState<{ key: SortKey; dir: SortDir }>({ key: "business_score", dir: "desc" });
  const [confirmId, setConfirmId]   = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();

  const adTypes = ["image", "video", "carousel"];

  const activeFilterCount = useMemo(() => {
    let n = 0;
    if (filters.tier !== "all") n++;
    if (filters.adType.length) n++;
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
          {/* Search */}
          <input
            type="text"
            placeholder="חיפוש לפי שם עסק..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-xl border border-white/[0.1] bg-white/[0.04] px-4 py-2 text-white placeholder:text-white/20 outline-none focus:border-indigo-500/50 transition-all"
            style={{ fontFamily: F, fontWeight: 300, fontSize: "0.88rem", width: "220px" }}
            dir="rtl"
          />

          {/* Filter button */}
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
                />
              )}
            </AnimatePresence>
          </div>

          {/* Result count */}
          <span style={{ fontWeight: 300, fontSize: "0.8rem", color: "rgba(255,255,255,0.25)", marginRight: "auto" }}>
            {processed.length} / {leads.length} לידים
          </span>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full border-collapse" dir="rtl">
            <thead>
              <tr className="border-b border-white/[0.06]">
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
                    style={{ background: isSelected ? "rgba(99,102,241,0.08)" : "transparent" }}
                    onMouseEnter={(e) => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)"; }}
                    onMouseLeave={(e) => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                  >
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

      {/* Slide-in panel */}
      <AnimatePresence>
        {selected && <LeadPanel lead={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </div>
  );
}
