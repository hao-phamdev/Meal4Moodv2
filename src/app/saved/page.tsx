"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SavedCard from "@/components/SavedCard";
import type { Recipe } from "@/lib/types";

export default function SavedPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/recipes")
      .then(r => r.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        setRecipes(data.recipes ?? []);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(id: string) {
    try {
      const res = await fetch("/api/recipes", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error("Delete failed");
      setRecipes(prev => prev.filter(r => r.id !== id));
    } catch {
      setError("Failed to delete recipe");
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--page-bg)", padding: "32px 24px 64px" }}>
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 26, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>
            Saved Recipes
          </h1>
          <p style={{ fontSize: 14, color: "var(--text-tertiary)", margin: "4px 0 0" }}>
            Your personal collection
          </p>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              role="alert"
              style={{
                marginBottom: 20,
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

        {loading && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                background: "var(--card-bg)",
                border: "0.5px solid var(--border-tertiary)",
                borderRadius: 12, overflow: "hidden",
              }}>
                <div style={{
                  width: "100%", aspectRatio: "16/10",
                  background: "linear-gradient(90deg, rgba(192,221,151,0.25), rgba(192,221,151,0.5), rgba(192,221,151,0.25))",
                  backgroundSize: "200% 100%",
                  animation: "shimmer 1.6s infinite",
                }}/>
                <div style={{ padding: 16 }}>
                  <div style={{ height: 18, width: "65%", borderRadius: 4, background: "rgba(192,221,151,0.4)", marginBottom: 8, animation: "shimmer 1.6s infinite" }}/>
                  <div style={{ height: 13, width: "90%", borderRadius: 4, background: "rgba(192,221,151,0.25)", animation: "shimmer 1.6s infinite" }}/>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && recipes.length === 0 && !error && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              textAlign: "center",
              padding: "64px 24px",
              color: "var(--text-tertiary)",
            }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🍽️</div>
            <p style={{ fontSize: 16, fontWeight: 500, color: "var(--text-secondary)", margin: "0 0 8px" }}>No saved recipes yet</p>
            <p style={{ fontSize: 13, margin: 0 }}>Generate a recipe on the Discover page and save it here.</p>
          </motion.div>
        )}

        {!loading && recipes.length > 0 && (
          <motion.div
            layout
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: 20,
            }}>
            <AnimatePresence mode="popLayout">
              {recipes.map(recipe => (
                <motion.div
                  key={recipe.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}>
                  <SavedCard recipe={recipe} onDelete={handleDelete} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}
