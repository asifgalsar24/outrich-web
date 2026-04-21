"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const F = "var(--font-osh), sans-serif";

export default function LoginPage() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError("אימייל או סיסמה שגויים. נסה שוב.");
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  }

  return (
    <div
      className="min-h-screen bg-black flex items-center justify-center px-4"
      style={{ fontFamily: F }}
      dir="rtl"
    >
      {/* Subtle glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[500px] h-[300px] bg-indigo-600/8 rounded-full blur-[120px]" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <p style={{ fontWeight: 800, fontSize: "1.8rem", color: "#fff", letterSpacing: "-0.02em" }}>
            OutRich
          </p>
          <p style={{ fontWeight: 300, fontSize: "0.85rem", color: "rgba(255,255,255,0.35)", marginTop: "0.25rem" }}>
            by Legacy Media
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-8">
          <h1 style={{ fontWeight: 700, fontSize: "1.3rem", color: "#fff", marginBottom: "0.4rem" }}>
            כניסה לחשבון
          </h1>
          <p style={{ fontWeight: 300, fontSize: "0.85rem", color: "rgba(255,255,255,0.38)", marginBottom: "2rem" }}>
            הכנס את הפרטים שלך להמשך
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label
                htmlFor="email"
                style={{ fontWeight: 400, fontSize: "0.8rem", color: "rgba(255,255,255,0.5)", display: "block", marginBottom: "0.4rem" }}
              >
                אימייל
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full rounded-xl border border-white/[0.1] bg-white/[0.05] px-4 py-3 text-white placeholder:text-white/20 outline-none focus:border-indigo-500/60 focus:bg-white/[0.07] transition-all"
                style={{ fontFamily: F, fontWeight: 400, fontSize: "0.95rem" }}
                dir="ltr"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                style={{ fontWeight: 400, fontSize: "0.8rem", color: "rgba(255,255,255,0.5)", display: "block", marginBottom: "0.4rem" }}
              >
                סיסמה
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full rounded-xl border border-white/[0.1] bg-white/[0.05] px-4 py-3 text-white placeholder:text-white/20 outline-none focus:border-indigo-500/60 focus:bg-white/[0.07] transition-all"
                style={{ fontFamily: F, fontWeight: 400, fontSize: "0.95rem" }}
                dir="ltr"
              />
            </div>

            {error && (
              <p style={{ fontWeight: 400, fontSize: "0.82rem", color: "rgb(248 113 113)" }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed py-3 text-white transition-colors"
              style={{ fontFamily: F, fontWeight: 700, fontSize: "1rem" }}
            >
              {loading ? "מתחבר..." : "כניסה"}
            </button>
          </form>
        </div>

        <p style={{ textAlign: "center", fontWeight: 300, fontSize: "0.82rem", color: "rgba(255,255,255,0.3)", marginTop: "1.5rem" }}>
          אין לך חשבון?{" "}
          <a href="/signup" style={{ color: "rgba(129,140,248,0.8)", textDecoration: "none", fontWeight: 500 }}>
            הרשמה
          </a>
        </p>
        <p style={{ textAlign: "center", fontWeight: 300, fontSize: "0.78rem", color: "rgba(255,255,255,0.15)", marginTop: "0.75rem" }}>
          © {new Date().getFullYear()} Legacy Media
        </p>
      </div>
    </div>
  );
}
