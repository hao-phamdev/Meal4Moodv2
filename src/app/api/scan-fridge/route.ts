import { NextRequest, NextResponse } from "next/server";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { anthropic, MODEL, EFFORT, AiError, assertUsable, buildMeta, errorResponse } from "@/lib/ai";
import { FRIDGE_SYSTEM_PROMPT, FRIDGE_USER_TEXT, FRIDGE_PATTERNS, FridgeScanSchema } from "@/lib/prompts/fridgePrompt";
import { rateLimited } from "@/lib/rateLimit";

const MEDIA_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;
type MediaType = (typeof MEDIA_TYPES)[number];
const MAX_BASE64_CHARS = 7_000_000; // ~5 MB image; the client downsizes well below this

export async function POST(req: NextRequest) {
  if (rateLimited(req, "scan", 10, 10 * 60_000)) {
    return NextResponse.json({ error: "Too many scans in a short time — try again in a few minutes." }, { status: 429 });
  }

  try {
    const { image, mediaType } = await req.json();
    if (typeof image !== "string" || !MEDIA_TYPES.includes(mediaType)) {
      return NextResponse.json({ error: "Missing or unsupported image" }, { status: 400 });
    }
    if (image.length > MAX_BASE64_CHARS) {
      return NextResponse.json({ error: "Image too large" }, { status: 413 });
    }

    const startedAt = Date.now();
    const message = await anthropic.messages.parse({
      model: MODEL,
      max_tokens: 3000,
      system: FRIDGE_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: mediaType as MediaType, data: image } },
            { type: "text", text: FRIDGE_USER_TEXT },
          ],
        },
      ],
      output_config: { effort: EFFORT, format: zodOutputFormat(FridgeScanSchema) },
    });

    assertUsable(message);
    const scan = message.parsed_output;
    if (!scan) throw new AiError("Couldn't read the photo. Try again.", 502);

    // Drop low-confidence guesses and duplicates.
    const ingredients = [...new Set(
      scan.items.filter(i => i.confidence !== "low").map(i => i.name.trim().toLowerCase()).filter(Boolean)
    )];

    const meta = buildMeta(message, startedAt, {
      patterns: FRIDGE_PATTERNS,
      prompt: { system: FRIDGE_SYSTEM_PROMPT, messages: [{ role: "user", content: `[photo] ${FRIDGE_USER_TEXT}` }] },
    });

    return NextResponse.json({ ingredients, isFoodPhoto: scan.isFoodPhoto, meta });
  } catch (err) {
    console.error("scan-fridge error:", err);
    const { error, status } = errorResponse(err, "Failed to scan fridge");
    return NextResponse.json({ error }, { status });
  }
}
