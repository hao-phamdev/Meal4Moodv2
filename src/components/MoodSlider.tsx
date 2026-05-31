"use client";
import { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const MOOD_LABELS = [
  { max: 10, label: "Cozy" },
  { max: 20, label: "Soothing" },
  { max: 30, label: "Mellow" },
  { max: 40, label: "Steady" },
  { max: 55, label: "Balanced" },
  { max: 65, label: "Lively" },
  { max: 75, label: "Bold" },
  { max: 85, label: "Daring" },
  { max: 95, label: "Wild" },
  { max: 100, label: "Unhinged" },
];

const PRESETS = [
  { key: "happy",       emoji: "😊", label: "Happy",       value: 58 },
  { key: "sad",         emoji: "😔", label: "Sad",         value: 18 },
  { key: "stressed",    emoji: "😤", label: "Stressed",    value: 5  },
  { key: "adventurous", emoji: "🌍", label: "Adventurous", value: 92 },
  { key: "comfort",     emoji: "🛋️", label: "Comfort",     value: 28 },
  { key: "energized",   emoji: "⚡", label: "Energized",   value: 78 },
];

export function getMoodLabel(v: number) {
  return MOOD_LABELS.find(m => v <= m.max)?.label ?? "Unhinged";
}

interface MoodSliderProps {
  value: number;
  onChange: (v: number) => void;
  preset: string | null;
  onPreset: (key: string, value: number) => void;
}

export default function MoodSlider({ value, onChange, preset, onPreset }: MoodSliderProps) {
  const tweenRef = useRef<number | null>(null);
  const moodTxt = getMoodLabel(value);

  const tweenTo = (target: number) => {
    if (tweenRef.current) cancelAnimationFrame(tweenRef.current);
    const start = performance.now();
    const from = value;
    const dur = 360;
    const ease = (t: number) => 1 - Math.pow(1 - t, 3);
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / dur);
      onChange(Math.round(from + (target - from) * ease(t)));
      if (t < 1) tweenRef.current = requestAnimationFrame(step);
    };
    tweenRef.current = requestAnimationFrame(step);
  };

  return (
    <div style={{
      background: "var(--card-bg)",
      border: "0.5px solid var(--border-tertiary)",
      borderRadius: 12, padding: "20px 24px",
      marginBottom: 24, position: "relative", overflow: "hidden",
    }}>
      {/* Radial glow follows mood */}
      <motion.div
        aria-hidden
        animate={{ background: `radial-gradient(circle at ${value}% 50%, rgba(99,153,34,0.16), transparent 60%)` }}
        transition={{ duration: 0.3 }}
        style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      />

      <div style={{ position: "relative" }}>
        {/* Preset buttons */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginBottom: 16 }}>
          {PRESETS.map(b => {
            const selected = preset === b.key;
            return (
              <motion.button
                key={b.key}
                whileTap={{ scale: 0.94 }}
                onClick={() => { onPreset(b.key, b.value); tweenTo(b.value); }}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  padding: "8px 14px", borderRadius: 20,
                  fontSize: 13, fontWeight: 500, fontFamily: "inherit",
                  cursor: "pointer",
                  border: selected ? "0.5px solid var(--m4m-brand)" : "0.5px solid var(--m4m-light)",
                  background: selected ? "var(--m4m-brand)" : "var(--m4m-surface)",
                  color: selected ? "#fff" : "var(--m4m-deep)",
                  transition: "background 200ms, color 200ms",
                }}>
                <span style={{ fontSize: 14 }}>{b.emoji}</span>
                <span>{b.label}</span>
              </motion.button>
            );
          })}
        </div>

        {/* Label row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12, gap: 12 }}>
          <span style={{
            fontSize: 11, fontWeight: 500, textTransform: "uppercase",
            letterSpacing: "0.08em", color: "var(--text-tertiary)", flex: "0 0 auto", minWidth: 40,
          }}>Mood</span>

          <div style={{ flex: 1, textAlign: "center", minWidth: 0 }}>
            <AnimatePresence mode="popLayout">
              <motion.span
                key={moodTxt}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                style={{ fontSize: 22, fontWeight: 500, color: "var(--m4m-brand)", display: "inline-block" }}>
                {moodTxt}
              </motion.span>
            </AnimatePresence>
          </div>

          <motion.span style={{
            fontSize: 13, color: "var(--text-secondary)",
            display: "inline-block", flex: "0 0 auto", minWidth: 40, textAlign: "right",
          }}>{value}</motion.span>
        </div>

        {/* Slider */}
        <input
          type="range" min="0" max="100" value={value}
          onChange={e => { onChange(+e.target.value); }}
          className="m4m-slider"
          style={{ width: "100%", "--p": `${value}%` } as React.CSSProperties}
          aria-label="Mood slider"
          aria-valuemin={0} aria-valuemax={100} aria-valuenow={value} aria-valuetext={moodTxt}
        />

        {/* Endpoints */}
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--text-tertiary)", marginTop: 8 }}>
          <motion.span
            animate={{ opacity: value < 50 ? 1 : 0.5, fontWeight: value < 30 ? 600 : 400 }}
            style={{ color: value < 30 ? "var(--m4m-brand)" : "var(--text-tertiary)" }}>
            Comfort
          </motion.span>
          <motion.span
            animate={{ opacity: value > 50 ? 1 : 0.5, fontWeight: value > 70 ? 600 : 400 }}
            style={{ color: value > 70 ? "var(--m4m-brand)" : "var(--text-tertiary)" }}>
            Adventure
          </motion.span>
        </div>
      </div>
    </div>
  );
}
