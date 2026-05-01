"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { GlassFilter } from "@/components/ui/liquid-glass";
import type { User } from "@supabase/supabase-js";

const F = "var(--font-osh), sans-serif";

const navItems = [
  { href: "/dashboard",           label: "סקירה",   icon: "◈" },
  { href: "/dashboard/leads",     label: "לידים",   icon: "◎" },
  { href: "/dashboard/settings",  label: "הגדרות",  icon: "⊙" },
];

export default function DashboardShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user: User;
}) {
  const pathname = usePathname();
  const router   = useRouter();
  const supabase = createClient();
  const [signingOut, setSigningOut] = useState(false);

  async function signOut() {
    setSigningOut(true);
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <div
      className="flex h-screen text-white overflow-hidden"
      style={{
        fontFamily: F,
        background:
          "radial-gradient(ellipse at 25% 65%, rgba(99,102,241,0.12) 0%, transparent 50%), " +
          "radial-gradient(ellipse at 75% 20%, rgba(139,92,246,0.08) 0%, transparent 50%), " +
          "#080808",
      }}
      dir="rtl"
    >
      {/* SVG filter for liquid glass distortion — render once for the whole app */}
      <GlassFilter />

      {/* ── Sidebar (desktop only) ───────────────────────── */}
      <aside
        className="hidden md:flex flex-col w-56 shrink-0 border-l border-white/[0.1]"
        style={{
          backdropFilter: "blur(24px) saturate(160%)",
          background: "rgba(8,8,8,0.78)",
          boxShadow: "inset -1px 0 0 rgba(255,255,255,0.06)",
        }}
      >
        {/* Brand */}
        <div
          className="px-5 py-6 border-b border-white/[0.06]"
          style={{ backdropFilter: "none" }}
        >
          <p style={{ fontWeight: 800, fontSize: "1.2rem", color: "#fff" }}>OutRich</p>
          <p style={{ fontWeight: 300, fontSize: "0.72rem", color: "rgba(255,255,255,0.3)", marginTop: "1px" }}>
            Legacy Media
          </p>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-1 px-3 py-4 flex-1">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200"
                style={{
                  fontWeight: active ? 700 : 400,
                  fontSize: "0.9rem",
                  color: active ? "#fff" : "rgba(255,255,255,0.42)",
                  background: active
                    ? "rgba(255,255,255,0.08)"
                    : "transparent",
                  border: active
                    ? "1px solid rgba(255,255,255,0.12)"
                    : "1px solid transparent",
                  backdropFilter: active ? "blur(8px)" : "none",
                  boxShadow: active
                    ? "inset 1px 1px 0 rgba(255,255,255,0.1), inset -1px -1px 0 rgba(255,255,255,0.03)"
                    : "none",
                }}
              >
                <span style={{ fontSize: "0.85rem", opacity: 0.7 }}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Back to site */}
        <div className="px-3 pb-2">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 rounded-xl transition-colors hover:bg-white/[0.05]"
            style={{ fontWeight: 300, fontSize: "0.8rem", color: "rgba(255,255,255,0.25)" }}
          >
            ← חזרה לאתר
          </Link>
        </div>

        {/* User */}
        <div className="px-4 py-4 border-t border-white/[0.06]">
          <p
            style={{ fontWeight: 400, fontSize: "0.75rem", color: "rgba(255,255,255,0.35)", marginBottom: "0.6rem" }}
            className="truncate"
          >
            {user.email}
          </p>
          <button
            onClick={signOut}
            disabled={signingOut}
            className="w-full text-right rounded-lg px-3 py-2 transition-colors hover:bg-white/[0.05]"
            style={{ fontWeight: 400, fontSize: "0.8rem", color: "rgba(255,255,255,0.3)" }}
          >
            {signingOut ? "יוצא..." : "יציאה"}
          </button>
        </div>
      </aside>

      {/* ── Main ────────────────────────────────────────── */}
      <main className="flex-1 overflow-auto pb-16 md:pb-0">
        {children}
      </main>

      {/* ── Bottom nav (mobile only) ─────────────────────── */}
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 z-50 flex items-center justify-around border-t border-white/[0.1]"
        style={{
          height: "60px",
          fontFamily: F,
          backdropFilter: "blur(20px) saturate(160%)",
          background: "rgba(8,8,8,0.85)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.07)",
        }}
        dir="rtl"
      >
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors"
              style={{
                color: active ? "rgb(129,140,248)" : "rgba(255,255,255,0.3)",
                background: active ? "rgba(99,102,241,0.07)" : "transparent",
              }}
            >
              <span style={{ fontSize: "1rem" }}>{item.icon}</span>
              <span style={{ fontSize: "0.65rem", fontWeight: active ? 700 : 400 }}>{item.label}</span>
            </Link>
          );
        })}
        <button
          onClick={signOut}
          disabled={signingOut}
          className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors"
          style={{ color: "rgba(255,255,255,0.25)", background: "transparent" }}
        >
          <span style={{ fontSize: "1rem" }}>⏻</span>
          <span style={{ fontSize: "0.65rem", fontWeight: 400 }}>{signingOut ? "..." : "יציאה"}</span>
        </button>
      </nav>
    </div>
  );
}
