"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { WebGLShader } from "@/components/ui/web-gl-shader";
import { Highlight } from "@/components/ui/hero-highlight";
import { LiquidButton } from "@/components/ui/liquid-glass-button";
import { BGPattern } from "@/components/ui/bg-pattern";

/* ─── font shorthand ─────────────────────────────── */
const F = "var(--font-osh), sans-serif";

/* ─── content ────────────────────────────────────── */
const features = [
  {
    icon: "🔍",
    title: "סריקת מודעות Meta",
    description:
      "אנחנו מוצאים עסקים ישראלים שמריצים מודעות פעילות ב-Facebook וב-Instagram. אם הם משלמים על פרסום — יש להם תקציב, ויש להם צורך.",
  },
  {
    icon: "🧠",
    title: "ניקוד חכם של כל ליד",
    description:
      "המערכת מדרגת כל ליד מ-1 עד 10 לפי סוג המודעה, תחום הפעילות וגודל העסק. הלידים החמים עולים לראש התור אוטומטית — בלי שתצטרך לעבור עליהם בעצמך.",
  },
  {
    icon: "🔬",
    title: "מחקר עמוק על כל עסק",
    description:
      "כל עסק מקבל בריף מחקר מפורט: מה הם עושים, מה כואב להם, מה הקמפיין האחרון שלהם — כדי שתדע בדיוק מה להגיד לפני שאתה פותח פה.",
  },
  {
    icon: "✉️",
    title: "מיילים קרים בעברית",
    description:
      "אנחנו כותבים מייל מותאם אישית לכל ליד — עם תצפית ספציפית, כאב רלוונטי וקריאה לפעולה ברורה. כל מייל עובר בדיקת איכות לפני שיוצא.",
  },
  {
    icon: "📤",
    title: "שילוב ישיר עם Lemlist",
    description:
      "הלידים הכי חמים נכנסים לקמפיין שלך אוטומטית. מהרגע שהגדרת מה לחפש — אנחנו מטפלים בכל השאר.",
  },
  {
    icon: "📊",
    title: "CRM מלא בדשבורד",
    description:
      "כל הלידים, הציונים, המחקר, טיוטות המיילים וסטטוס הקמפיין — במקום אחד, ממשק אחד, בלי לקפוץ בין כלים.",
  },
];

