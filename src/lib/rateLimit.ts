import type { NextRequest } from "next/server";

// Best-effort per-IP sliding window. It lives in memory, so each serverless
// instance keeps its own count — enough to stop one visitor from draining the
// API budget on the public demo, not a hard guarantee.
const hits = new Map<string, number[]>();

export function rateLimited(req: NextRequest, bucket: string, limit: number, windowMs: number): boolean {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const key = `${bucket}:${ip}`;
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter(t => now - t < windowMs);
  if (recent.length >= limit) {
    hits.set(key, recent);
    return true;
  }
  recent.push(now);
  hits.set(key, recent);
  return false;
}
