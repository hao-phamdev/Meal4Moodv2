"use client";
import dynamic from "next/dynamic";
import { useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import MoodSlider from "@/components/MoodSlider";
import DietarySelector from "@/components/DietarySelector";
import CookTimeSelector from "@/components/CookTimeSelector";
import FridgeSelector from "@/components/FridgeSelector";
import RecipeSkeleton from "@/components/RecipeSkeleton";
import RecipeCard from "@/components/RecipeCard";
import CountryConfirmCard from "@/components/CountryConfirmCard";
import type { CountryData } from "@/components/Globe";
import type { Recipe } from "@/lib/types";
import cuisineMap from "../../country-cuisine-map.json";

const Globe = dynamic(() => import("@/components/Globe"), { ssr: false });

type CuisineMapType = Record<string, { cuisine: string; flag: string; dishes: string[] }>;
const MAP = cuisineMap as CuisineMapType;

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: "var(--card-bg)",
      border: "0.5px solid var(--border-tertiary)",
      borderRadius: 12,
      padding: "16px 20px",
    }}>
      <div style={{
        fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.08em",
        color: "var(--text-tertiary)", marginBottom: 12,
      }}>{title}</div>
      {children}
    </div>
  );
}

export default function HomePage() {
  const [mood, setMood] = useState(50);
  const [moodPreset, setMoodPreset] = useState<string | null>(null);
  const [diet, setDiet] = useState<Set<string>>(new Set());
  const [cookTime, setCookTime] = useState(30);
  const [ingredients, setIngredients] = useState<string[]>([]);

  const [confirming, setConfirming] = useState<CountryData | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<CountryData | null>(null);

  const [loading, setLoading] = useState(false);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [lastTitle, setLastTitle] = useState<string | undefined>(undefined);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCountrySelect = useCallback((country: CountryData) => {
    setConfirming(country);
  }, []);

  async function generateRecipe(country: CountryData, pinnedDish?: string) {
    setLoading(true);
    setRecipe(null);
    setError(null);
    setSaved(false);

    const countryEntry = Object.values(MAP).find(e => e.cuisine === country.cuisine);
    const dishes = countryEntry?.dishes ?? country.dishes ?? [];
    const flag = countryEntry?.flag ?? country.flag ?? "🌍";

    try {
      const res = await fetch("/api/generate-recipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mood,
          country: country.name,
          cuisine: country.cuisine,
          dishes,
          diet: Array.from(diet),
          cookTime,
          ingredients,
          lastTitle,
          pinnedDish,
          flag,
        }),
      });
      if (!res.ok) throw new Error("Generation failed");
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setRecipe(data as Recipe);
      setLastTitle(data.title);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!recipe) return;
    try {
      const res = await fetch("/api/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(recipe),
      });
      if (!res.ok) throw new Error("Save failed");
      const { id } = await res.json();
      setRecipe(r => r ? { ...r, id } : r);
      setSaved(true);
    } catch {
      setError("Failed to save recipe");
    }
  }

  function handleConfirm(country: CountryData) {
    setSelectedCountry(country);
    setConfirming(null);
    generateRecipe(country);
  }

  const moodTxt = mood <= 10 ? "Cozy" : mood <= 20 ? "Soothing" : mood <= 30 ? "Mellow" : mood <= 40 ? "Steady" : mood <= 55 ? "Balanced" : mood <= 65 ? "Lively" : mood <= 75 ? "Bold" : mood <= 85 ? "Daring" : mood <= 95 ? "Wild" : "Unhinged";

  function getMoodWordStyle(txt: string): React.CSSProperties {
    switch (txt) {
      case "Cozy":     return { fontStyle: "italic", opacity: 0.88 };
      case "Soothing": return { fontStyle: "italic" };
      case "Mellow":   return { fontStyle: "italic", letterSpacing: "0.02em" };
      case "Lively":   return { fontWeight: 700 };
      case "Bold":     return { fontWeight: 700, letterSpacing: "0.06em" };
      case "Daring":   return { fontStyle: "italic", fontWeight: 700 };
      case "Wild":     return { fontStyle: "italic", fontWeight: 700, letterSpacing: "0.08em", textShadow: "0 0 10px rgba(255,255,255,0.55)" };
      case "Unhinged": return { fontStyle: "italic", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", textShadow: "0 0 12px rgba(255,255,255,0.8), 0 0 28px rgba(255,210,0,0.5)" };
      default:         return {};
    }
  }

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 24px 64px" }}>

      {/* Page header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 500, color: "var(--text-primary)", margin: 0, letterSpacing: "-0.01em" }}>
          What are you in the mood for?
        </h1>
        <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "4px 0 0 0" }}>
          Set the mood, spin the globe, pick a country — we'll cook up a recipe to match.
        </p>
      </div>

      {/* Mood slider — full width card (rendered by MoodSlider itself) */}
      <MoodSlider
        value={mood}
        onChange={setMood}
        preset={moodPreset}
        onPreset={(key, val) => { setMoodPreset(key); setMood(val); }}
      />

      {/* Globe + right panel */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 1fr)",
        gap: 24,
      }} className="m4m-home-grid">

        {/* Globe */}
        <div style={{
          background: "var(--card-bg)",
          border: "0.5px solid var(--border-tertiary)",
          borderRadius: 12,
          minHeight: 480,
          position: "relative",
          overflow: "hidden",
        }}>
          {/* Hint badge */}
          <div style={{ position: "absolute", top: 16, right: 16, zIndex: 5 }}>
            <span style={{
              fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.08em",
              color: "var(--text-tertiary)",
              background: "var(--card-bg)",
              padding: "4px 8px", borderRadius: 20,
              border: "0.5px solid var(--border-tertiary)",
            }}>Drag to spin · click a pin</span>
          </div>

          {/* Globe fills container */}
          <div style={{ position: "absolute", inset: 0 }}>
            <Globe
              onCountrySelect={handleCountrySelect}
              hideAllLabels={!!confirming}
              hideLabelFor={confirming?.name ?? selectedCountry?.name}
            />
          </div>

          {/* Country confirm card */}
          <AnimatePresence>
            {confirming && (
              <CountryConfirmCard
                country={confirming}
                onGenerate={() => handleConfirm(confirming)}
                onDismiss={() => setConfirming(null)}
              />
            )}
          </AnimatePresence>

          {/* Selected country badge (bottom left, shown when not confirming) */}
          {selectedCountry && !confirming && (
            <div style={{
              position: "absolute", left: 16, bottom: 16,
              background: "var(--card-bg)",
              border: "0.5px solid var(--m4m-light)",
              borderRadius: 12,
              padding: "10px 14px",
              display: "flex", alignItems: "center", gap: 10,
              boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
              zIndex: 5,
            }}>
              <span style={{ fontSize: 18 }}>{selectedCountry.flag}</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>{selectedCountry.name}</div>
                <div style={{ fontSize: 11, color: "var(--text-tertiary)" }}>{selectedCountry.cuisine} cuisine</div>
              </div>
              <button onClick={() => setSelectedCountry(null)} style={{
                marginLeft: 8, background: "transparent", border: "none", cursor: "pointer",
                color: "var(--text-tertiary)", padding: 4, lineHeight: 0,
              }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
          )}
        </div>

        {/* Right panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          <Panel title="Dietary preferences">
            <DietarySelector selected={diet} onChange={next => setDiet(next)} />
          </Panel>

          <Panel title="Cook time">
            <CookTimeSelector value={cookTime} onChange={setCookTime} />
          </Panel>

          <FridgeSelector selected={ingredients} onChange={setIngredients} diet={diet} />

          {/* Generate button */}
          <button
            disabled={!selectedCountry && !confirming}
            onClick={() => selectedCountry && generateRecipe(selectedCountry)}
            style={{
              width: "100%", height: 36, borderRadius: 8,
              background: (!selectedCountry && !confirming) || loading ? "#D3D1C7" : "var(--m4m-brand)",
              color: (!selectedCountry && !confirming) || loading ? "#888780" : "#fff",
              border: "none",
              fontSize: 13, fontWeight: 500,
              cursor: (!selectedCountry && !confirming) ? "not-allowed" : "pointer",
              fontFamily: "inherit",
              position: "relative", overflow: "hidden",
              display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
              transition: "background 200ms ease-in-out",
            }}>
            {loading && (
              <span style={{
                position: "absolute", inset: 0,
                background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent)",
                animation: "shimmer 1.4s infinite",
              }}/>
            )}
            <span style={{ position: "relative" }}>
              {loading
                ? "Cooking up your recipe…"
                : selectedCountry
                  ? <>Generate <span style={getMoodWordStyle(moodTxt)}>{moodTxt.toLowerCase()}</span> {selectedCountry.cuisine.toLowerCase()} recipe</>
                  : "Pick a country to start"}
            </span>
          </button>
        </div>
      </div>

      {/* Recipe output — full width below grid */}
      <AnimatePresence>
        {error && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            role="alert"
            style={{
              marginTop: 24,
              background: "#FCEBEB",
              border: "0.5px solid #E24B4A",
              borderRadius: 10,
              padding: "12px 16px",
              color: "#A32D2D",
              fontSize: 13,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}>
            <span>{error}</span>
            <button onClick={() => setError(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#A32D2D", fontSize: 18, lineHeight: 1 }}>×</button>
          </motion.div>
        )}
      </AnimatePresence>

      {(loading || recipe) && (
        <div style={{ marginTop: 24 }}>
          {loading && <RecipeSkeleton />}
          {recipe && !loading && (
            <RecipeCard recipe={recipe} onSave={handleSave} saved={saved} userIngredients={ingredients} />
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 880px) {
          .m4m-home-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
