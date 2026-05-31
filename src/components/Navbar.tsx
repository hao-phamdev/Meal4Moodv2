"use client";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [dark, setDark] = useTheme();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <nav style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "16px 32px",
      borderBottom: "0.5px solid var(--border-tertiary)",
      background: "var(--page-bg)",
      position: "sticky", top: 0, zIndex: 50,
      backdropFilter: "saturate(140%) blur(8px)",
    }}>
      <button
        onClick={() => router.push("/")}
        style={{ display: "flex", alignItems: "center", cursor: "pointer", background: "none", border: "none", padding: 0 }}>
        <Image
          src={dark ? "/logo.svg" : "/logo-dark.svg"}
          alt="Meal4Mood"
          width={152}
          height={36}
          unoptimized
          priority
        />
      </button>

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <NavLink active={pathname === "/"} onClick={() => router.push("/")}>Discover</NavLink>
        <NavLink active={pathname === "/saved"} onClick={() => router.push("/saved")}>Saved</NavLink>

        {/* Dark mode toggle */}
        <button
          onClick={() => setDark(!dark)}
          aria-label="Toggle theme"
          style={{
            height: 36, width: 36, padding: 0, background: "transparent",
            border: "0.5px solid var(--m4m-border)", borderRadius: 8, cursor: "pointer",
            color: "var(--m4m-brand)", display: "inline-flex", alignItems: "center", justifyContent: "center",
          }}>
          {dark ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="4"/>
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          )}
        </button>

        {user ? (
          <button
            data-kind="ghost"
            onClick={handleSignOut}
            style={{
              background: "transparent", color: "var(--m4m-brand)",
              border: "0.5px solid var(--m4m-border)",
              height: 36, padding: "0 16px", borderRadius: 8,
              fontSize: 13, fontWeight: 500, cursor: "pointer",
              transition: "background 200ms ease-in-out",
            }}>
            Sign out
          </button>
        ) : (
          <>
            <button
              data-kind="ghost"
              onClick={() => router.push("/login")}
              style={{
                background: "transparent", color: "var(--m4m-brand)",
                border: "0.5px solid var(--m4m-border)",
                height: 36, padding: "0 16px", borderRadius: 8,
                fontSize: 13, fontWeight: 500, cursor: "pointer",
                transition: "background 200ms ease-in-out",
              }}>
              Log in
            </button>
            <button
              data-kind="primary"
              onClick={() => router.push("/signup")}
              style={{
                background: "var(--m4m-brand)", color: "#fff", border: "none",
                height: 36, padding: "0 16px", borderRadius: 8,
                fontSize: 13, fontWeight: 500, cursor: "pointer",
                transition: "background 200ms ease-in-out",
              }}>
              Sign up
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

function NavLink({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} style={{
      background: active ? "var(--m4m-surface)" : "transparent",
      border: `0.5px solid ${active ? "var(--m4m-border)" : "var(--border-tertiary)"}`,
      cursor: "pointer",
      fontSize: 13, fontWeight: 500,
      color: active ? "var(--m4m-brand)" : "var(--text-secondary)",
      padding: "8px 12px", borderRadius: 8,
      fontFamily: "inherit",
      transition: "color 200ms ease-in-out, background 200ms ease-in-out, border-color 200ms ease-in-out",
    }}>{children}</button>
  );
}
