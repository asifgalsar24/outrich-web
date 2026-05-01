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

          <div className="flex items-center gap-2 mt-2 justify-between">
            <div className="flex items-center gap-2">
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

            {emailText && (
              lead.email_address ? (
                <a
                  href={`mailto:${lead.email_address}?subject=שיתוף פעולה - ${encodeURIComponent(lead.company_name)}&body=${encodeURIComponent(emailText)}`}
                  className="rounded-xl px-4 py-2 transition-all"
                  style={{
                    fontFamily: F, fontWeight: 700, fontSize: "0.82rem",
                    background: "rgba(74,222,128,0.12)",
                    border: "1px solid rgba(74,222,128,0.3)",
                    color: "rgb(74,222,128)",
                    textDecoration: "none",
                    display: "inline-block",
                  }}
                >
                  📤 שלח מייל
                </a>
              ) : (
                <span style={{ fontWeight: 300, fontSize: "0.78rem", color: "rgba(255,255,255,0.2)" }}>
                  אין כתובת מייל
                </span>
              )
            )}
          </div>
        </section>

      </div>
    </motion.div>
  );
}
