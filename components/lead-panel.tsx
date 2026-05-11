"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { Lead, CrmStatus } from "@/lib/types";

const F = "var(--font-osh), sans-serif";

export const STAGES: Array<{
  key: CrmStatus;
  label: string;
  emoji: string;
  color: string;
  activeBg: string;
  borderActive: string;
  headerBg: string;
}> = [
  { key: "new",       label: "חדש",    emoji: "📥", color: "rgba(255,255,255,0.6)",  activeBg: "rgba(255,255,255,0.08)",  borderActive: "rgba(255,255,255,0.2)",  headerBg: "rgba(255,255,255,0.04)"  },
  { key: "draft",     label: "טיוטה",  emoji: "✍️", color: "rgb(129,140,248)",       activeBg: "rgba(99,102,241,0.15)",   borderActive: "rgba(99,102,241,0.4)",   headerBg: "rgba(99,102,241,0.06)"   },
  { key: "sent",      label: "נשלח",   emoji: "📤", color: "rgb(250,204,21)",        activeBg: "rgba(250,204,21,0.12)",   borderActive: "rgba(250,204,21,0.35)",  headerBg: "rgba(250,204,21,0.05)"   },
  { key: "responded", label: "מענה",   emoji: "💬", color: "rgb(251,146,60)",        activeBg: "rgba(251,146,60,0.12)",   borderActive: "rgba(251,146,60,0.35)",  headerBg: "rgba(251,146,60,0.05)"   },
  { key: "client",    label: "לקוח",   emoji: "✅", color: "rgb(74,222,128)",        activeBg: "rgba(74,222,128,0.12)",   borderActive: "rgba(74,222,128,0.35)",  headerBg: "rgba(74,222,128,0.05)"   },
];

// ── Reusable badges ───────────────────────────────────────────────────────────

export function ScoreBadge({ score, tier }: { score: number | null; tier: string | null }) {
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
      {tier === "hot" ? (
        <motion.span
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          style={{ display: "inline-block" }}
        >🔥</motion.span>
      ) : tier === "warm" ? "🌡" : "❄️"}
      {score ?? "—"}/10
    </span>
  );
}

export function AdTypeBadge({ type }: { type: string | null }) {
  const map: Record<string, string> = { video: "וידאו", carousel: "קרוסלה", image: "תמונה" };
  return (
    <span
      className="rounded-md px-2 py-0.5"
      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", fontWeight: 400, fontSize: "0.78rem", color: "rgba(255,255,255,0.5)" }}
    >
      {map[type ?? ""] ?? type ?? "—"}
    </span>
  );
}

type ResearchCardType = "strength" | "gap" | "observation" | "note";
const RESEARCH_CARD_STYLES: Record<ResearchCardType, { border: string; bg: string; label: string; color: string }> = {
  strength:    { border: "rgba(74,222,128,0.3)",   bg: "rgba(74,222,128,0.06)",   label: "חוזק",   color: "rgb(74,222,128)"   },
  gap:         { border: "rgba(248,113,113,0.3)",  bg: "rgba(248,113,113,0.06)",  label: "פער",    color: "rgb(248,113,113)"  },
  observation: { border: "rgba(99,102,241,0.35)",  bg: "rgba(99,102,241,0.07)",   label: "תצפית",  color: "rgb(129,140,248)"  },
  note:        { border: "rgba(255,255,255,0.06)", bg: "rgba(255,255,255,0.03)",  label: "",       color: "rgba(255,255,255,0.5)" },
};

