"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface IngredientItem {
  name: string;
  excludedBy: string[];
}
interface Category {
  name: string;
  color: string;
  bg: string;
  items: IngredientItem[];
}

const CATEGORIES: Category[] = [
  {
    name: "Produce", color: "#639922", bg: "#F1F7E5",
    items: [
      { name: "Spinach",      excludedBy: [] },
      { name: "Tomatoes",     excludedBy: [] },
      { name: "Garlic",       excludedBy: [] },
      { name: "Onion",        excludedBy: [] },
      { name: "Lemon",        excludedBy: [] },
      { name: "Cilantro",     excludedBy: [] },
      { name: "Bell pepper",  excludedBy: [] },
      { name: "Carrot",       excludedBy: [] },
      { name: "Avocado",      excludedBy: [] },
      { name: "Mushrooms",    excludedBy: [] },
      { name: "Broccoli",     excludedBy: [] },
      { name: "Zucchini",     excludedBy: [] },
    ],
  },
  {
    name: "Proteins", color: "#A6612D", bg: "#FBF1E6",
    items: [
      { name: "Chicken breast", excludedBy: ["Vegan", "Vegetarian"] },
      { name: "Eggs",           excludedBy: ["Vegan"] },
      { name: "Tofu",           excludedBy: [] },
      { name: "Salmon",         excludedBy: ["Vegan", "Vegetarian"] },
      { name: "Ground beef",    excludedBy: ["Vegan", "Vegetarian"] },
      { name: "Chickpeas",      excludedBy: [] },
      { name: "Black beans",    excludedBy: [] },
      { name: "Shrimp",         excludedBy: ["Vegan", "Vegetarian"] },
      { name: "Bacon",          excludedBy: ["Vegan", "Vegetarian"] },
    ],
  },
  {
    name: "Dairy & Eggs", color: "#3D7AB8", bg: "#EAF1F9",
    items: [
      { name: "Feta",         excludedBy: ["Vegan", "Dairy-Free"] },
      { name: "Yogurt",       excludedBy: ["Vegan", "Dairy-Free"] },
      { name: "Butter",       excludedBy: ["Vegan", "Dairy-Free"] },
      { name: "Parmesan",     excludedBy: ["Vegan", "Dairy-Free"] },
      { name: "Milk",         excludedBy: ["Vegan", "Dairy-Free"] },
      { name: "Mozzarella",   excludedBy: ["Vegan", "Dairy-Free"] },
      { name: "Heavy cream",  excludedBy: ["Vegan", "Dairy-Free"] },
      { name: "Cheddar",      excludedBy: ["Vegan", "Dairy-Free"] },
    ],
  },
  {
    name: "Pantry", color: "#8C6B2C", bg: "#F8F1E2",
    items: [
      { name: "Olive oil",   excludedBy: [] },
      { name: "Soy sauce",   excludedBy: ["Gluten-Free"] },
      { name: "Pasta",       excludedBy: ["Keto", "Gluten-Free"] },
      { name: "Rice",        excludedBy: ["Keto"] },
      { name: "Flour",       excludedBy: ["Keto", "Gluten-Free"] },
      { name: "Honey",       excludedBy: ["Vegan"] },
      { name: "Vinegar",     excludedBy: [] },
      { name: "Cumin",       excludedBy: [] },
      { name: "Paprika",     excludedBy: [] },
      { name: "Bread",       excludedBy: ["Keto", "Gluten-Free"] },
      { name: "Pine nuts",   excludedBy: [] },
    ],
  },
];

const STAINLESS = `linear-gradient(90deg,
  #C8CDD2 0%,#DFE3E6 6%,#C8CDD2 12%,#E2E5E8 18%,#CACFD3 24%,
  #DCE0E3 30%,#C5CACF 36%,#E0E3E6 42%,#C9CED2 48%,#DDE0E3 54%,
  #C7CCD0 60%,#E1E4E7 66%,#CACFD3 72%,#DEE1E4 78%,#C8CDD1 84%,
  #DFE2E5 90%,#C7CCD1 96%,#D6DADD 100%)`;

const STAINLESS_DARK = `linear-gradient(180deg,rgba(0,0,0,0.06),rgba(0,0,0,0) 30%,rgba(0,0,0,0) 70%,rgba(0,0,0,0.10))`;

