"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const F = "var(--font-osh), sans-serif";

export default function PricingCTA({ loggedIn }: { loggedIn: boolean }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleClick() {
    if (!loggedIn) {
      router.push("/signup");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/stripe/checkout", { method: "POST" });
    const { url, error } = await res.json();
    if (error || !url) {
      setLoading(false);
      alert("שגיאה בפתיחת דף התשלום. נסה שוב.");
      return;
    }
    window.location.href = url;
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="w-full rounded-2xl py-4 transition-all hover:opacity-90 disabled:opacity-50"
      style={{
        fontFamily: F,
        fontWeight: 800,
        fontSize: "1.1rem",
        background: "rgb(99,102,241)",
        color: "#fff",
        letterSpacing: "-0.01em",
      }}
    >
      {loading ? "מעביר לתשלום..." : loggedIn ? "שדרג עכשיו" : "התחל ניסיון חינם של 7 ימים"}
    </button>
  );
}