function parseResearch(text: string): Array<{ type: ResearchCardType; emoji: string; text: string }> {
  return text.split("\n").map(l => l.trim()).filter(Boolean).map(line => {
    if (line.startsWith("✅")) return { type: "strength",    emoji: "✅", text: line.replace(/^✅\s*/, "") };
    if (line.startsWith("❌")) return { type: "gap",         emoji: "❌", text: line.replace(/^❌\s*/, "") };
    if (line.startsWith("👁")) return { type: "observation", emoji: "👁", text: line.replace(/^👁\s*/, "") };
    return { type: "note", emoji: "", text: line };
  });
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

// ── Lead detail panel ─────────────────────────────────────────────────────────

export default function LeadPanel({
  lead,
  onClose,
  onEmailGenerated,
  onStatusChange,
}: {
  lead: Lead;
  onClose: () => void;
  onEmailGenerated?: (id: string, draft: string) => void;
  onStatusChange?: (id: string, status: CrmStatus) => void;
}) {
  const [emailText, setEmailText]   = useState(lead.hebrew_email_draft ?? "");
  const [savedText, setSavedText]   = useState(lead.hebrew_email_draft ?? "");
  const [saving, setSaving]         = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "error">("idle");
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState("");
  const [lemlistStatus, setLemlistStatus] = useState<"idle" | "loading" | "sent" | "error">(
    lead.lemlist_status === "sent" ? "sent" : "idle"
  ); // reused for Instantly status
  const [lemlistError, setLemlistError] = useState("");
  const [igCopied, setIgCopied]   = useState(false);
  const [fbCopied, setFbCopied]   = useState(false);
  const isDirty = emailText !== savedText;

  async function handleGenerateEmail() {
    setGenerating(true);
    setGenerateError("");
    try {
      const res = await fetch(`/api/leads/${lead.id}/write-email`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        const draft = data.hebrew_email_draft ?? "";
        setEmailText(draft);
        setSavedText(draft);
        onEmailGenerated?.(lead.id, draft);
      } else {
        const err = await res.json().catch(() => ({}));
        setGenerateError(err.error || `שגיאה (${res.status})`);
      }
    } catch {
      setGenerateError("שגיאת רשת — נסה שוב");
    }
    setGenerating(false);
  }

  async function handleSaveEmail() {
    setSaving(true);
    try {
      const res = await fetch(`/api/leads/${lead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hebrew_email_draft: emailText }),
      });
      if (res.ok) {
        setSaveStatus("saved");
        setSavedText(emailText);
        onEmailGenerated?.(lead.id, emailText);
      } else {
        setSaveStatus("error");
      }
    } catch {
      setSaveStatus("error");
    }
    setSaving(false);
    setTimeout(() => setSaveStatus("idle"), 2500);
  }

  async function handlePushLemlist() {
    setLemlistStatus("loading");
    setLemlistError("");
    try {
      const res = await fetch(`/api/leads/${lead.id}/push-instantly`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setLemlistStatus("sent");
      } else {
        setLemlistStatus("error");
        setLemlistError(data.error ?? "שגיאה לא ידועה");
      }
    } catch {
      setLemlistStatus("error");
      setLemlistError("שגיאת רשת");
    }
  }

  async function handleCopyAndOpen(url: string, setFlag: (v: boolean) => void) {
    try { await navigator.clipboard.writeText(emailText); } catch {}
    setFlag(true);
    setTimeout(() => setFlag(false), 1800);
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <motion.div
      key="panel"
      initial={{ x: "-100%", opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: "-100%", opacity: 0 }}
      transition={{ type: "spring", damping: 28, stiffness: 280 }}
      className="fixed top-0 right-0 bottom-0 z-40 flex flex-col overflow-hidden w-full md:right-56 md:w-[min(520px,42vw)]"
      style={{ background: "#0d0d0d", borderLeft: "1px solid rgba(255,255,255,0.07)" }}
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
          <div className="flex items-center gap-4 mt-1 flex-wrap" style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.3)" }}>
            {lead.active_ads_count != null && <span>📢 {lead.active_ads_count} מודעות</span>}
            {lead.page_followers != null && <span>👥 {lead.page_followers.toLocaleString()} עוקבים</span>}
            {lead.instagram_followers != null && <span>📸 {lead.instagram_followers.toLocaleString()} אינסטגרם</span>}
            <span>📅 {new Date(lead.created_at).toLocaleDateString("he-IL")}</span>
          </div>
          {((lead.video_count ?? 0) > 0 || (lead.image_count ?? 0) > 0 || (lead.carousel_count ?? 0) > 0) && (
            <div className="flex items-center gap-3 mt-1" style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.4)" }}>
              {(lead.video_count ?? 0) > 0    && <span>🎬 {lead.video_count} וידאו</span>}
              {(lead.image_count ?? 0) > 0    && <span>🖼 {lead.image_count} סטטיות</span>}
              {(lead.carousel_count ?? 0) > 0 && <span>📂 {lead.carousel_count} קרוסלה</span>}
            </div>
          )}
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
          {lead.ad_url && (
            <a href={lead.ad_url} target="_blank" rel="noopener noreferrer"
              className="rounded-lg px-3 py-1.5 transition-colors hover:bg-white/[0.08]"
              style={{ fontWeight: 400, fontSize: "0.8rem", color: "rgb(129,140,248)", background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)" }}>
              📢 מודעה
            </a>
          )}
          {lead.facebook_page && (
            <a href={lead.facebook_page} target="_blank" rel="noopener noreferrer"
              className="rounded-lg px-3 py-1.5 transition-colors hover:bg-white/[0.08]"
              style={{ fontWeight: 400, fontSize: "0.8rem", color: "rgb(129,140,248)", background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)" }}>
              📘 פייסבוק
            </a>
          )}
          {lead.instagram_page && (
            <a href={lead.instagram_page} target="_blank" rel="noopener noreferrer"
              className="rounded-lg px-3 py-1.5 transition-colors hover:bg-white/[0.08]"
              style={{ fontWeight: 400, fontSize: "0.8rem", color: "rgb(129,140,248)", background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)" }}>
              📸 אינסטגרם
            </a>
          )}
          {lead.website_url && (
            <a href={lead.website_url} target="_blank" rel="noopener noreferrer"
              className="rounded-lg px-3 py-1.5 transition-colors hover:bg-white/[0.08]"
              style={{ fontWeight: 400, fontSize: "0.8rem", color: "rgb(129,140,248)", background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)" }}>
              🌐 אתר
            </a>
          )}
        </div>

        {/* Ad copy */}
        {lead.ad_copy && (
          <section>
            <p style={{ fontWeight: 700, fontSize: "0.78rem", color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em" }} className="uppercase mb-3">
              טקסט המודעה
            </p>
            <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <p style={{ fontWeight: 300, fontSize: "0.88rem", color: "rgba(255,255,255,0.6)", lineHeight: 1.75, whiteSpace: "pre-wrap" }}>
                {lead.ad_copy}
              </p>
            </div>
          </section>
        )}

        {/* Oldest ad */}
        {lead.oldest_ad_date && (
          <div className="flex items-center gap-3" style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.35)" }}>
            <span>📅 מודעה ותיקה: {lead.oldest_ad_date}</span>
            {lead.oldest_ad_url && (
              <a href={lead.oldest_ad_url} target="_blank" rel="noopener noreferrer"
                style={{ color: "rgb(129,140,248)", textDecoration: "none" }}>
                ← צפה
              </a>
            )}
          </div>
        )}

        {/* CRM stage picker — only in board context */}
        {onStatusChange && (
          <div>
            <p style={{ fontWeight: 700, fontSize: "0.75rem", color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em", marginBottom: "0.5rem" }} className="uppercase">
              שלב CRM
            </p>
            <div className="flex items-center gap-1.5 flex-wrap">
              {STAGES.map((s) => (
                <button
                  key={s.key}
                  onClick={() => onStatusChange(lead.id, s.key)}
                  className="rounded-lg px-3 py-1 transition-all"
                  style={{
                    fontWeight: lead.crm_status === s.key ? 700 : 400, fontSize: "0.8rem", fontFamily: F,
                    background: lead.crm_status === s.key ? s.activeBg : "rgba(255,255,255,0.04)",
                    border: `1px solid ${lead.crm_status === s.key ? s.borderActive : "rgba(255,255,255,0.08)"}`,
                    color: lead.crm_status === s.key ? s.color : "rgba(255,255,255,0.4)",
                  }}
                >
                  {s.emoji} {s.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Claude analysis */}
        {(lead.score_reasoning || lead.outreach_angle) && (
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
              {lead.outreach_angle && (
                <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <p style={{ fontWeight: 700, fontSize: "0.78rem", color: "rgba(255,255,255,0.35)", marginBottom: "0.4rem" }}>זווית אאוטריץ׳</p>
                  <p style={{ fontWeight: 300, fontSize: "0.88rem", color: "rgba(255,255,255,0.65)", lineHeight: 1.65 }}>{lead.outreach_angle}</p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Research — parsed into cards */}
        {lead.perplexity_research && (
          <section>
            <p style={{ fontWeight: 700, fontSize: "0.78rem", color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em" }} className="uppercase mb-3">
              מחקר
            </p>
            <div className="flex flex-col gap-2">
              {parseResearch(lead.perplexity_research).map((card, i) => {
                const s = RESEARCH_CARD_STYLES[card.type];
                return (
                  <div
                    key={i}
                    className="rounded-xl px-4 py-3"
                    style={{ background: s.bg, border: `1px solid ${s.border}`, borderRight: `3px solid ${s.border}` }}
                  >
                    {card.emoji && (
                      <p style={{ fontWeight: 700, fontSize: "0.72rem", color: s.color, marginBottom: "0.25rem", letterSpacing: "0.06em" }}>
                        {card.emoji} {s.label}
                      </p>
                    )}
                    <p style={{ fontWeight: 300, fontSize: "0.86rem", color: "rgba(255,255,255,0.7)", lineHeight: 1.65 }}>
                      {card.text}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Editable email draft */}
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
              {emailText && <CopyButton text={emailText} />}
            </div>
          </div>

          {!emailText && (
            <motion.button
              onClick={handleGenerateEmail}
              disabled={generating}
              whileHover={!generating ? { scale: 1.02, boxShadow: "0 0 20px rgba(99,102,241,0.3)" } : {}}
              whileTap={!generating ? { scale: 0.97 } : {}}
              className="w-full rounded-xl py-3 mb-3 transition-all disabled:opacity-60"
              style={{
                fontFamily: F, fontWeight: 700, fontSize: "0.88rem",
                background: "rgba(99,102,241,0.12)",
                border: "1px dashed rgba(99,102,241,0.4)",
                color: generating ? "rgba(129,140,248,0.6)" : "rgb(129,140,248)",
              }}
            >
              {generating ? "✍️ כותב מייל..." : "✨ צור מסר אישי"}
            </motion.button>
          )}
          {generateError && (
            <p style={{ fontSize: "0.78rem", color: "rgb(248,113,113)", marginBottom: "0.5rem" }}>
              ⚠️ {generateError}
            </p>
          )}

          <textarea
            value={emailText}
            onChange={(e) => setEmailText(e.target.value)}
            placeholder={generating ? "כותב..." : "לחץ על 'צור מסר אישי' כדי לייצר טיוטה..."}
            rows={emailText ? 10 : 4}
            className="w-full rounded-xl p-5 outline-none resize-none transition-all"
            style={{
              fontFamily: F, fontWeight: 400, fontSize: "0.9rem",
              color: "rgba(255,255,255,0.75)", lineHeight: 1.8,
              background: "rgba(99,102,241,0.05)",
              border: isDirty ? "1px solid rgba(99,102,241,0.4)" : "1px solid rgba(99,102,241,0.15)",
            }}
            dir="rtl"
          />

          {/* Save / regenerate row */}
          <div className="flex items-center gap-2 mt-2">
            {emailText && (
              <button
                onClick={handleGenerateEmail}
                disabled={generating}
                className="rounded-xl px-3 py-2 transition-all disabled:opacity-40"
                style={{
                  fontFamily: F, fontWeight: 400, fontSize: "0.78rem",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.35)",
                }}
              >
                {generating ? "✍️..." : "↺ צור מחדש"}
              </button>
            )}
            <motion.button
              onClick={handleSaveEmail}
              disabled={!isDirty || saving}
              whileHover={isDirty && !saving ? { scale: 1.04, y: -1 } : {}}
              whileTap={isDirty && !saving ? { scale: 0.96 } : {}}
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
              {saving ? "שומר..." : saveStatus === "saved" ? "✓ נשמר" : saveStatus === "error" ? "שגיאה" : "שמור"}
            </motion.button>
          </div>

          {/* Send buttons row */}
          {emailText && (
            <div className="flex flex-wrap items-center gap-2 mt-3 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>

              {/* Lemlist */}
              <motion.button
                onClick={handlePushLemlist}
                disabled={lemlistStatus === "loading" || lemlistStatus === "sent" || !lead.email_address}
                whileHover={lemlistStatus === "idle" && !!lead.email_address ? { scale: 1.04, boxShadow: "0 0 16px rgba(74,222,128,0.3)" } : {}}
                whileTap={lemlistStatus === "idle" && !!lead.email_address ? { scale: 0.96 } : {}}
                title={!lead.email_address ? "אין כתובת מייל" : undefined}
                className="rounded-xl px-4 py-2 disabled:opacity-50"
                style={{
                  fontFamily: F, fontWeight: 700, fontSize: "0.82rem",
                  background: lemlistStatus === "sent" ? "rgba(74,222,128,0.15)"
                    : lemlistStatus === "error" ? "rgba(239,68,68,0.12)"
                    : "rgba(74,222,128,0.1)",
                  border: lemlistStatus === "sent" ? "1px solid rgba(74,222,128,0.4)"
                    : lemlistStatus === "error" ? "1px solid rgba(239,68,68,0.3)"
                    : "1px solid rgba(74,222,128,0.25)",
                  color: lemlistStatus === "sent" ? "rgb(74,222,128)"
                    : lemlistStatus === "error" ? "rgb(248,113,113)"
                    : "rgb(74,222,128)",
                }}
              >
                {lemlistStatus === "loading" ? "שולח..." : lemlistStatus === "sent" ? "✓ נשלח!" : "💰 Make Me Rich"}
              </motion.button>

              {/* Instagram DM */}
              {lead.instagram_page && (
                <motion.button
                  onClick={() => handleCopyAndOpen(lead.instagram_page!, setIgCopied)}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className="rounded-xl px-4 py-2"
                  style={{
                    fontFamily: F, fontWeight: 700, fontSize: "0.82rem",
                    background: igCopied ? "rgba(99,102,241,0.15)" : "rgba(255,255,255,0.05)",
                    border: igCopied ? "1px solid rgba(99,102,241,0.35)" : "1px solid rgba(255,255,255,0.1)",
                    color: igCopied ? "rgb(129,140,248)" : "rgba(255,255,255,0.55)",
                  }}
                >
                  {igCopied ? "✓ הועתק" : "📸 Instagram DM"}
                </motion.button>
              )}

              {/* Facebook */}
              {lead.facebook_page && (
                <motion.button
                  onClick={() => handleCopyAndOpen(lead.facebook_page!, setFbCopied)}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className="rounded-xl px-4 py-2"
                  style={{
                    fontFamily: F, fontWeight: 700, fontSize: "0.82rem",
                    background: fbCopied ? "rgba(99,102,241,0.15)" : "rgba(255,255,255,0.05)",
                    border: fbCopied ? "1px solid rgba(99,102,241,0.35)" : "1px solid rgba(255,255,255,0.1)",
                    color: fbCopied ? "rgb(129,140,248)" : "rgba(255,255,255,0.55)",
                  }}
                >
                  {fbCopied ? "✓ הועתק" : "📘 Facebook"}
                </motion.button>
              )}

              {lemlistError && (
                <p style={{ width: "100%", fontWeight: 300, fontSize: "0.75rem", color: "rgb(248,113,113)", marginTop: "0.25rem" }}>
                  ⚠️ {lemlistError}
                </p>
              )}
            </div>
          )}

        </section>

      </div>
    </motion.div>
  );
}
