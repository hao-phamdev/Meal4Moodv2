"use client";
import { useState } from "react";

const QUICK_REMIXES = [
  { label: "🌶️ Spicier", instruction: "Make it spicier" },
  { label: "⚡ Faster", instruction: "Make it faster — cut the total cook time as much as you can" },
  { label: "🥦 Vegetarian", instruction: "Make it vegetarian" },
  { label: "🧺 Fewer ingredients", instruction: "Use fewer ingredients — keep only the essentials" },
  { label: "🧒 Kid-friendly", instruction: "Make it kid-friendly" },
  { label: "🥂 Fancier", instruction: "Make it fancy enough for a dinner party" },
];

interface Props {
  onRefine: (instruction: string) => void;
  busy: boolean;
}

export default function RemixBar({ onRefine, busy }: Props) {
  const [text, setText] = useState("");

  const submit = () => {
    const t = text.trim();
    if (t.length < 2 || busy) return;
    onRefine(t);
    setText("");
  };

  return (
    <div style={{
      marginTop: 16,
      background: "var(--card-bg)",
      border: "0.5px solid var(--border-tertiary)",
      borderRadius: 12,
      padding: "14px 16px",
      position: "relative",
      overflow: "hidden",
    }}>
      {busy && (
        <span style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "linear-gradient(90deg,transparent,rgba(26,107,58,0.08),transparent)",
          animation: "shimmer 1.4s infinite",
        }}/>
      )}
      <div style={{
        fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.08em",
        color: "var(--text-tertiary)", marginBottom: 10,
      }}>
        {busy ? "Chef Mira is reworking the recipe…" : "Remix with the chef"}
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {QUICK_REMIXES.map(r => (
          <button
            key={r.label}
            disabled={busy}
            onClick={() => onRefine(r.instruction)}
            style={{
              background: "var(--m4m-surface)", color: "var(--m4m-deep)",
              border: "0.5px solid var(--m4m-border)", borderRadius: 999,
              padding: "6px 12px", fontSize: 12, fontWeight: 500,
              cursor: busy ? "not-allowed" : "pointer", opacity: busy ? 0.6 : 1,
              transition: "opacity 150ms",
            }}>
            {r.label}
          </button>
        ))}
      </div>

      <form
        onSubmit={e => { e.preventDefault(); submit(); }}
        style={{ display: "flex", gap: 8, marginTop: 10 }}>
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          maxLength={200}
          disabled={busy}
          placeholder="…or tell the chef: “swap the chicken for shrimp”"
          aria-label="Describe a change to the recipe"
          style={{
            flex: 1, minWidth: 0, height: 36, padding: "0 12px",
            borderRadius: 8, border: "0.5px solid var(--m4m-border)",
            background: "var(--page-bg)", color: "var(--text-primary)", fontSize: 13,
          }}
        />
        <button
          type="submit"
          disabled={busy || text.trim().length < 2}
          style={{
            height: 36, padding: "0 16px", borderRadius: 8, border: "none",
            background: busy || text.trim().length < 2 ? "#D3D1C7" : "var(--m4m-brand)",
            color: busy || text.trim().length < 2 ? "#888780" : "#fff",
            fontSize: 13, fontWeight: 500,
            cursor: busy || text.trim().length < 2 ? "not-allowed" : "pointer",
          }}>
          Remix
        </button>
      </form>
    </div>
  );
}
