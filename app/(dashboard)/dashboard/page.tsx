import { createClient } from "@/lib/supabase/server";

const F = "var(--font-osh), sans-serif";

const SCORING_SIGNALS = [
  {
    category: "מודעות פעילות",
    description: "מספר מודעות שהעסק מריץ — אות תקציב ישיר",
    tiers: [
      { label: "10+ מודעות", points: "+3", strength: 1.0, color: "rgb(74,222,128)" },
      { label: "5–9 מודעות", points: "+2", strength: 0.65, color: "rgb(250,204,21)" },
      { label: "2–4 מודעות", points: "+1", strength: 0.35, color: "rgb(129,140,248)" },
    ],
  },
  {
    category: "סוג מודעה",
    description: "מודעת וידאו = כבר משקיע בתוכן, צריך שדרוג",
    tiers: [
      { label: "וידאו", points: "+3", strength: 1.0, color: "rgb(74,222,128)" },
      { label: "קרוסל / תמונה", points: "0", strength: 0.15, color: "rgba(255,255,255,0.2)" },
    ],
  },
  {
    category: "נישה",
    description: "תחומים בעלי ערך גבוה עם תקציבי מדיה גדולים",
    tiers: [
      { label: "נדל״ן, אירועים, כושר, מסעדות, קליניקות, עורכי דין", points: "+2", strength: 0.65, color: "rgb(250,204,21)" },
      { label: "תחומים אחרים", points: "0", strength: 0.15, color: "rgba(255,255,255,0.2)" },
    ],
  },
  {
    category: "עוקבים בדף",
    description: "פחות עוקבים = יש לאן לצמוח — ייעזר במדיה",
    tiers: [
      { label: "פחות מ-5,000 עוקבים", points: "+2", strength: 0.65, color: "rgb(250,204,21)" },
      { label: "5,000+", points: "0", strength: 0.15, color: "rgba(255,255,255,0.2)" },
    ],
  },
  {
    category: "עקביות ויזואלית",
    description: "חוסר אחידות = הזדמנות לייצר זהות ברנד חזקה",
    tiers: [
      { label: "אין עקביות ויזואלית", points: "+1", strength: 0.35, color: "rgb(129,140,248)" },
    ],
  },
];

const TIER_SCALE = [
  { label: "חם 🔥", range: "8–10", color: "rgb(251,146,60)", bg: "rgba(251,146,60,0.1)", border: "rgba(251,146,60,0.25)", width: "100%" },
  { label: "ביניים 🌡", range: "5–7", color: "rgb(250,204,21)", bg: "rgba(250,204,21,0.08)", border: "rgba(250,204,21,0.2)", width: "70%" },
  { label: "קר ❄️", range: "1–4", color: "rgb(129,140,248)", bg: "rgba(99,102,241,0.08)", border: "rgba(99,102,241,0.2)", width: "40%" },
];

