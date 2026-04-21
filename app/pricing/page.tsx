import { createClient } from "@/lib/supabase/server";
import PricingCTA from "@/components/pricing-cta";

const F = "var(--font-osh), sans-serif";

const FEATURES = [
  { icon: "🔍", text: "סריקת Meta Ads Library לכל נישה" },
  { icon: "🧠", text: "ניתוח AI לכל ליד — ציון 1–10" },
  { icon: "📋", text: "מחקר עסקי מ-Perplexity לכל ליד כשיר" },
  { icon: "✉️", text: "כתיבת מייל קר בעברית — בסגנון שלך" },
  { icon: "📤", text: "שליחה אוטומטית ל-Lemlist" },
  { icon: "📊", text: "לוח בקרה עם כל הלידים וסטטוסים" },
  { icon: "⚡", text: "עד 50 לידים לכל חיפוש" },
];

export default async function PricingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Check if user already has active subscription
  let isActive = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("subscription_status, trial_ends_at")
      .eq("user_id", user.id)
      .single();

    isActive =
      profile?.subscription_status === "active" ||
      (profile?.subscription_status === "trialing" &&
        profile?.trial_ends_at &&
        new Date(profile.trial_ends_at) > new Date());
  }

  return (
    <div
      className="min-h-screen bg-black flex flex-col items-center justify-center px-4 py-16"
      style={{ fontFamily: F }}
      dir="rtl"
    >
      {/* Glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[600px] h-[400px] bg-indigo-600/6 rounded-full blur-[140px]" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-10">
          <p style={{ fontWeight: 800, fontSize: "2rem", color: "#fff", letterSpacing: "-0.03em" }}>
            OutRich
          </p>
          <p style={{ fontWeight: 300, fontSize: "0.9rem", color: "rgba(255,255,255,0.35)", marginTop: "0.35rem" }}>
            מכונת לידים AI לסוכנויות תוכן
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-3xl p-8 flex flex-col gap-6"
          style={{
            background: "rgba(255,255,255,0.025)",
            border: "1px solid rgba(255,255,255,0.09)",
          }}
        >
          {/* Plan header */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span
                className="rounded-full px-3 py-1 text-xs"
                style={{ fontWeight: 700, background: "rgba(99,102,241,0.15)", color: "rgb(129,140,248)", border: "1px solid rgba(99,102,241,0.3)", letterSpacing: "0.08em" }}
              >
                PRO
              </span>
            </div>
            <p style={{ fontWeight: 800, fontSize: "2.8rem", color: "#fff", lineHeight: 1, letterSpacing: "-0.03em" }}>
              ₪299
              <span style={{ fontWeight: 300, fontSize: "1rem", color: "rgba(255,255,255,0.35)", marginRight: "0.4rem" }}>
                / חודש
              </span>
            </p>
            <p style={{ fontWeight: 300, fontSize: "0.85rem", color: "rgba(255,255,255,0.35)", marginTop: "0.5rem" }}>
              7 ימי ניסיון חינם · ביטול בכל עת
            </p>
          </div>

          {/* Divider */}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }} />

          {/* Features */}
          <ul className="flex flex-col gap-3">
            {FEATURES.map((f) => (
              <li key={f.text} className="flex items-center gap-3">
                <span style={{ fontSize: "1.1rem", flexShrink: 0 }}>{f.icon}</span>
                <span style={{ fontWeight: 400, fontSize: "0.9rem", color: "rgba(255,255,255,0.7)" }}>
                  {f.text}
                </span>
              </li>
            ))}
          </ul>

          {/* Divider */}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }} />

          {/* CTA */}
          {isActive ? (
            <div className="text-center">
              <p style={{ fontWeight: 700, fontSize: "0.9rem", color: "rgb(74,222,128)", marginBottom: "0.75rem" }}>
                ✓ המנוי שלך פעיל
              </p>
              <a
                href="/dashboard"
                className="block w-full rounded-2xl py-4 text-center transition-all hover:opacity-90"
                style={{ fontWeight: 800, fontSize: "1rem", background: "rgba(74,222,128,0.12)", color: "rgb(74,222,128)", border: "1px solid rgba(74,222,128,0.25)" }}
              >
                לדשבורד ←
              </a>
            </div>
          ) : (
            <PricingCTA loggedIn={!!user} />
          )}

          <p style={{ textAlign: "center", fontWeight: 300, fontSize: "0.75rem", color: "rgba(255,255,255,0.2)" }}>
            תשלום מאובטח דרך Stripe · ללא התחייבות
          </p>
        </div>

        {/* Back link for logged-in users */}
        {user && !isActive && (
          <p style={{ textAlign: "center", marginTop: "1.5rem", fontWeight: 300, fontSize: "0.82rem", color: "rgba(255,255,255,0.25)" }}>
            <a href="/dashboard" style={{ color: "rgba(255,255,255,0.35)", textDecoration: "underline" }}>
              חזור לדשבורד
            </a>
          </p>
        )}

        {!user && (
          <p style={{ textAlign: "center", marginTop: "1.5rem", fontWeight: 300, fontSize: "0.82rem", color: "rgba(255,255,255,0.3)" }}>
            כבר יש לך חשבון?{" "}
            <a href="/login" style={{ color: "rgba(129,140,248,0.8)", fontWeight: 500, textDecoration: "none" }}>
              כניסה
            </a>
          </p>
        )}
      </div>
    </div>
  );
}
