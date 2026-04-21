"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
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
      className="flex h-screen bg-[#080808] text-white overflow-hidden"
      style={{ fontFamily: F }}
      dir="rtl"
    >
      {/* ── Sidebar ─────────────────────────────────────── */}
      <aside className="flex flex-col w-56 shrink-0 border-l border-white/[0.07] bg-[#0d0d0d]">
        {/* Brand */}
        <div className="px-5 py-6 border-b border-white/[0.06]">
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
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150"
                style={{
                  fontWeight: active ? 700 : 400,
                  fontSize: "0.9rem",
                  color: active ? "#fff" : "rgba(255,255,255,0.42)",
                  background: active ? "rgba(99,102,241,0.12)" : "transparent",
                  border: active ? "1px solid rgba(99,102,241,0.2)" : "1px solid transparent",
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
          <p style={{ fontWeight: 400, fontSize: "0.75rem", color: "rgba(255,255,255,0.35)", marginBottom: "0.6rem" }}
            className="truncate">
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
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