interface Props {
  selected: string[];
  onChange: (next: string[]) => void;
  diet: Set<string>;
}

export default function FridgeSelector({ selected, onChange, diet }: Props) {
  const [open, setOpen] = useState(false);
  const [doorOpen, setDoorOpen] = useState(false);
  const [scanState, setScanState] = useState<"idle" | "scanning" | "done" | "error">("idle");
  const [scanFlash, setScanFlash] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Auto-uncheck items excluded by the current diet
  useEffect(() => {
    const excludedNames = new Set(
      CATEGORIES.flatMap(cat =>
        cat.items
          .filter(item => item.excludedBy.some(d => diet.has(d)))
          .map(item => item.name.toLowerCase())
      )
    );
    const cleaned = selected.filter(s => !excludedNames.has(s.toLowerCase()));
    if (cleaned.length !== selected.length) onChange(cleaned);
  }, [diet]);

  const isChecked = (name: string) => selected.some(s => s.toLowerCase() === name.toLowerCase());

  const toggle = (name: string, excluded: boolean) => {
    if (excluded) return;
    if (isChecked(name)) {
      onChange(selected.filter(s => s.toLowerCase() !== name.toLowerCase()));
    } else {
      onChange([...selected, name]);
    }
  };

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => setDoorOpen(true), 420);
      return () => clearTimeout(t);
    } else {
      setDoorOpen(false);
    }
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setScanState("scanning");
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(",")[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const res = await fetch("/api/scan-fridge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64, mediaType: file.type }),
      });
      if (!res.ok) throw new Error();
      const { ingredients: found } = await res.json();
      onChange([...selected, ...(found as string[]).filter((f: string) =>
        !selected.some(s => s.toLowerCase() === f.toLowerCase())
      )]);
      setScanState("done");
      setScanFlash(true);
      setTimeout(() => setScanFlash(false), 700);
      setTimeout(() => setScanState("idle"), 2000);
    } catch {
      setScanState("error");
      setTimeout(() => setScanState("idle"), 3000);
    }
  }

  return (
    <>
      <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFileSelect} />

      {/* Closed-state card */}
      <button
        onClick={() => setOpen(true)}
        style={{
          width: "100%",
          background: "var(--card-bg)",
          border: "0.5px solid var(--border-tertiary)",
          borderRadius: 12,
          padding: 14,
          cursor: "pointer",
          textAlign: "left",
          fontFamily: "inherit",
          display: "flex", alignItems: "center", gap: 14,
          boxShadow: "0 1px 2px rgba(13,61,34,0.04)",
          transition: "border-color 140ms, box-shadow 140ms",
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLButtonElement).style.borderColor = "#1A6B3A55";
          (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 16px rgba(13,61,34,0.08)";
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border-tertiary)";
          (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 1px 2px rgba(13,61,34,0.04)";
        }}>
        {/* Mini fridge icon */}
        <div style={{
          width: 44, height: 56, flexShrink: 0, borderRadius: 6,
          background: STAINLESS,
          backgroundSize: "8px 100%, 100% 100%",
          position: "relative",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.6), 0 1px 3px rgba(0,0,0,0.18)",
          border: "0.5px solid #A8AEB4",
        }}>
          <div style={{ position: "absolute", left: 4, right: 4, top: 16, height: 1, background: "#9097A0" }} />
          <div style={{ position: "absolute", right: 4, top: 22, bottom: 8, width: 2, background: "#7E858D", borderRadius: 1 }} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-tertiary)", marginBottom: 4 }}>
            Ingredients on hand
          </div>
          <div style={{ fontSize: 15, fontWeight: 500, color: "var(--text-primary)", lineHeight: 1.3 }}>
            {selected.length === 0 ? "Open the fridge" : `${selected.length} item${selected.length === 1 ? "" : "s"} ready`}
          </div>
          {selected.length > 0 && (
            <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {selected.slice(0, 3).join(" · ")}{selected.length > 3 ? ` +${selected.length - 3}` : ""}
            </div>
          )}
        </div>

        {selected.length > 0 && (
          <span style={{ background: "#1A6B3A", color: "#fff", fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 20, flexShrink: 0 }}>
            {selected.length}
          </span>
        )}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="1.8" strokeLinecap="round">
          <path d="M9 6l6 6-6 6" />
        </svg>
      </button>

      {/* Fullscreen overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{
              position: "fixed", inset: 0,
              background: "rgba(8,18,12,0.72)",
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
              zIndex: 1000,
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: 24,
            }}
            onClick={e => { if (e.target === e.currentTarget) setOpen(false); }}>

            {/* X button */}
            <button
              onClick={() => setOpen(false)}
              aria-label="Close fridge"
              style={{
                position: "fixed", top: 18, right: 18, zIndex: 1002,
                width: 36, height: 36, borderRadius: 18,
                background: "rgba(255,255,255,0.92)",
                border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
              }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1A2A1F" strokeWidth="2.2" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>

            {/* Fridge wrapper */}
            <motion.div
              initial={{ scale: 0.4, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 26 }}
              style={{
                width: "min(560px, 100%)",
                height: "min(820px, calc(100vh - 80px))",
                perspective: 1800,
                perspectiveOrigin: "50% 50%",
                position: "relative",
              }}>
              <FridgeBox
                doorOpen={doorOpen}
                selected={selected}
                onChange={onChange}
                isChecked={isChecked}
                toggle={toggle}
                diet={diet}
                scanState={scanState}
                scanFlash={scanFlash}
                onCameraClick={() => fileRef.current?.click()}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

interface FridgeBoxProps {
  doorOpen: boolean;
  selected: string[];
  onChange: (next: string[]) => void;
  isChecked: (name: string) => boolean;
  toggle: (name: string, excluded: boolean) => void;
  diet: Set<string>;
  scanState: string;
  scanFlash: boolean;
  onCameraClick: () => void;
}

function FridgeBox({ doorOpen, selected, onChange, isChecked, toggle, diet, scanState, scanFlash, onCameraClick }: FridgeBoxProps) {
  return (
    <div style={{ position: "relative", width: "100%", height: "100%", transformStyle: "preserve-3d" }}>
      {/* Body */}
      <div style={{
        position: "absolute", inset: 0,
        borderRadius: 16,
        background: STAINLESS,
        backgroundSize: "14px 100%, 100% 100%",
        boxShadow: "0 30px 80px rgba(0,0,0,0.55), 0 8px 24px rgba(0,0,0,0.3)",
        border: "1px solid #8E959C",
        overflow: "hidden",
      }}>
        <div style={{ position: "absolute", inset: 0, background: STAINLESS_DARK, pointerEvents: "none" }} />

        {/* Freezer seam */}
        <div style={{
          position: "absolute", top: 110, left: 8, right: 8, height: 2,
          background: "linear-gradient(180deg, #6A7079, #9097A0)",
          borderRadius: 1,
          boxShadow: "0 1px 0 rgba(255,255,255,0.4)",
        }} />

        {/* Interior cavity */}
        <div style={{
          position: "absolute", top: 122, left: 14, right: 14, bottom: 14,
          background: "linear-gradient(180deg,#FAFBFC 0%,#ECEFF2 100%)",
          borderRadius: 10,
          border: "1px solid #B8BEC4",
          boxShadow: "inset 0 8px 20px rgba(0,0,0,0.10), inset 0 -2px 6px rgba(0,0,0,0.06)",
          overflow: "hidden",
        }}>
          {/* LED glow */}
          <div style={{
            position: "absolute", top: 0, left: "15%", right: "15%", height: 4,
            background: "linear-gradient(180deg,#FFFCEA,#FFF7C4 60%,transparent)",
            filter: "blur(2px)",
            opacity: doorOpen ? 0.9 : 0,
            transition: "opacity 280ms 220ms",
          }} />
          <div style={{
            position: "absolute", inset: 0,
            background: "radial-gradient(ellipse at 50% 0%,rgba(255,250,210,0.45),transparent 60%)",
            opacity: doorOpen ? 1 : 0,
            transition: "opacity 280ms 220ms",
            pointerEvents: "none",
          }} />

          {/* Glass shelf dividers */}
          {[0.28, 0.55, 0.82].map((p, i) => (
            <div key={i} style={{
              position: "absolute", left: 8, right: 8, top: `${p * 100}%`, height: 2,
              background: "linear-gradient(180deg,rgba(176,200,220,0.5),rgba(176,200,220,0.15))",
              borderTop: "1px solid rgba(255,255,255,0.7)",
              borderBottom: "1px solid rgba(120,140,160,0.2)",
              pointerEvents: "none",
            }} />
          ))}

          {/* Shelf content */}
          <AnimatePresence>
            {doorOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { duration: 0.3, delay: 0.15 } }}
                exit={{ opacity: 0, transition: { duration: 0.15 } }}
                style={{ position: "absolute", inset: 0, padding: "14px 14px 60px", overflowY: "auto" }}>
                {CATEGORIES.map((cat, ci) => (
                  <ShelfRow key={cat.name} cat={cat} index={ci} isChecked={isChecked} toggle={toggle} diet={diet} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Clear button */}
          <AnimatePresence>
            {doorOpen && selected.length > 0 && (
              <motion.button
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1, transition: { delay: 0.55, type: "spring", stiffness: 380, damping: 18 } }}
                exit={{ opacity: 0, scale: 0.6 }}
                onClick={() => onChange([])}
                aria-label="Clear all ingredients"
                style={{
                  position: "absolute", left: 10, bottom: 10,
                  height: 32, padding: "0 12px", borderRadius: 16,
                  background: "rgba(255,255,255,0.92)",
                  border: "0.5px solid #C8BFA8",
                  cursor: "pointer",
                  display: "inline-flex", alignItems: "center", gap: 6,
                  fontFamily: "inherit", fontSize: 11, fontWeight: 500, color: "#7A6A4A",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.10)",
                }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                  <path d="M10 11v6M14 11v6" />
                </svg>
                Clear ({selected.length})
              </motion.button>
            )}
          </AnimatePresence>

          {/* Camera button */}
          <AnimatePresence>
            {doorOpen && (
              <motion.button
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1, transition: { delay: 0.5, type: "spring", stiffness: 380, damping: 18 } }}
                exit={{ opacity: 0, scale: 0.6 }}
                onClick={onCameraClick}
                aria-label="Scan with camera"
                style={{
                  position: "absolute", right: 10, bottom: 10,
                  width: 44, height: 44, borderRadius: 22,
                  background: "radial-gradient(circle at 35% 30%,#444 0%,#1a1a1a 55%,#000 90%)",
                  border: "2px solid #2a2a2a",
                  cursor: scanState === "scanning" ? "wait" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.35),inset 0 1px 0 rgba(255,255,255,0.18)",
                  padding: 0,
                }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F4EFE2" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
                {scanState === "scanning" && (
                  <motion.span
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    style={{
                      position: "absolute", top: -2, right: -2,
                      width: 9, height: 9, borderRadius: 5, background: "#E24B4A",
                      boxShadow: "0 0 6px rgba(226,75,74,0.8)",
                    }} />
                )}
              </motion.button>
            )}
          </AnimatePresence>

          {/* Scan line */}
          {scanState === "scanning" && (
            <motion.div
              initial={{ y: 0 }}
              animate={{ y: "100%" }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              style={{
                position: "absolute", left: 0, right: 0, top: 0, height: 3,
                background: "linear-gradient(90deg,transparent,#97C459,transparent)",
                boxShadow: "0 0 14px rgba(151,196,89,0.85)",
                pointerEvents: "none",
              }} />
          )}

          {/* Scan flash */}
          <AnimatePresence>
            {scanFlash && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.65, 0] }}
                transition={{ duration: 0.7 }}
                style={{ position: "absolute", inset: 0, background: "rgba(151,196,89,0.6)", pointerEvents: "none" }} />
            )}
          </AnimatePresence>
        </div>

        {/* Freezer compartment */}
        <div style={{
          position: "absolute", top: 14, left: 14, right: 14, height: 92,
          background: "linear-gradient(180deg,#F1F4F7 0%,#DCE0E4 100%)",
          borderRadius: 8, border: "1px solid #B8BEC4",
          boxShadow: "inset 0 4px 12px rgba(0,0,0,0.10)",
          padding: "10px 14px",
          display: "flex", alignItems: "center",
          fontSize: 11, fontWeight: 600, letterSpacing: "0.12em",
          color: "#7E858D", textTransform: "uppercase",
        }}>
          Freezer
        </div>
      </div>

      {/* Door */}
      <motion.div
        animate={{ rotateY: doorOpen ? -118 : 0 }}
        transition={{ type: "spring", stiffness: 90, damping: 18, mass: 1.1 }}
        style={{
          position: "absolute", inset: 0,
          transformOrigin: "left center",
          transformStyle: "preserve-3d",
          borderRadius: 16,
          cursor: doorOpen ? "default" : "pointer",
        }}>
        {/* Door front */}
        <div style={{
          position: "absolute", inset: 0,
          background: STAINLESS,
          backgroundSize: "14px 100%, 100% 100%",
          borderRadius: 16,
          border: "1px solid #8E959C",
          boxShadow: "0 12px 40px rgba(0,0,0,0.45),inset 0 1px 0 rgba(255,255,255,0.4)",
          overflow: "hidden",
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
          transform: "translateZ(2px)",
        }}>
          <div style={{ position: "absolute", inset: 0, background: STAINLESS_DARK, pointerEvents: "none" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(115deg,transparent 30%,rgba(255,255,255,0.18) 45%,rgba(255,255,255,0.0) 55%)", pointerEvents: "none" }} />

          {/* Freezer seam */}
          <div style={{ position: "absolute", top: 110, left: 0, right: 0, height: 2, background: "linear-gradient(180deg,#6A7079,#9097A0)", boxShadow: "0 1px 0 rgba(255,255,255,0.4)" }} />

          {/* Brand badge */}
          <div style={{
            position: "absolute", top: 16, left: "50%", transform: "translateX(-50%)",
            display: "flex", alignItems: "center", gap: 6,
            padding: "4px 10px",
            background: "rgba(0,0,0,0.10)", border: "0.5px solid rgba(0,0,0,0.18)", borderRadius: 4,
            fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", color: "#3A4148",
            textShadow: "0 1px 0 rgba(255,255,255,0.4)",
            whiteSpace: "nowrap",
          }}>
            MEAL4MOOD
          </div>

          {/* Water dispenser */}
          <div style={{
            position: "absolute", top: 150, left: 22, width: 110, height: 130,
            background: "linear-gradient(180deg,#2A2F35 0%,#1A1F25 100%)",
            borderRadius: 8, border: "1px solid #14181D",
            boxShadow: "inset 0 2px 4px rgba(0,0,0,0.6),0 1px 0 rgba(255,255,255,0.25)",
            padding: 8, display: "flex", flexDirection: "column", justifyContent: "space-between",
          }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
              {["CUBED", "CRUSHED", "WATER", "LOCK"].map(l => (
                <div key={l} style={{
                  fontSize: 7, fontWeight: 700, letterSpacing: "0.08em",
                  color: "#7B8A92", textAlign: "center", padding: "4px 0",
                  border: "0.5px solid #2C343C", borderRadius: 3, background: "rgba(0,0,0,0.25)",
                }}>{l}</div>
              ))}
            </div>
            <div style={{
              height: 38,
              background: "radial-gradient(ellipse at 50% 30%,#0a0d10 0%,#1a1f25 100%)",
              borderRadius: 4, border: "0.5px solid #0A0D10",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <div style={{ width: 6, height: 6, borderRadius: 3, background: "#3FA9D9", boxShadow: "0 0 6px rgba(63,169,217,0.7)" }} />
            </div>
          </div>

          {/* FRESH LCD */}
          <div style={{
            position: "absolute", top: 156, right: 70, width: 84, height: 28,
            background: "linear-gradient(180deg,#1A2B1E 0%,#0E1812 100%)",
            borderRadius: 4, border: "1px solid #0A0F0C",
            boxShadow: "inset 0 1px 2px rgba(0,0,0,0.6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#7DD894", fontFamily: "ui-monospace,'SF Mono',Menlo,monospace",
            fontSize: 11, letterSpacing: "0.08em",
            textShadow: "0 0 6px rgba(125,216,148,0.6)",
          }}>
            FRESH
          </div>

          {/* Handle */}
          <div style={{
            position: "absolute", right: 16, top: 130, bottom: 60, width: 10,
            background: "linear-gradient(90deg,#6A7079 0%,#C8CDD2 30%,#F0F2F4 50%,#C8CDD2 70%,#6A7079 100%)",
            borderRadius: 5,
            boxShadow: "0 2px 6px rgba(0,0,0,0.4),inset 0 1px 0 rgba(255,255,255,0.6)",
          }} />
          <div style={{ position: "absolute", right: 13, top: 124, width: 16, height: 12, background: "linear-gradient(180deg,#B8BDC2,#8E959C)", borderRadius: 3, boxShadow: "inset 0 1px 0 rgba(255,255,255,0.5),0 1px 2px rgba(0,0,0,0.3)" }} />
          <div style={{ position: "absolute", right: 13, bottom: 54, width: 16, height: 12, background: "linear-gradient(180deg,#B8BDC2,#8E959C)", borderRadius: 3, boxShadow: "inset 0 1px 0 rgba(255,255,255,0.5),0 1px 2px rgba(0,0,0,0.3)" }} />

          {/* Hinge shadow */}
          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 6, background: "linear-gradient(90deg,rgba(0,0,0,0.25),transparent)", pointerEvents: "none" }} />

          {/* Tap hint */}
          <div style={{ position: "absolute", bottom: 28, left: 24, right: 70, fontSize: 12, color: "#3A4148", fontWeight: 500, letterSpacing: "0.04em", textShadow: "0 1px 0 rgba(255,255,255,0.4)" }}>
            <span style={{ opacity: 0.65 }}>Tap to open →</span>
          </div>
        </div>

        {/* Door back (visible when open) */}
        {doorOpen && (
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(180deg,#F4F6F8 0%,#DCE0E4 100%)",
            border: "1px solid #B8BEC4", borderRadius: 16,
            transform: "rotateY(180deg) translateZ(2px)",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            padding: "20px 16px",
            boxShadow: "inset 0 4px 12px rgba(0,0,0,0.08)",
          }}>
            <div style={{ position: "absolute", inset: 6, border: "4px solid #1F2428", borderRadius: 12, opacity: 0.85, boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.4)", pointerEvents: "none" }} />
            <div style={{ position: "relative", paddingTop: 6 }}>
              {[0, 1, 2, 3].map(i => (
                <div key={i} style={{
                  marginBottom: 12, height: 64,
                  background: "linear-gradient(180deg,rgba(255,255,255,0.7) 0%,rgba(220,228,232,0.55) 100%)",
                  border: "1px solid #B8BEC4", borderRadius: 6,
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.7),0 1px 2px rgba(0,0,0,0.06)",
                }} />
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

interface ShelfRowProps {
  cat: Category;
  index: number;
  isChecked: (name: string) => boolean;
  toggle: (name: string, excluded: boolean) => void;
  diet: Set<string>;
}

function ShelfRow({ cat, index, isChecked, toggle, diet }: ShelfRowProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 + index * 0.06, duration: 0.28 }}
      style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, paddingBottom: 4, borderBottom: `1px solid ${cat.color}25` }}>
        <span style={{ width: 6, height: 6, borderRadius: 3, background: cat.color }} />
        <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: cat.color }}>{cat.name}</span>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, padding: "8px 0 4px" }}>
        {cat.items.map(item => {
          const excluded = item.excludedBy.some(d => diet.has(d));
          const checked = isChecked(item.name);
          return (
            <button
              key={item.name}
              onClick={() => toggle(item.name, excluded)}
              disabled={excluded}
              title={excluded ? "Not available with your dietary restrictions" : undefined}
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                background: excluded ? "transparent" : checked ? cat.color : cat.bg,
                color: excluded ? "#B0B8C0" : checked ? "#fff" : cat.color,
                border: excluded ? `1px dashed ${cat.color}30` : `1px solid ${checked ? cat.color : cat.color + "40"}`,
                borderRadius: 20,
                padding: "5px 11px 5px 6px",
                fontSize: 12, fontWeight: 500, fontFamily: "inherit",
                cursor: excluded ? "not-allowed" : "pointer",
                opacity: excluded ? 0.4 : 1,
                textDecoration: excluded ? "line-through" : "none",
                transition: "background 180ms, color 180ms, border 180ms, transform 120ms",
              }}
              onMouseDown={e => { if (!excluded) (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.96)"; }}
              onMouseUp={e => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"; }}>
              <span style={{
                width: 16, height: 16, borderRadius: 4,
                background: checked ? "#fff" : "transparent",
                border: `1.5px solid ${checked ? "#fff" : cat.color + "70"}`,
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                {checked && (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={cat.color} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </span>
              {item.name}
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}
