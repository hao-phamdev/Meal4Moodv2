"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { AiMeta } from "@/lib/types";

interface Props {
  meta: AiMeta;
  session: { calls: number; costUsd: number };
}

const usd = (n: number) => `$${n < 0.01 ? n.toFixed(5) : n.toFixed(3)}`;
const num = (n: number) => n.toLocaleString("en-US");

export default function UnderTheHood({ meta, session }: Props) {
  const [open, setOpen] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const t = meta.tokens;

  const stats = [
    { label: "Model", value: `${meta.model} · ${meta.effort} effort` },
    { label: "Tokens in / out", value: `${num(t.input + t.cacheRead + t.cacheWrite)} / ${num(t.output)}` },
    { label: "From cache", value: t.cacheRead ? `${num(t.cacheRead)} tokens (90% off)` : t.cacheWrite ? "cache warmed" : "—" },
    { label: "This call", value: `${usd(meta.costUsd)} · ${(meta.latencyMs / 1000).toFixed(1)}s` },
    { label: "This session", value: `${usd(session.costUsd)} · ${session.calls} call${session.calls === 1 ? "" : "s"}` },
  ];

  return (
    <div style={{
      marginTop: 16,
      background: "var(--card-bg)",
      border: "0.5px solid var(--border-tertiary)",
      borderRadius: 12,
    }}>
      <button
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        style={{
          width: "100%", background: "transparent", border: "none", cursor: "pointer",
          padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between",
          color: "var(--text-secondary)", fontSize: 13, fontWeight: 500,
        }}>
        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
          </svg>
          Under the hood
          <span style={{ color: "var(--text-tertiary)", fontWeight: 400 }}>
            · {meta.patterns.length} prompt patterns · {usd(meta.costUsd)}
          </span>
        </span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0)", transition: "transform 200ms" }}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: "hidden" }}>
            <div style={{ padding: "0 16px 16px" }}>
              {/* Stats */}
              <div style={{
                display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                gap: 8, marginBottom: 16,
              }}>
                {stats.map(s => (
                  <div key={s.label} style={{
                    background: "var(--m4m-surface)", border: "0.5px solid var(--m4m-light)",
                    borderRadius: 8, padding: "8px 10px",
                  }}>
                    <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--m4m-mid)" }}>{s.label}</div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "var(--m4m-deep)", marginTop: 2, fontVariantNumeric: "tabular-nums" }}>{s.value}</div>
                  </div>
                ))}
              </div>

              {/* Patterns */}
              <div style={{ fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-tertiary)", marginBottom: 8 }}>
                Prompt engineering in this call
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 8 }}>
                {meta.patterns.map(p => (
                  <li key={p.name} style={{ display: "flex", gap: 10, fontSize: 13, lineHeight: 1.5 }}>
                    <span style={{
                      flexShrink: 0, alignSelf: "flex-start",
                      background: "var(--m4m-brand)", color: "#fff",
                      fontSize: 11, fontWeight: 500, padding: "2px 8px", borderRadius: 999, whiteSpace: "nowrap",
                    }}>{p.name}</span>
                    <span style={{ color: "var(--text-secondary)" }}>{p.how}</span>
                  </li>
                ))}
              </ul>

              {/* Raw prompt */}
              <button
                onClick={() => setShowPrompt(s => !s)}
                style={{
                  marginTop: 14, background: "transparent", border: "none", padding: 0, cursor: "pointer",
                  color: "var(--m4m-brand)", fontSize: 13, fontWeight: 500,
                }}>
                {showPrompt ? "Hide the exact prompt" : "Show the exact prompt sent to Claude"}
              </button>
              {showPrompt && (
                <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
                  <PromptBlock role="system" content={meta.prompt.system} />
                  {meta.prompt.messages.map((m, i) => (
                    <PromptBlock key={i} role={m.role} content={m.content} />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PromptBlock({ role, content }: { role: string; content: string }) {
  return (
    <div>
      <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-tertiary)", marginBottom: 4 }}>
        {role}
      </div>
      <pre style={{
        margin: 0, maxHeight: 260, overflow: "auto",
        background: "var(--page-bg)", border: "0.5px solid var(--border-tertiary)", borderRadius: 8,
        padding: "10px 12px", fontSize: 11.5, lineHeight: 1.55, color: "var(--text-secondary)",
        whiteSpace: "pre-wrap", wordBreak: "break-word",
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
      }}>{content}</pre>
    </div>
  );
}
