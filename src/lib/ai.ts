import Anthropic from "@anthropic-ai/sdk";
import type { AiMeta } from "@/lib/types";

// Claude Haiku 5.5 — the cheapest current Claude model, and plenty for recipe
// writing and fridge-photo extraction.
export const MODEL = "claude-haiku-5-5";

// Low effort keeps adaptive thinking short: these are well-specified,
// schema-constrained tasks that don't need long deliberation.
export const EFFORT = "low" as const;

export const anthropic = new Anthropic();

// USD per 1M tokens for Claude Haiku 5.5 (prompts up to 100K tokens).
const PRICE = { input: 0.10, output: 0.50, cacheRead: 0.01, cacheWrite: 0.125 };

export class AiError extends Error {
  constructor(message: string, public status = 500) {
    super(message);
  }
}

export function buildMeta(
  message: { usage: Anthropic.Usage; stop_reason: string | null },
  startedAt: number,
  extras: Pick<AiMeta, "patterns" | "prompt">,
): AiMeta {
  const u = message.usage;
  const tokens = {
    input: u.input_tokens,
    output: u.output_tokens,
    cacheRead: u.cache_read_input_tokens ?? 0,
    cacheWrite: u.cache_creation_input_tokens ?? 0,
  };
  const costUsd =
    (tokens.input * PRICE.input +
      tokens.output * PRICE.output +
      tokens.cacheRead * PRICE.cacheRead +
      tokens.cacheWrite * PRICE.cacheWrite) / 1_000_000;

  return {
    model: MODEL,
    effort: EFFORT,
    latencyMs: Date.now() - startedAt,
    tokens,
    costUsd,
    ...extras,
  };
}

// Refusals and truncation arrive as normal 200 responses, so check them
// before trusting the parsed output.
export function assertUsable(message: { stop_reason: string | null }) {
  if (message.stop_reason === "refusal") {
    throw new AiError("The chef declined that request. Try different wording or ingredients.", 422);
  }
  if (message.stop_reason === "max_tokens") {
    throw new AiError("The recipe came out too long. Please try again.", 502);
  }
}

export function errorResponse(err: unknown, fallback: string) {
  if (err instanceof AiError) return { error: err.message, status: err.status };
  if (err instanceof Anthropic.RateLimitError) return { error: "The kitchen is busy — try again in a moment.", status: 429 };
  if (err instanceof Anthropic.AuthenticationError) return { error: "AI service is not configured.", status: 503 };
  if (err instanceof Anthropic.APIError) return { error: fallback, status: 502 };
  return { error: fallback, status: 500 };
}
