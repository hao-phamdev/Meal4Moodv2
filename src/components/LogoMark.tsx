export default function LogoMark({ size = 36 }: { size?: number }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: 10,
      background: "var(--m4m-brand)",
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0,
    }}>
      <svg viewBox="0 0 22 22" fill="none" style={{ width: size * 0.6, height: size * 0.6 }}>
        <circle cx="11" cy="11" r="8.5" stroke="#fff" strokeWidth="1.2"/>
        <ellipse cx="11" cy="11" rx="4" ry="8.5" stroke="#fff" strokeWidth="1.2"/>
        <line x1="2.5" y1="11" x2="19.5" y2="11" stroke="#fff" strokeWidth="1.2"/>
        <line x1="4" y1="7" x2="18" y2="7" stroke="#fff" strokeWidth=".8" opacity=".6"/>
        <line x1="4" y1="15" x2="18" y2="15" stroke="#fff" strokeWidth=".8" opacity=".6"/>
      </svg>
    </div>
  );
}
