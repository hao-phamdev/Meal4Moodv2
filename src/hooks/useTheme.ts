"use client";
import { useState, useEffect } from "react";

export function useTheme() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("m4m-theme");
      if (stored === "dark") setDark(true);
    } catch {}
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    try { localStorage.setItem("m4m-theme", dark ? "dark" : "light"); } catch {}
  }, [dark]);

  return [dark, setDark] as const;
}