const steps = [
  { n: "01", label: "חיפוש",    desc: "הגדר ניישה או תחום עסקי" },
  { n: "02", label: "סריקה",    desc: "אנחנו מוצאים מפרסמים פעילים ב-Meta" },
  { n: "03", label: "ניקוד",    desc: "המערכת מדרגת כל ליד מ-1 עד 10" },
  { n: "04", label: "מחקר",     desc: "חקירה מעמיקה של כל עסק" },
  { n: "05", label: "מייל",     desc: "מייל קר בעברית + בדיקת איכות" },
  { n: "06", label: "אאוטריץ׳", desc: "לידים חמים נכנסים ל-Lemlist" },
];

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-black text-white overflow-x-hidden"
      style={{ fontFamily: F, fontWeight: 400 }}>

      {/* ── TOP NAV ───────────────────────────────────────── */}
      <nav className="fixed top-0 inset-x-0 z-20 flex items-center justify-between px-8 py-5"
        style={{ fontFamily: F }}>
        <p style={{ fontWeight: 800, fontSize: "1.1rem", color: "#fff" }}>OutRich</p>
        <Link href="/login">
          <button
            className="rounded-full border border-white/15 px-5 py-2 hover:bg-white/[0.07] transition-colors"
            style={{ fontWeight: 400, fontSize: "0.85rem", color: "rgba(255,255,255,0.6)" }}
          >
            כניסה
          </button>
        </Link>
      </nav>

      {/* ── HERO ──────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
        <WebGLShader />
        <div className="fixed inset-0 bg-black/65 pointer-events-none z-0" />

        <div className="relative z-10 flex flex-col items-center justify-center px-6 text-center max-w-5xl mx-auto">

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8 flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2 backdrop-blur-sm"
            style={{ fontWeight: 300, fontSize: "0.8rem", color: "rgba(255,255,255,0.45)" }}
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400" />
            </span>
            פועל עכשיו · ישראל
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: [24, -4, 0] }}
            transition={{ duration: 0.7, ease: [0.4, 0.0, 0.2, 1], delay: 0.1 }}
            style={{ fontFamily: F, fontWeight: 800, lineHeight: 1 }}
            className="text-6xl md:text-8xl lg:text-[clamp(4rem,9vw,8rem)] tracking-tight"
          >
            <span style={{ display: "block", marginBottom: "0.2em" }}>
              אנחנו מוצאים את הלידים.
            </span>
            <Highlight className="text-white">
              לך נשאר רק לסגור.
            </Highlight>
          </motion.h1>

          {/* Sub */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            style={{ fontWeight: 300, fontSize: "1.15rem", lineHeight: 1.7, color: "rgba(255,255,255,0.5)" }}
            className="mt-7 max-w-2xl"
          >
            אנחנו סורקים את ספריית המודעות של Meta, מנתחים כל עסק, וכותבים לו מייל קר מותאם אישית בעברית —
            הכל אוטומטי, הכל מוכן לשליחה.
          </motion.p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-10 flex flex-col sm:flex-row items-center gap-4"
          >
            <Link href="/login">
              <LiquidButton
                className="text-white border border-white/20 rounded-full"
                size="xl"
                style={{ fontFamily: F, fontWeight: 700, fontSize: "1.05rem" }}
              >
                קבל גישה חינמית
              </LiquidButton>
            </Link>
            <Link href="/login"
              style={{ fontFamily: F, fontWeight: 300, fontSize: "0.9rem", color: "rgba(255,255,255,0.35)" }}
              className="hover:text-white/70 transition-colors"
            >
              יש לך כבר חשבון?{" "}
              <span className="underline underline-offset-2">כניסה</span>
            </Link>
          </motion.div>

          {/* Byline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            style={{ fontWeight: 300, fontSize: "0.75rem", color: "rgba(255,255,255,0.2)", marginTop: "2rem" }}
          >
            OutRich by Legacy Media · ישראל
          </motion.p>
        </div>

        {/* Scroll cue */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1"
        >
          <span style={{ fontWeight: 300, fontSize: "0.65rem", color: "rgba(255,255,255,0.2)", letterSpacing: "0.12em" }}>
            גלול למטה
          </span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 1.6 }}
            className="w-px h-8 bg-gradient-to-b from-white/20 to-transparent"
          />
        </motion.div>
      </section>

      {/* ── BGPattern TRANSITION ──────────────────────────── */}
      <div className="relative h-32 bg-black overflow-hidden">
        <BGPattern variant="grid" mask="fade-y" fill="#222" size={36} />
      </div>

      {/* ── PAIN POINT ───────────────────────────────────── */}
      <section className="relative py-28 px-6 bg-black border-t border-white/5">
        <div className="max-w-3xl mx-auto text-center">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            style={{ fontWeight: 300, fontSize: "1.2rem", lineHeight: 1.75, color: "rgba(255,255,255,0.5)" }}
          >
            כמה שעות בשבוע אתה מבלה בלחפש לידים, לגגל עסקים, לנחש מי יענה —
            ובסוף שולח מייל גנרי שמתעלמים ממנו?
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
            style={{ fontWeight: 800, fontSize: "1.7rem", lineHeight: 1.35, color: "#fff", marginTop: "1.5rem" }}
          >
            אנחנו עושים את כל זה בשבילך. תוך דקות, לא שעות.
          </motion.p>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────── */}
      <section className="relative py-36 px-6 overflow-hidden bg-black">
        <BGPattern variant="grid" mask="fade-edges" fill="#1a1a1a" size={44} />

        <div className="relative z-10 max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-20"
          >
            <p style={{ fontWeight: 400, fontSize: "0.8rem", color: "rgb(129 140 248)", letterSpacing: "0.18em" }}
              className="uppercase mb-4">
              איך זה עובד
            </p>
            <h2 style={{ fontFamily: F, fontWeight: 800, fontSize: "clamp(2.2rem,5vw,3.5rem)", lineHeight: 1.1 }}>
              מחיפוש לאאוטריץ׳ —{" "}
              <Highlight className="text-white">שישה צעדים</Highlight>
            </h2>
            <p style={{ fontWeight: 300, fontSize: "1rem", color: "rgba(255,255,255,0.4)", marginTop: "1rem", maxWidth: "32rem", marginInline: "auto", lineHeight: 1.7 }}>
              אתה מגדיר מה לחפש. אנחנו מטפלים בשאר — מהסריקה ועד השליחה.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
            {steps.map((step, i) => (
              <motion.div
                key={step.n}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="flex flex-col items-center text-center rounded-2xl border border-white/[0.07] bg-white/[0.03] hover:bg-white/[0.06] hover:border-indigo-500/25 transition-all duration-300 group"
                style={{ padding: "2rem 1.25rem" }}
              >
                <span style={{ fontWeight: 400, fontSize: "0.7rem", fontFamily: "monospace", color: "rgba(129,140,248,0.5)", marginBottom: "0.85rem" }}
                  className="group-hover:text-indigo-400 transition-colors">
                  {step.n}
                </span>
                <span style={{ fontWeight: 700, fontSize: "1.05rem", color: "#fff", marginBottom: "0.6rem" }}>
                  {step.label}
                </span>
                <span style={{ fontWeight: 300, fontSize: "0.82rem", color: "rgba(255,255,255,0.38)", lineHeight: 1.55 }}>
                  {step.desc}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────── */}
      <section className="relative py-36 px-6 bg-black">
        <BGPattern variant="dots" mask="fade-y" fill="#1e1e1e" size={28} />

        <div className="relative z-10 max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-20"
          >
            <p style={{ fontWeight: 400, fontSize: "0.8rem", color: "rgb(129 140 248)", letterSpacing: "0.18em" }}
              className="uppercase mb-4">
              מה בפנים
            </p>
            <h2 style={{ fontFamily: F, fontWeight: 800, fontSize: "clamp(2.2rem,5vw,3.5rem)", lineHeight: 1.1 }}>
              הכלי השלם,{" "}
              <Highlight className="text-white">על אוטומט</Highlight>
            </h2>
            <p style={{ fontWeight: 300, fontSize: "1rem", color: "rgba(255,255,255,0.4)", marginTop: "1rem", maxWidth: "32rem", marginInline: "auto", lineHeight: 1.7 }}>
              לא צריך לחבר כלים. לא צריך לכתוב פרומפטים. הכל כבר בנוי בפנים.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.07 }}
                className="group rounded-2xl border border-white/[0.08] bg-white/[0.025] hover:bg-white/[0.05] hover:border-white/[0.15] transition-all duration-300 cursor-default"
                style={{ padding: "2.25rem 2rem" }}
              >
                <div style={{ fontSize: "2.2rem", marginBottom: "1.25rem" }}>{f.icon}</div>
                <h3 style={{ fontWeight: 700, fontSize: "1.15rem", color: "#fff", marginBottom: "0.85rem", lineHeight: 1.3 }}>
                  {f.title}
                </h3>
                <p style={{ fontWeight: 300, fontSize: "0.92rem", color: "rgba(255,255,255,0.45)", lineHeight: 1.75 }}>
                  {f.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS STRIP ───────────────────────────────────── */}
      <section className="relative py-24 px-6 border-t border-b border-white/[0.06] bg-black">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-12 text-center">
          {[
            { prefix: "~3", stat: "דקות", label: "מהחיפוש הראשון ועד מייל מוכן לשליחה" },
            { prefix: "100%", stat: "אוטומטי", label: "סריקה, ניקוד, מחקר, כתיבה — הכל קורה לבד" },
            { prefix: "כל מייל", stat: "בעברית", label: "מותאם אישית לכל עסק, מבוסס מחקר אמיתי" },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="flex flex-col items-center gap-2"
            >
              <div style={{ fontWeight: 800, fontSize: "2.4rem", color: "#fff", lineHeight: 1.1 }}>
                {item.prefix}{" "}
                <span style={{ color: "rgb(129,140,248)" }}>{item.stat}</span>
              </div>
              <p style={{ fontWeight: 300, fontSize: "0.85rem", color: "rgba(255,255,255,0.38)", lineHeight: 1.6, maxWidth: "180px" }}>
                {item.label}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────── */}
      <section className="relative py-48 px-6 overflow-hidden bg-black">
        <BGPattern variant="diagonal-stripes" mask="fade-edges" fill="#0f0f0f" size={32} />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[700px] h-[350px] bg-indigo-600/10 rounded-full blur-[130px]" />
        </div>

        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            style={{ fontWeight: 400, fontSize: "0.8rem", color: "rgb(129 140 248)", letterSpacing: "0.18em" }}
            className="uppercase mb-6"
          >
            מוכן להתחיל?
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.05 }}
            style={{ fontFamily: F, fontWeight: 800, fontSize: "clamp(2.2rem,5vw,3.8rem)", lineHeight: 1, marginBottom: "1.5rem" }}
          >
            <span style={{ display: "block", marginBottom: "0.2em" }}>
              תפסיק לחפש לידים.
            </span>
            <Highlight className="text-white">אנחנו עושים את זה בשבילך.</Highlight>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
            style={{ fontWeight: 300, fontSize: "1.05rem", color: "rgba(255,255,255,0.42)", marginBottom: "3rem", lineHeight: 1.7 }}
          >
            הרשם, הגדר ניישה — ותוך דקות יהיו לך לידים חמים עם מיילים מוכנים לשליחה.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.25 }}
            className="flex items-center justify-center"
          >
            <Link href="/login">
              <LiquidButton
                className="text-white border border-white/20 rounded-full"
                size="xl"
                style={{ fontFamily: F, fontWeight: 700, fontSize: "1.05rem" }}
              >
                התחל עכשיו — בחינם
              </LiquidButton>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────── */}
      <footer className="border-t border-white/[0.05] py-10 px-6 text-center">
        <p style={{ fontWeight: 700, fontSize: "0.9rem", color: "rgba(255,255,255,0.28)", marginBottom: "0.25rem" }}>
          OutRich by Legacy Media
        </p>
        <p style={{ fontWeight: 300, fontSize: "0.75rem", color: "rgba(255,255,255,0.18)" }}>
          © {new Date().getFullYear()} כל הזכויות שמורות · ישראל
        </p>
      </footer>
    </div>
  );
}