export default async function DashboardPage() {
  const supabase = await createClient();

  const [{ count: total }, { count: hot }, { count: warm }, { count: sent }] =
    await Promise.all([
      supabase.from("leads").select("*", { count: "exact", head: true }),
      supabase.from("leads").select("*", { count: "exact", head: true }).eq("lead_quality", "hot"),
      supabase.from("leads").select("*", { count: "exact", head: true }).eq("lead_quality", "warm"),
      supabase.from("leads").select("*", { count: "exact", head: true }).eq("lemlist_status", "sent"),
    ]);

  const stats = [
    { label: "סה״כ לידים",      value: total ?? 0,  color: "rgba(255,255,255,0.9)" },
    { label: "לידים חמים 🔥",   value: hot ?? 0,    color: "rgb(251,146,60)" },
    { label: "לידים ביניים 🌡", value: warm ?? 0,   color: "rgb(250,204,21)" },
    { label: "נשלחו ל-Lemlist", value: sent ?? 0,   color: "rgb(129,140,248)" },
  ];

  return (
    <div className="p-8 max-w-5xl" style={{ fontFamily: F }} dir="rtl">
      <div className="mb-10">
        <h1 style={{ fontWeight: 800, fontSize: "1.8rem", color: "#fff" }}>סקירה כללית</h1>
        <p style={{ fontWeight: 300, fontSize: "0.9rem", color: "rgba(255,255,255,0.38)", marginTop: "0.3rem" }}>
          כל מה שקורה במערכת, במבט אחד
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6"
          >
            <p style={{ fontWeight: 800, fontSize: "2.4rem", color: s.color, lineHeight: 1 }}>
              {s.value}
            </p>
            <p style={{ fontWeight: 400, fontSize: "0.82rem", color: "rgba(255,255,255,0.4)", marginTop: "0.5rem" }}>
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* Scoring breakdown */}
      <div className="mt-8 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-7">
        <div className="mb-6">
          <p style={{ fontWeight: 800, fontSize: "1.05rem", color: "rgba(255,255,255,0.85)" }}>
            מדד ניקוד לידים
          </p>
          <p style={{ fontWeight: 300, fontSize: "0.82rem", color: "rgba(255,255,255,0.3)", marginTop: "0.25rem" }}>
            כך Claude מחשב את ציון הפוטנציאל לכל עסק — מ-1 עד 10
          </p>
        </div>

        {/* Tier legend */}
        <div className="flex gap-3 mb-7 flex-wrap">
          {TIER_SCALE.map((t) => (
            <div
              key={t.label}
              className="flex items-center gap-2.5 rounded-xl px-4 py-2.5"
              style={{ background: t.bg, border: `1px solid ${t.border}` }}
            >
              <div className="rounded-full" style={{ width: 8, height: 8, background: t.color, flexShrink: 0 }} />
              <span style={{ fontWeight: 700, fontSize: "0.82rem", color: t.color }}>{t.label}</span>
              <span style={{ fontWeight: 300, fontSize: "0.75rem", color: "rgba(255,255,255,0.3)" }}>ציון {t.range}</span>
            </div>
          ))}
        </div>

        {/* Signal rows */}
        <div className="flex flex-col gap-5">
          {SCORING_SIGNALS.map((signal) => (
            <div key={signal.category}>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span style={{ fontWeight: 700, fontSize: "0.88rem", color: "rgba(255,255,255,0.75)" }}>
                    {signal.category}
                  </span>
                  <span style={{ fontWeight: 300, fontSize: "0.75rem", color: "rgba(255,255,255,0.3)", marginRight: "0.6rem" }}>
                    — {signal.description}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                {signal.tiers.map((tier) => (
                  <div key={tier.label} className="flex items-center gap-3">
                    {/* Bar */}
                    <div
                      className="rounded-full"
                      style={{
                        height: 6,
                        width: `${Math.round(tier.strength * 180)}px`,
                        background: tier.color,
                        opacity: 0.85,
                        flexShrink: 0,
                      }}
                    />
                    {/* Points badge */}
                    <span
                      className="rounded-md px-1.5 py-0.5 tabular-nums"
                      style={{
                        fontWeight: 700,
                        fontSize: "0.72rem",
                        color: tier.color,
                        background: `${tier.color}18`,
                        border: `1px solid ${tier.color}30`,
                        flexShrink: 0,
                      }}
                    >
                      {tier.points}
                    </span>
                    {/* Label */}
                    <span style={{ fontWeight: 300, fontSize: "0.8rem", color: "rgba(255,255,255,0.45)" }}>
                      {tier.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div
          className="mt-7 rounded-xl px-5 py-4"
          style={{ background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.15)" }}
        >
          <p style={{ fontWeight: 400, fontSize: "0.8rem", color: "rgba(255,255,255,0.4)", lineHeight: 1.7 }}>
            <span style={{ fontWeight: 700, color: "rgb(129,140,248)" }}>איך זה עובד:</span>{" "}
            Claude מקבל את נתוני הליד ומחשב ציון מ-1 עד 10 לפי האותות למעלה.
            לידים עם ציון 7+ ממשיכים לשלב המחקר וכתיבת המייל.
            לידים עם ציון 8+ נשלחים ישירות ל-Lemlist לפנייה אוטומטית.
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6">
        <p style={{ fontWeight: 700, fontSize: "1rem", color: "rgba(255,255,255,0.7)", marginBottom: "0.5rem" }}>
          מה עכשיו?
        </p>
        <p style={{ fontWeight: 300, fontSize: "0.88rem", color: "rgba(255,255,255,0.38)", lineHeight: 1.7 }}>
          עבור ל<a href="/dashboard/leads" style={{ color: "rgb(129,140,248)", textDecoration: "underline" }}>לידים</a> לצפייה בטבלה המלאה,
          או הפעל חיפוש חדש מבוט הטלגרם כדי להוסיף לידים נוספים.
        </p>
      </div>
    </div>
  );
}
