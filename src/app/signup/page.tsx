"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.includes("@")) { setError("Enter a valid email address."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setLoading(true);
    const { error: err } = await supabase.auth.signUp({ email, password });
    if (err) { setError(err.message); setLoading(false); return; }
    router.push("/");
    router.refresh();
  };

  return (
    <div style={{
      minHeight: "100vh", background: "var(--page-bg)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
    }}>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        style={{
          width: "100%", maxWidth: 400,
          background: "var(--card-bg)",
          border: "0.5px solid var(--border-tertiary)",
          borderRadius: 12, padding: 32,
        }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 24 }}>
          <Image src="/icon-mark.svg" alt="Meal4Mood" width={52} height={52} unoptimized />
          <h2 style={{ fontSize: 22, fontWeight: 500, color: "var(--text-primary)", margin: "12px 0 4px" }}>
            Create your account
          </h2>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0, textAlign: "center" }}>
            Save recipes, sync across devices, and pick up where you left off.
          </p>
        </div>

        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <AuthField label="Email">
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@kitchen.cool" className="m4m-input" style={{ width: "100%" }}
              autoComplete="email"
            />
          </AuthField>
          <AuthField label="Password">
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="At least 6 characters" className="m4m-input" style={{ width: "100%" }}
              autoComplete="new-password"
            />
          </AuthField>
          {error && (
            <div role="alert" style={{
              fontSize: 13, color: "#A32D2D", background: "#FCEBEB",
              border: "0.5px solid #E24B4A", padding: "8px 12px", borderRadius: 8,
            }}>{error}</div>
          )}
          <button
            type="submit" data-kind="primary" disabled={loading}
            style={{
              background: loading ? "#D3D1C7" : "var(--m4m-brand)", color: "#fff",
              border: "none", height: 36, borderRadius: 8, fontSize: 13, fontWeight: 500,
              cursor: loading ? "not-allowed" : "pointer", width: "100%", position: "relative", overflow: "hidden",
            }}
            aria-busy={loading}>
            {loading && (
              <span style={{
                position: "absolute", inset: 0,
                background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent)",
                animation: "shimmer 1.4s infinite",
              }}/>
            )}
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p style={{ textAlign: "center", fontSize: 13, color: "var(--text-secondary)", marginTop: 16 }}>
          Already have an account?{" "}
          <a href="/login" style={{ color: "var(--m4m-brand)", fontWeight: 500, textDecoration: "none" }}>
            Log in
          </a>
        </p>
      </motion.div>
    </div>
  );
}

function AuthField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span style={{
        fontSize: 11, fontWeight: 500, textTransform: "uppercase",
        letterSpacing: "0.08em", color: "var(--text-tertiary)",
      }}>{label}</span>
      {children}
    </label>
  );
}
