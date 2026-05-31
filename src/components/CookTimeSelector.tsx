"use client";

const OPTIONS = [15, 30, 45, 60];

interface Props {
  value: number;
  onChange: (v: number) => void;
}

export default function CookTimeSelector({ value, onChange }: Props) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
      {OPTIONS.map(t => {
        const active = value === t;
        return (
          <button
            key={t}
            onClick={() => onChange(t)}
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
            {t === 60 ? "60+ min" : `${t} min`}
          </button>
        );
      })}
    </div>
  );
}
