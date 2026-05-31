"use client";
import cuisineMap from "../../country-cuisine-map.json";

// Flatten all dishes from all countries into one list
const ALL_DISHES: { dish: string; flag: string; cuisine: string }[] = [];
for (const [, entry] of Object.entries(cuisineMap as Record<string, { cuisine: string; flag: string; dishes: string[] }>)) {
  for (const dish of entry.dishes) {
    ALL_DISHES.push({ dish, flag: entry.flag, cuisine: entry.cuisine });
  }
}
// Duplicate for seamless loop
const TICKER_ITEMS = [...ALL_DISHES, ...ALL_DISHES];

interface Props {
  onPick: (dish: string, cuisine: string) => void;
}

export default function QuickPickTicker({ onPick }: Props) {
  return (
    <div style={{
      background: "var(--card-bg)",
      borderTop: "0.5px solid var(--border-tertiary)",
      borderBottom: "0.5px solid var(--border-tertiary)",
      padding: "10px 0",
      overflow: "hidden",
      marginBottom: 24,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, paddingLeft: 24, marginBottom: 6 }}>
        <span style={{
          fontSize: 10, fontWeight: 500, textTransform: "uppercase",
          letterSpacing: "0.08em", color: "var(--text-tertiary)", flexShrink: 0,
        }}>Quick Pick</span>
      </div>

      <div className="m4m-ticker-wrap" style={{ overflow: "hidden" }}>
        <div className="m4m-ticker-track">
          {TICKER_ITEMS.map((item, i) => (
            <button
              key={i}
              onClick={() => onPick(item.dish, item.cuisine)}
              style={{
                flexShrink: 0,
                display: "inline-flex", alignItems: "center", gap: 6,
                margin: "0 6px",
                padding: "5px 14px",
                borderRadius: 20,
                fontSize: 12, fontWeight: 500,
                cursor: "pointer",
                background: "var(--m4m-surface)",
                color: "var(--m4m-deep)",
                border: "0.5px solid var(--m4m-light)",
                fontFamily: "inherit",
                whiteSpace: "nowrap",
                transition: "background 150ms ease-in-out, border-color 150ms",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.background = "var(--m4m-brand)";
                (e.currentTarget as HTMLButtonElement).style.color = "#fff";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.background = "var(--m4m-surface)";
                (e.currentTarget as HTMLButtonElement).style.color = "var(--m4m-deep)";
              }}
            >
              <span>{item.flag}</span>
              <span>{item.dish}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
