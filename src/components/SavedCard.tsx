"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Recipe } from "@/lib/types";
import NearbyRestaurants from "@/components/NearbyRestaurants";

interface Props {
  recipe: Recipe;
  onDelete: (id: string) => void;
}

export default function SavedCard({ recipe, onDelete }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [nearbyOpen, setNearbyOpen] = useState(false);

  return (
    <motion.div
      layout
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      style={{
        background: "var(--card-bg)",
        border: "0.5px solid var(--border-tertiary)",
        borderRadius: 12, overflow: "hidden",
      }}>

      {/* Hero */}
      <div style={{ position: "relative", aspectRatio: "16/10" }}>
        <img src={recipe.imageUrl} alt={recipe.title}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}/>
        <div style={{ position: "absolute", top: 8, left: 8, display: "flex", gap: 6 }}>
          <span style={{ background: "rgba(255,255,255,0.92)", color: "var(--m4m-deep)", fontSize: 11, fontWeight: 500, padding: "3px 8px", borderRadius: 20 }}>
            {recipe.flag} {recipe.cuisine}
          </span>
          <span style={{ background: "var(--m4m-brand)", color: "#fff", fontSize: 11, fontWeight: 500, padding: "3px 8px", borderRadius: 20 }}>
            {recipe.cookTime} min
          </span>
        </div>
      </div>

      <div style={{ padding: 16 }}>
        <h3 style={{ fontSize: 18, fontWeight: 500, color: "var(--text-primary)", margin: 0, lineHeight: 1.3 }}>
          {recipe.title}
        </h3>
        <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "4px 0 12px 0", lineHeight: 1.6 }}>
          {recipe.description}
        </p>

        {/* Actions row */}
        <div style={{ display: "flex", gap: 6 }}>
          {!confirmDelete && (
            <button
              data-kind="secondary"
              onClick={() => setExpanded(e => !e)}
              aria-expanded={expanded}
              style={{
                background: "var(--m4m-surface)", color: "#1A4D28",
                border: "0.5px solid var(--m4m-border)",
                height: 36, padding: "0 16px", borderRadius: 8,
                fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "inherit",
                transition: "background 200ms ease-in-out",
              }}>
              {expanded ? "Hide" : "View"} recipe
            </button>
          )}

          {confirmDelete ? (
            <>
              <button
                data-kind="ghost"
                onClick={() => setConfirmDelete(false)}
                style={{
                  background: "transparent", color: "var(--m4m-brand)",
                  border: "0.5px solid var(--m4m-border)",
                  height: 36, padding: "0 12px", borderRadius: 8,
                  fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "inherit",
                }}>
                Cancel
              </button>
              <button
                onClick={() => recipe.id && onDelete(recipe.id)}
                style={{
                  background: "#FCEBEB", color: "#A32D2D",
                  border: "0.5px solid #E24B4A",
                  height: 36, padding: "0 12px", borderRadius: 8,
                  fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "inherit",
                }}>
                Confirm delete
              </button>
            </>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              aria-label="Delete recipe"
              style={{
                background: "transparent", border: "0.5px solid var(--border-tertiary)",
                color: "var(--text-tertiary)",
                width: 36, height: 36, borderRadius: 8, cursor: "pointer",
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                marginLeft: "auto", transition: "all 200ms",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = "#A32D2D"; (e.currentTarget as HTMLButtonElement).style.borderColor = "#E24B4A"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = "var(--text-tertiary)"; (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border-tertiary)"; }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6"/>
              </svg>
            </button>
          )}
        </div>

        {/* Expandable steps */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              style={{ overflow: "hidden" }}>
              <div style={{ paddingTop: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-tertiary)", marginBottom: 8 }}>
                  Steps
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {recipe.steps.map((s, i) => (
                    <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                      <span style={{
                        flexShrink: 0, width: 22, height: 22, borderRadius: "50%",
                        background: "var(--m4m-surface)", border: "0.5px solid var(--m4m-border)",
                        color: "var(--m4m-brand)", fontSize: 11, fontWeight: 600,
                        display: "inline-flex", alignItems: "center", justifyContent: "center",
                      }}>{i + 1}</span>
                      <span style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.7 }}>{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Nearby restaurants */}
        <button
          onClick={() => setNearbyOpen(o => !o)}
          aria-expanded={nearbyOpen}
          style={{
            marginTop: 12, width: "100%", background: "transparent",
            border: "0.5px solid var(--m4m-border)", color: "var(--m4m-brand)",
            borderRadius: 8, height: 36, fontSize: 13, fontWeight: 500,
            fontFamily: "inherit", cursor: "pointer",
            display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
            transition: "background 200ms",
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(151,196,89,0.10)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          {nearbyOpen ? "Hide nearby restaurants" : "Find nearby restaurants"}
        </button>

        <AnimatePresence>
          {nearbyOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
              style={{ overflow: "hidden" }}>
              <NearbyRestaurants cuisine={recipe.cuisine} onClose={() => setNearbyOpen(false)} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
