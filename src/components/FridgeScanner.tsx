"use client";
import { useRef, useState } from "react";

type ScanState = "idle" | "scanning" | "done" | "error";

interface Props {
  onIngredients: (items: string[]) => void;
}

export default function FridgeScanner({ onIngredients }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [scanState, setScanState] = useState<ScanState>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [found, setFound] = useState(0);

  const fail = (msg: string) => {
    setErrorMsg(msg);
    setScanState("error");
    setTimeout(() => setScanState("idle"), 3000);
  };

  const handleFile = async (file: File) => {
    setScanState("scanning");
    setErrorMsg("");
    try {
      const { data, mediaType } = await prepareImage(file);
      const res = await fetch("/api/scan-fridge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: data, mediaType }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) return fail(body.error ?? "Couldn't scan the photo. Try again.");
      const ingredients = (body.ingredients ?? []) as string[];
      if (!body.isFoodPhoto || ingredients.length === 0) return fail("No food spotted — try another photo.");
      onIngredients(ingredients);
      setFound(ingredients.length);
      setScanState("done");
      setTimeout(() => setScanState("idle"), 2500);
    } catch {
      fail("Couldn't scan the photo. Try again.");
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  };

  const label =
    scanState === "scanning" ? "Scanning your fridge…" :
    scanState === "done"     ? `Added ${found} ingredient${found === 1 ? "" : "s"}!` :
    scanState === "error"    ? errorMsg :
    "Scan my fridge";

  return (
    <>
      <input
        ref={inputRef} type="file" accept="image/*" capture="environment"
        style={{ display: "none" }} onChange={onFileChange}
        aria-label="Upload fridge photo"
      />
      <button
        data-kind="ghost"
        onClick={() => inputRef.current?.click()}
        disabled={scanState === "scanning"}
        aria-busy={scanState === "scanning"}
        style={{
          width: "100%", background: "transparent",
          color: scanState === "error" ? "#A32D2D" : "var(--m4m-brand)",
          border: `0.5px solid ${scanState === "error" ? "#E24B4A" : "var(--m4m-border)"}`,
          height: 36, borderRadius: 8, fontSize: 13, fontWeight: 500,
          cursor: scanState === "scanning" ? "not-allowed" : "pointer",
          display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
          fontFamily: "inherit", position: "relative", overflow: "hidden",
          transition: "background 200ms ease-in-out",
        }}>
        {scanState === "scanning" && (
          <span style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(90deg,transparent,rgba(26,107,58,0.08),transparent)",
            animation: "shimmer 1.4s infinite",
          }}/>
        )}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
          <circle cx="12" cy="13" r="4"/>
        </svg>
        {label}
      </button>
    </>
  );
}

// Phone photos are often 4000px+ and several MB. The model only needs ~1024px
// to read a fridge, so shrink and re-encode before upload: faster scans, far
// less data sent, and about half the image tokens of a full-size upload.
const MAX_SIDE = 1024;

async function prepareImage(file: File): Promise<{ data: string; mediaType: string }> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const dataUrl = canvas.toDataURL("image/jpeg", 0.82);
    return { data: dataUrl.split(",")[1], mediaType: "image/jpeg" };
  } catch {
    // Browser couldn't decode it (e.g. HEIC) — send the original.
    return { data: await fileToBase64(file), mediaType: file.type || "image/jpeg" };
  }
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
