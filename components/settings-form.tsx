"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const F = "var(--font-osh), sans-serif";

type Settings = {
  sender_name: string;
  company_name: string;
  service_description: string;
  tone_description: string;
  example_writing: string;
  phrases_to_use: string;
  phrases_to_avoid: string;
  email_max_words: number;
  cta_style: string;
  portfolio_url: string;
  portfolio_description: string;
};

const DEFAULTS: Settings = {
  sender_name: "",
  company_name: "",
  service_description: "",
  tone_description: "",
  example_writing: "",
  phrases_to_use: "",
  phrases_to_avoid: "",
  email_max_words: 80,
  cta_style: "question",
  portfolio_url: "",
  portfolio_description: "",
};

const CTA_OPTIONS = [
  { value: "question", label: 'שאלה ישירה', example: '"אפשר לדבר 15 דקות?"' },
  { value: "soft",     label: 'דחיפה רכה',  example: '"שווה שנדבר?"' },
  { value: "direct",   label: 'קריאה ישירה', example: '"בוא נקבע שיחה."' },
];

export default function SettingsForm({
  initialSettings,
  userId,
}: {
  initialSettings: Settings | null;
  userId: string;
}) {
  const [form, setForm]       = useState<Settings>(initialSettings ?? DEFAULTS);
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);
  const [error, setError]     = useState("");

  const supabase = createClient();

  function set(key: keyof Settings, value: string | number) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  async function handleSave() {
    if (!userId) return;
    setSaving(true);
    setError("");

    const { error: err } = await supabase
      .from("settings")
      .upsert({ ...form, user_id: userId }, { onConflict: "user_id" });

    setSaving(false);
    if (err) {
      setError(err.message);
    } else {
      setSaved(true);
    }
  }

  const inputClass = "w-full rounded-xl border border-white/[0.1] bg-white/[0.04] px-4 py-3 text-white placeholder:text-white/20 outline-none focus:border-indigo-500/60 focus:bg-white/[0.06] transition-all resize-none";
  const labelStyle = { fontWeight: 700, fontSize: "0.78rem", color: "rgba(255,255,255,0.45)", display: "block", marginBottom: "0.5rem", letterSpacing: "0.06em" } as const;
  const hintStyle  = { fontWeight: 300, fontSize: "0.74rem", color: "rgba(255,255,255,0.25)", marginTop: "0.35rem" } as const;

  return (
    <div className="max-w-2xl mx-auto px-6 py-8 flex flex-col gap-10" dir="rtl" style={{ fontFamily: F }}>

      {/* ── Section 1: Brand Info ───────────────────────────── */}
      <section className="flex flex-col gap-5">
        <div>
          <p style={{ fontWeight: 800, fontSize: "1rem", color: "#fff" }}>המידע שלך</p>
          <p style={{ fontWeight: 300, fontSize: "0.8rem", color: "rgba(255,255,255,0.3)", marginTop: "2px" }}>
            ייכנס לחתימה ולהקשר של המיילים
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label style={labelStyle}>שם פרטי (שולח)</label>
            <input
              type="text"
              value={form.sender_name}
              onChange={(e) => set("sender_name", e.target.value)}
              placeholder="יותם, דנה, אסף..."
              className={inputClass}
              style={{ fontFamily: F }}
              dir="rtl"
            />
          </div>
          <div>
            <label style={labelStyle}>שם הסוכנות / חברה</label>
            <input
              type="text"
              value={form.company_name}
              onChange={(e) => set("company_name", e.target.value)}
              placeholder="Legacy Media, Studio X..."
              className={inputClass}
              style={{ fontFamily: F }}
              dir="rtl"
            />
          </div>
        </div>

        <div>
          <label style={labelStyle}>מה אתה מציע</label>
          <input
            type="text"
            value={form.service_description}
            onChange={(e) => set("service_description", e.target.value)}
            placeholder="ריילס, וידאו קורפורייט, תוכן לרשתות, סרטי תדמית..."
            className={inputClass}
            style={{ fontFamily: F }}
            dir="rtl"
          />
          <p style={hintStyle}>תיאור קצר של השירותים שלך — Claude ישתמש בזה כשיכתוב עבורך</p>
        </div>
      </section>

      <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }} />

      {/* ── Section 2: Voice Profile ────────────────────────── */}
      <section className="flex flex-col gap-5">
        <div>
          <p style={{ fontWeight: 800, fontSize: "1rem", color: "#fff" }}>קול המותג</p>
          <p style={{ fontWeight: 300, fontSize: "0.8rem", color: "rgba(255,255,255,0.3)", marginTop: "2px" }}>
            ככל שתהיה יותר ספציפי — המיילים ישמעו יותר כמוך
          </p>
        </div>

        <div>
          <label style={labelStyle}>תיאור הטון שלך</label>
          <input
            type="text"
            value={form.tone_description}
            onChange={(e) => set("tone_description", e.target.value)}
            placeholder="ישיר, אמיתי, לא רובוטי / מקצועי אבל חם / street-smart..."
            className={inputClass}
            style={{ fontFamily: F }}
            dir="rtl"
          />
          <p style={hintStyle}>3-4 מילים שמתארות איך אתה כותב</p>
        </div>

        <div>
          <label style={labelStyle}>דוגמה לכתיבה שלך</label>
          <textarea
            value={form.example_writing}
            onChange={(e) => set("example_writing", e.target.value)}
            placeholder={"תדביק כאן 2-3 משפטים שכתבת בעצמך — לא חייב להיות מייל, כל הודעה שנשמעת כמוך.\n\nלדוגמה: \"ראיתי את הסרטון שעשית לחדר הכושר. יש שם משהו טוב, אבל הצליל הורג את זה. נסה אותנו שבוע.\""}
            rows={4}
            className={inputClass}
            style={{ fontFamily: F }}
            dir="rtl"
          />
          <p style={hintStyle}>Claude יחקה את הסגנון הזה בדיוק — זה הדבר הכי חשוב בטופס</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label style={labelStyle}>ביטויים שאתה משתמש בהם</label>
            <textarea
              value={form.phrases_to_use}
              onChange={(e) => set("phrases_to_use", e.target.value)}
              placeholder={"\"בוא נדבר\"\n\"שנסה ביחד\"\n\"לא מסובך\""}
              rows={4}
              className={inputClass}
              style={{ fontFamily: F }}
              dir="rtl"
            />
          </div>
          <div>
            <label style={labelStyle}>ביטויים שאסור לכתוב</label>
            <textarea
              value={form.phrases_to_avoid}
              onChange={(e) => set("phrases_to_avoid", e.target.value)}
              placeholder={"\"מקווה שהכל בסדר\"\n\"אני שמח לשתף\"\n\"פתרון מקיף\""}
              rows={4}
              className={inputClass}
              style={{ fontFamily: F }}
              dir="rtl"
            />
          </div>
        </div>
      </section>

      <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }} />

      {/* ── Section 3: Email Settings ───────────────────────── */}
      <section className="flex flex-col gap-5">
        <div>
          <p style={{ fontWeight: 800, fontSize: "1rem", color: "#fff" }}>הגדרות מייל</p>
        </div>

        <div>
          <label style={labelStyle}>סגנון סיום (CTA)</label>
          <div className="flex gap-3">
            {CTA_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => set("cta_style", opt.value)}
                className="flex-1 rounded-xl p-3 text-right transition-all"
                style={{
                  fontFamily: F,
                  background: form.cta_style === opt.value ? "rgba(99,102,241,0.15)" : "rgba(255,255,255,0.04)",
                  border: form.cta_style === opt.value ? "1px solid rgba(99,102,241,0.35)" : "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <p style={{ fontWeight: 700, fontSize: "0.82rem", color: form.cta_style === opt.value ? "rgb(129,140,248)" : "rgba(255,255,255,0.55)" }}>
                  {opt.label}
                </p>
                <p style={{ fontWeight: 300, fontSize: "0.75rem", color: "rgba(255,255,255,0.25)", marginTop: "3px" }}>
                  {opt.example}
                </p>
              </button>
            ))}
          </div>
        </div>

        <div style={{ maxWidth: "160px" }}>
          <label style={labelStyle}>מקסימום מילים</label>
          <input
            type="number"
            value={form.email_max_words}
            onChange={(e) => set("email_max_words", parseInt(e.target.value) || 80)}
            min={40}
            max={200}
            className={inputClass}
            style={{ fontFamily: F }}
            dir="rtl"
          />
        </div>
      </section>

      <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }} />

      {/* ── Section 4: Portfolio ────────────────────────────── */}
      <section className="flex flex-col gap-5">
        <div>
          <p style={{ fontWeight: 800, fontSize: "1rem", color: "#fff" }}>פורטפוליו</p>
          <p style={{ fontWeight: 300, fontSize: "0.8rem", color: "rgba(255,255,255,0.3)", marginTop: "2px" }}>
            הלינק יצורף אוטומטית לכל מייל שנשלח
          </p>
        </div>

        <div>
          <label style={labelStyle}>לינק לפורטפוליו</label>
          <input
            type="url"
            value={form.portfolio_url}
            onChange={(e) => set("portfolio_url", e.target.value)}
            placeholder="https://vimeo.com/yourname  או  https://yoursite.com/work"
            className={inputClass}
            style={{ fontFamily: F, direction: "ltr", textAlign: "right" }}
          />
          <p style={hintStyle}>Vimeo, YouTube playlist, אתר, כל לינק שמראה את העבודה שלך</p>
        </div>

        <div>
          <label style={labelStyle}>תיאור קצר של הפורטפוליו</label>
          <input
            type="text"
            value={form.portfolio_description}
            onChange={(e) => set("portfolio_description", e.target.value)}
            placeholder="סרטוני תדמית, ריילס לעסקים, תוכן לרשתות — ראה דוגמאות:"
            className={inputClass}
            style={{ fontFamily: F }}
            dir="rtl"
          />
          <p style={hintStyle}>משפט שיבוא לפני הלינק במייל — נשמע טבעי ולא כמו פרסומת</p>
        </div>
      </section>

      {/* ── Save ────────────────────────────────────────────── */}
      <div className="flex items-center gap-4 pb-8">
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-xl px-8 py-3 transition-all disabled:opacity-50 hover:opacity-90"
          style={{
            fontFamily: F, fontWeight: 700, fontSize: "0.95rem",
            background: "rgb(99,102,241)", color: "#fff",
          }}
        >
          {saving ? "שומר..." : "שמור הגדרות"}
        </button>

        {saved && (
          <p style={{ fontWeight: 400, fontSize: "0.85rem", color: "rgb(74,222,128)" }}>
            ✓ נשמר בהצלחה
          </p>
        )}
        {error && (
          <p style={{ fontWeight: 400, fontSize: "0.85rem", color: "rgb(248,113,113)" }}>
            שגיאה: {error}
          </p>
        )}
      </div>
    </div>
  );
}
