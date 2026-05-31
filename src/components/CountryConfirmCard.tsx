"use client";
import { motion } from "framer-motion";
import type { CountryData } from "@/components/Globe";

interface Props {
  country: CountryData;
  onGenerate: () => void;
  onDismiss: () => void;
}

export default function CountryConfirmCard({ country, onGenerate, onDismiss }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 12, scale: 0.96 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      style={{
        position: "absolute", left: 16, bottom: 16, right: 16,
        background: "var(--card-bg)",
        border: "0.5px solid var(--m4m-light)",
        borderRadius: 12, padding: "16px 20px",
        boxShadow: "0 12px 32px rgba(13,61,34,0.10)",
        zIndex: 10,
      }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
        <div style={{ fontSize: 32, lineHeight: 1 }}>{country.flag}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 18, fontWeight: 500, color: "var(--text-primary)", lineHeight: 1.3 }}>
            {country.name}
          </div>
          <div style={{ marginTop: 4 }}>
            <span style={{
              display: "inline-block", fontSize: 11, fontWeight: 500,
              padding: "3px 8px", borderRadius: 20,
              background: "var(--m4m-surface)", color: "var(--m4m-deep)",
            }}>{country.cuisine} cuisine</span>
          </div>
        </div>
        <button onClick={onDismiss} aria-label="Close" style={{
          background: "transparent", border: "none", cursor: "pointer",
          color: "var(--text-tertiary)", padding: 4, lineHeight: 0,
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <div style={{ fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-tertiary)", marginBottom: 6 }}>
        Signature dishes
      </div>
      <ul style={{ listStyle: "none", padding: 0, margin: "0 0 16px 0" }}>
        {country.dishes.map((d, i) => (
          <li key={i} style={{ fontSize: 13, color: "var(--text-secondary)", padding: "4px 0", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 4, height: 4, borderRadius: 999, background: "var(--m4m-active)", display: "inline-block", flexShrink: 0 }}/>
            {d}
          </li>
        ))}
      </ul>

      <div style={{ display: "flex", gap: 8 }}>
        <button
          data-kind="primary"
          onClick={onGenerate}
          style={{
            flex: 1, background: "var(--m4m-brand)", color: "#fff", border: "none",
            height: 36, borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: "pointer",
            transition: "background 200ms ease-in-out",
          }}>
          Generate Recipe
        </button>
        <button
          data-kind="ghost"
          onClick={onDismiss}
          style={{
            background: "transparent", color: "var(--m4m-brand)",
            border: "0.5px solid var(--m4m-border)",
            height: 36, padding: "0 16px", borderRadius: 8,
            fontSize: 13, fontWeight: 500, cursor: "pointer",
            transition: "background 200ms ease-in-out",
          }}>
          Keep Exploring
        </button>
      </div>
    </motion.div>
  );
}
