"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { GlassEffect } from "@/components/ui/liquid-glass";

const F = "var(--font-osh), sans-serif";

export default function KpiCard({
  label,
  value,
  color,
  glowColor,
  index,
}: {
  label: string;
  value: number;
  color: string;
  glowColor: string;
  index: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let start: number | null = null;
    const duration = 1200;
    function step(ts: number) {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el!.textContent = String(Math.round(eased * value));
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }, [value]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
    >
      <GlassEffect className="rounded-2xl" interactive glowColor={glowColor}>
        <div className="p-6" style={{ fontFamily: F }}>
          <span
            ref={ref}
            style={{ fontWeight: 800, fontSize: "2.4rem", color, lineHeight: 1, display: "block" }}
          >
            0
          </span>
          <p style={{ fontWeight: 400, fontSize: "0.82rem", color: "rgba(255,255,255,0.4)", marginTop: "0.5rem" }}>
            {label}
          </p>
        </div>
      </GlassEffect>
    </motion.div>
  );
}
