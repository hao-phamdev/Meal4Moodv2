"use client";

const OPTIONS = ["Vegetarian", "Vegan", "Dairy-Free", "Gluten-Free", "Keto", "Pescatarian", "Nut-Free"];

interface Props {
  selected: Set<string>;
  onChange: (next: Set<string>) => void;
}

export default function DietarySelector({ selected, onChange }: Props) {
  const toggle = (opt: string) => {
    const next = new Set(selected);
    if (next.has(opt)) next.delete(opt); else next.add(opt);
    onChange(next);
  };

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
      {OPTIONS.map(opt => {
        const active = selected.has(opt);
        return (
          <button
            key={opt}
            onClick={() => toggle(opt)}
            aria-pressed={active}
            style={{
              background: active ? "var(--m4m-brand)" : "var(--m4m-surface)",
              color: active ? "#fff" : "var(--m4m-deep)",
              border: active ? "0.5px solid var(--m4m-brand)" : "0.5px solid var(--m4m-light)",
              borderRadius: 20, padding: "4px 12px",
              fontSize: 12, fontWeight: 500, cursor: "pointer",
              fontFamily: "inherit",
              transition: "all 200ms ease-in-out",
            }}>
            {opt}
          </button>
        );
      })}
    </div>
  );
}
