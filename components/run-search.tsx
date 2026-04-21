"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

const F = "var(--font-osh), sans-serif";

const QUICK_SEARCHES = [
  "מסעדות", "קליניקות שיניים", "חדרי כושר", "נדל״ן", "עורכי דין", "סטודיו לעיצוב",
];

const MAX_LEADS_OPTIONS = [10, 20, 50];

type LogLine = { id: number; text: string; type: "status" | "done" | "error" };

export default function RunSearch() {
  const [open, setOpen]           = useState(false);
  const [keyword, setKeyword]     = useState("");
  const [maxLeads, setMaxLeads]   = useState(20);
  const [running, setRunning]     = useState(false);
  const [done, setDone]           = useState(false);
  const [log, setLog]             = useState<LogLine[]>([]);
  const logEndRef                 = useRef<HTMLDivElement>(null);
  const idRef                     = useRef(0);
  const router                    = useRouter();

  // Auto-scroll log to bottom
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [log]);

  function addLog(text: string, type: LogLine["type"] = "status") {
    setLog((prev) => [...prev, { id: idRef.current++, text, type }]);
  }

  function reset() {
    setKeyword("");
    setMaxLeads(20);
    setRunning(false);
    setDone(false);
    setLog([]);
  }

  function handleClose() {
    if (running) return; // block close mid-run
    setOpen(false);
    setTimeout(reset, 300);
  }

  async function handleRun() {
    if (!keyword.trim() || running) return;
    setRunning(true);
    setDone(false);
    setLog([]);
    addLog(`מתחיל חיפוש: "${keyword.trim()}" · ${maxLeads} לידים`);

    try {
      const res = await fetch("/api/pipeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword: keyword.trim(), max_leads: maxLeads }),
      });

      if (!res.ok || !res.body) {
        addLog("שגיאה: שרת הפייפליין לא זמין. וודא שה-bot רץ.", "error");
        setRunning(false);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done: streamDone, value } = await reader.read();
        if (streamDone) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const payload = JSON.parse(line.slice(6));
            if (payload.type === "status") {
              addLog(payload.message, "status");
            } else if (payload.type === "done") {
              addLog("✅ הפייפליין הסתיים בהצלחה!", "done");
              setDone(true);
              router.refresh(); // Reload server component data so new leads appear
            } else if (payload.type === "error") {
              addLog(`❌ שגיאה: ${payload.message}`, "error");
            }
          } catch { /* malformed chunk */ }
        }
      }
    } catch (err) {
      addLog("שגיאת רשת — בדוק שה-bot רץ.", "error");
    }

    setRunning(false);
  }

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-xl px-4 py-2.5 transition-all hover:opacity-90"
        style={{
          fontFamily: F, fontWeight: 700, fontSize: "0.9rem",
          background: "rgb(99,102,241)",
          color: "#fff",
        }}
      >
        <span style={{ fontSize: "1rem" }}>+</span>
        חיפוש חדש
      </button>

      {/* Modal */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            />

            {/* Panel */}
            <motion.div
              key="modal"
              initial={{ opacity: 0, scale: 0.97, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 8 }}
              transition={{ duration: 0.2 }}
              className="fixed z-50 inset-x-0 top-1/2 -translate-y-1/2 mx-auto flex flex-col"
              style={{
                width: "min(560px, 90vw)",
                maxHeight: "85vh",
                background: "#111",
                border: "1px solid rgba(255,255,255,0.09)",
                borderRadius: "1.25rem",
                fontFamily: F,
              }}
              dir="rtl"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.07]">
                <div>
                  <p style={{ fontWeight: 800, fontSize: "1.1rem", color: "#fff" }}>
                    חיפוש חדש
                  </p>
                  <p style={{ fontWeight: 300, fontSize: "0.8rem", color: "rgba(255,255,255,0.35)", marginTop: "2px" }}>
                    הגדר ניישה ואנחנו מטפלים בשאר
                  </p>
                </div>
                {!running && (
                  <button
                    onClick={handleClose}
                    className="rounded-lg p-1.5 hover:bg-white/[0.07] transition-colors"
                    style={{ color: "rgba(255,255,255,0.35)", fontSize: "1rem" }}
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">

                {/* Keyword input */}
                {!running && !done && (
                  <>
                    <div>
                      <label style={{ fontWeight: 700, fontSize: "0.78rem", color: "rgba(255,255,255,0.45)", display: "block", marginBottom: "0.5rem", letterSpacing: "0.06em" }}>
                        תחום / ניישה
                      </label>
                      <input
                        type="text"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleRun()}
                        placeholder="לדוגמה: מסעדות, חדרי כושר, נדל״ן..."
                        autoFocus
                        className="w-full rounded-xl border border-white/[0.1] bg-white/[0.04] px-4 py-3 text-white placeholder:text-white/20 outline-none focus:border-indigo-500/60 focus:bg-white/[0.06] transition-all"
                        style={{ fontFamily: F, fontWeight: 400, fontSize: "1rem" }}
                        dir="rtl"
                      />
                    </div>

                    {/* Quick picks */}
                    <div>
                      <p style={{ fontWeight: 400, fontSize: "0.75rem", color: "rgba(255,255,255,0.3)", marginBottom: "0.5rem" }}>
                        חיפושים מהירים:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {QUICK_SEARCHES.map((q) => (
                          <button
                            key={q}
                            onClick={() => setKeyword(q)}
                            className="rounded-lg px-3 py-1.5 transition-all hover:border-indigo-500/40"
                            style={{
                              fontFamily: F, fontWeight: 400, fontSize: "0.82rem",
                              background: keyword === q ? "rgba(99,102,241,0.15)" : "rgba(255,255,255,0.04)",
                              border: keyword === q ? "1px solid rgba(99,102,241,0.35)" : "1px solid rgba(255,255,255,0.08)",
                              color: keyword === q ? "rgb(129,140,248)" : "rgba(255,255,255,0.45)",
                            }}
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Max leads */}
                    <div>
                      <label style={{ fontWeight: 700, fontSize: "0.78rem", color: "rgba(255,255,255,0.45)", display: "block", marginBottom: "0.5rem", letterSpacing: "0.06em" }}>
                        כמות לידים
                      </label>
                      <div className="flex gap-2">
                        {MAX_LEADS_OPTIONS.map((n) => (
                          <button
                            key={n}
                            onClick={() => setMaxLeads(n)}
                            className="flex-1 rounded-xl py-2.5 transition-all"
                            style={{
                              fontFamily: F, fontWeight: maxLeads === n ? 700 : 400, fontSize: "0.9rem",
                              background: maxLeads === n ? "rgba(99,102,241,0.15)" : "rgba(255,255,255,0.04)",
                              border: maxLeads === n ? "1px solid rgba(99,102,241,0.35)" : "1px solid rgba(255,255,255,0.08)",
                              color: maxLeads === n ? "rgb(129,140,248)" : "rgba(255,255,255,0.4)",
                            }}
                          >
                            {n}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Live log */}
                {(running || log.length > 0) && (
                  <div
                    className="rounded-xl p-4 flex flex-col gap-1.5 overflow-y-auto"
                    style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.06)", minHeight: "180px", maxHeight: "280px" }}
                  >
                    {log.map((line) => (
                      <motion.p
                        key={line.id}
                        initial={{ opacity: 0, x: 6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2 }}
                        style={{
                          fontFamily: F,
                          fontWeight: line.type === "done" ? 700 : 300,
                          fontSize: "0.85rem",
                          lineHeight: 1.55,
                          color: line.type === "done"
                            ? "rgb(74,222,128)"
                            : line.type === "error"
                            ? "rgb(248,113,113)"
                            : "rgba(255,255,255,0.65)",
                        }}
                      >
                        {line.text}
                      </motion.p>
                    ))}
                    {running && (
                      <motion.span
                        animate={{ opacity: [1, 0.3, 1] }}
                        transition={{ repeat: Infinity, duration: 1 }}
                        style={{ fontWeight: 300, fontSize: "0.85rem", color: "rgba(255,255,255,0.3)" }}
                      >
                        ●
                      </motion.span>
                    )}
                    <div ref={logEndRef} />
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-white/[0.07] flex items-center justify-between gap-3">
                {done ? (
                  <>
                    <button
                      onClick={() => { setOpen(false); router.push("/dashboard/leads"); }}
                      className="flex-1 rounded-xl py-3 transition-colors"
                      style={{ fontFamily: F, fontWeight: 700, fontSize: "0.95rem", background: "rgba(74,222,128,0.12)", border: "1px solid rgba(74,222,128,0.3)", color: "rgb(74,222,128)" }}
                    >
                      ראה לידים חדשים ←
                    </button>
                    <button
                      onClick={reset}
                      className="rounded-xl px-4 py-3 transition-colors hover:bg-white/[0.06]"
                      style={{ fontFamily: F, fontWeight: 400, fontSize: "0.85rem", color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.08)" }}
                    >
                      חיפוש נוסף
                    </button>
                  </>
                ) : running ? (
                  <p style={{ fontWeight: 300, fontSize: "0.82rem", color: "rgba(255,255,255,0.3)" }}>
                    הפייפליין רץ... אל תסגור את החלון
                  </p>
                ) : (
                  <>
                    <button
                      onClick={handleRun}
                      disabled={!keyword.trim()}
                      className="flex-1 rounded-xl py-3 transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90"
                      style={{ fontFamily: F, fontWeight: 700, fontSize: "0.95rem", background: "rgb(99,102,241)", color: "#fff" }}
                    >
                      הפעל חיפוש
                    </button>
                    <button
                      onClick={handleClose}
                      className="rounded-xl px-4 py-3 transition-colors hover:bg-white/[0.06]"
                      style={{ fontFamily: F, fontWeight: 400, fontSize: "0.85rem", color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.08)" }}
                    >
                      ביטול
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
