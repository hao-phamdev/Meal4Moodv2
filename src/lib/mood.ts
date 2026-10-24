// Shared mood vocabulary — the slider UI and the AI prompt use the same words,
// so what the user sees is exactly what the chef is told.

export const MOOD_WORDS = [
  { max: 10,  word: "Cozy",     vibe: "slow, warm and enveloping — think braises, broths and porridges with gentle spice" },
  { max: 20,  word: "Soothing", vibe: "soft, mild and restorative — silky textures, simple flavours, nothing aggressive" },
  { max: 30,  word: "Mellow",   vibe: "relaxed and homey — familiar comfort food done well" },
  { max: 40,  word: "Steady",   vibe: "grounded and nourishing — balanced plates that feel like a reset" },
  { max: 55,  word: "Balanced", vibe: "approachable crowd-pleasers with a little personality" },
  { max: 65,  word: "Lively",   vibe: "bright and fresh — herbs, citrus, crunch and colour" },
  { max: 75,  word: "Bold",     vibe: "punchy and confident — char, acid, deep umami, assertive spice" },
  { max: 85,  word: "Daring",   vibe: "adventurous — lesser-known regional specialties and surprising techniques" },
  { max: 95,  word: "Wild",     vibe: "intense and thrilling — serious heat, fermented funk, dramatic presentation" },
  { max: 100, word: "Unhinged", vibe: "maximalist and fearless — the most outrageous authentic dish the cuisine has" },
] as const;

export type MoodWord = (typeof MOOD_WORDS)[number]["word"];

export function moodWord(mood: number): MoodWord {
  return (MOOD_WORDS.find(m => mood <= m.max) ?? MOOD_WORDS[MOOD_WORDS.length - 1]).word;
}

export function moodVibe(mood: number): string {
  return (MOOD_WORDS.find(m => mood <= m.max) ?? MOOD_WORDS[MOOD_WORDS.length - 1]).vibe;
}

// Quick-pick feelings from the MoodSlider presets.
export const MOOD_PRESETS: Record<string, string> = {
  happy: "happy",
  sad: "sad",
  stressed: "stressed",
  adventurous: "adventurous",
  comfort: "in need of comfort",
  energized: "energized",
};
