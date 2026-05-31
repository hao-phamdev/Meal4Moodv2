import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const FRIDGE_SCAN_PROMPT = `Look at this fridge/pantry photo and list every food ingredient you can see.
Return ONLY a JSON array of ingredient strings — no commentary, no markdown, no explanation.
Example: ["chicken breast", "bell peppers", "garlic", "olive oil", "spinach"]
Be specific but concise. List each distinct ingredient once.`;

export async function POST(req: NextRequest) {
  try {
    const { image, mediaType } = await req.json();
    if (!image || !mediaType) {
      return NextResponse.json({ error: "Missing image or mediaType" }, { status: 400 });
    }

    const msg = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 512,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "base64", media_type: mediaType, data: image },
            },
            { type: "text", text: FRIDGE_SCAN_PROMPT },
          ],
        },
      ],
    });

    const text = (msg.content[0] as { type: string; text: string }).text.trim();
    const clean = text.replace(/```(?:json)?/g, "").replace(/```/g, "").trim();
    const ingredients: string[] = JSON.parse(clean);

    return NextResponse.json({ ingredients });
  } catch (err) {
    console.error("scan-fridge error:", err);
    return NextResponse.json({ error: "Failed to scan fridge" }, { status: 500 });
  }
}
