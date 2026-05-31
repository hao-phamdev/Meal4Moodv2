"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Recipe } from "@/lib/types";

interface Props {
  recipe: Recipe;
  onSave?: () => void;
  saved?: boolean;
  userIngredients?: string[];
}

export default function RecipeCard({ recipe, onSave, saved, userIngredients = [] }: Props) {
  const [expanded, setExpanded] = useState(true);

  const initialChecked = recipe.ingredients.reduce<Record<number, boolean>>((acc, ing, i) => {
    const ingLower = ing.toLowerCase();
    const hasIt = userIngredients.some(u => ingLower.includes(u.toLowerCase()) || u.toLowerCase().includes(ingLower.split(" ")[0]));
    if (hasIt) acc[i] = true;
    return acc;
  }, {});

  const [checked, setChecked] = useState<Record<number, boolean>>(initialChecked);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      style={{
        background: "var(--m4m-surface)",
        border: "0.5px solid var(--m4m-light)",
        borderRadius: 12, padding: 16, marginTop: 24,
      }}>

      {/* Hero image */}
      <div style={{
        position: "relative", width: "100%", aspectRatio: "16/9",
        borderRadius: 8, overflow: "hidden", background: "#ddd", marginBottom: 12,
      }}>
        <img
          src={recipe.imageUrl} alt={recipe.title}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
        <div style={{ position: "absolute", top: 8, left: 8, display: "flex", gap: 6 }}>
          <span style={{
            background: "rgba(255,255,255,0.92)", color: "var(--m4m-deep)",
            fontSize: 11, fontWeight: 500, padding: "3px 8px", borderRadius: 20,
            backdropFilter: "blur(4px)",
          }}>{recipe.flag} {recipe.cuisine}</span>
          <span style={{
            background: "var(--m4m-brand)", color: "#fff",
            fontSize: 11, fontWeight: 500, padding: "3px 8px", borderRadius: 20,
          }}>{recipe.cookTime} min</span>
        </div>
      </div>

      {/* Title + save */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: 18, fontWeight: 500, color: "var(--m4m-deep)", margin: 0, lineHeight: 1.3 }}>
            {recipe.title}
          </h3>
          <p style={{ fontSize: 13, color: "var(--m4m-mid)", margin: "4px 0 0 0", lineHeight: 1.6 }}>
            {recipe.description}
          </p>
          <p style={{ fontSize: 12, color: "var(--text-tertiary)", margin: "4px 0 0 0" }}>
            Serves {recipe.servings}
          </p>
        </div>
        {onSave && (
          <button
            onClick={onSave}
            aria-label={saved ? "Recipe saved" : "Save recipe"}
            style={{
              background: saved ? "var(--m4m-brand)" : "var(--card-bg)",
              border: `0.5px solid ${saved ? "var(--m4m-brand)" : "var(--m4m-border)"}`,
              color: saved ? "#fff" : "var(--m4m-brand)",
              width: 36, height: 36, borderRadius: 8,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", transition: "all 200ms ease-in-out",
            }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
            </svg>
          </button>
        )}
      </div>

      {/* Diet tags */}
      {recipe.diet && recipe.diet.length > 0 && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 12 }}>
          {recipe.diet.map(d => (
            <span key={d} style={{
              fontSize: 11, fontWeight: 500,
              background: "rgba(255,255,255,0.6)", color: "var(--m4m-deep)",
              padding: "3px 8px", borderRadius: 20,
              border: "0.5px solid var(--m4m-light)",
            }}>{d}</span>
          ))}
        </div>
      )}

      {/* Expand toggle */}
      <button
        onClick={() => setExpanded(e => !e)}
        aria-expanded={expanded}
        style={{
          background: "transparent", border: "none", cursor: "pointer",
          color: "var(--m4m-brand)", fontSize: 13, fontWeight: 500,
          padding: "12px 0 8px", display: "flex", alignItems: "center", gap: 6,
          fontFamily: "inherit",
        }}>
        {expanded ? "Hide steps & grocery" : "Show steps & grocery"}
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          style={{ transform: expanded ? "rotate(180deg)" : "rotate(0)", transition: "transform 200ms" }}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: "hidden" }}>
            <div style={{ paddingTop: 4 }}>
              {/* Steps */}
              <div style={{ fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--m4m-mid)", marginBottom: 8 }}>
                Steps
              </div>
              <ol style={{ paddingLeft: 0, listStyle: "none", margin: 0 }}>
                {recipe.steps.map((s, i) => (
                  <li key={i} style={{ display: "flex", gap: 12, fontSize: 13, color: "var(--m4m-mid)", lineHeight: 1.7, marginBottom: 8 }}>
                    <span style={{
                      flexShrink: 0, width: 22, height: 22,
                      borderRadius: 999, background: "var(--m4m-brand)", color: "#fff",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 11, fontWeight: 500,
                    }}>{i + 1}</span>
                    <span style={{ flex: 1, paddingTop: 2 }}>{s}</span>
                  </li>
                ))}
              </ol>

              {/* Grocery checklist */}
              <div style={{ fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--m4m-mid)", margin: "16px 0 8px" }}>
                Grocery checklist
              </div>
              <div>
                {recipe.ingredients.map((g, i) => (
                  <label key={i} style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "6px 0", cursor: "pointer",
                    fontSize: 13,
                    color: checked[i] ? "var(--m4m-mid)" : "var(--m4m-deep)",
                    textDecoration: checked[i] ? "line-through" : "none",
                    opacity: checked[i] ? 0.6 : 1,
                    transition: "all 150ms",
                  }}>
                    <span
                      onClick={() => setChecked(c => ({ ...c, [i]: !c[i] }))}
                      role="checkbox"
                      aria-checked={!!checked[i]}
                      tabIndex={0}
                      onKeyDown={e => { if (e.key === " " || e.key === "Enter") setChecked(c => ({ ...c, [i]: !c[i] })); }}
                      style={{
                        width: 16, height: 16, borderRadius: 4,
                        border: `0.5px solid ${checked[i] ? "var(--m4m-brand)" : "var(--m4m-border)"}`,
                        background: checked[i] ? "var(--m4m-brand)" : "var(--card-bg)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0, transition: "all 150ms",
                      }}>
                      {checked[i] && (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      )}
                    </span>
                    {g}
                  </label>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
