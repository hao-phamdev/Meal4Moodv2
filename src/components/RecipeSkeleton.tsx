export default function RecipeSkeleton() {
  const sk: React.CSSProperties = {
    borderRadius: 4,
    background: "linear-gradient(90deg, rgba(192,221,151,0.25), rgba(192,221,151,0.5), rgba(192,221,151,0.25))",
    backgroundSize: "200% 100%",
    animation: "shimmer 1.6s infinite",
  };
  return (
    <div style={{
      background: "var(--m4m-surface)",
      border: "0.5px solid var(--m4m-light)",
      borderRadius: 12, padding: 16, marginTop: 24,
    }}>
      <div style={{ ...sk, width: "100%", aspectRatio: "16/9", borderRadius: 8, marginBottom: 12 }}/>
      <div style={{ ...sk, width: "60%", height: 22, marginBottom: 8 }}/>
      <div style={{ ...sk, width: "90%", height: 14, marginBottom: 6 }}/>
      <div style={{ ...sk, width: "80%", height: 14 }}/>
    </div>
  );
}
