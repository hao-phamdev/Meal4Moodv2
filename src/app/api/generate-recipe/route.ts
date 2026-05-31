import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { buildRecipePrompt } from "@/lib/prompts/recipePrompt";

const client = new Anthropic();

async function fetchFoodImage(dishQuery: string, cuisineQuery: string): Promise<string> {
  const key = process.env.PEXELS_API_KEY;
  if (!key) return `https://placehold.co/800x450?text=${encodeURIComponent(dishQuery)}`;

  const queries = [
    `${dishQuery} food`,
    `${cuisineQuery} food dish`,
    "plated food dish",
  ];

  for (const q of queries) {
    try {
      const res = await fetch(
        `https://api.pexels.com/v1/search?query=${encodeURIComponent(q)}&per_page=1&orientation=landscape`,
        { headers: { Authorization: key } }
      );
      if (!res.ok) continue;
      const data = await res.json();
      const url = data.photos?.[0]?.src?.large2x ?? data.photos?.[0]?.src?.large;
      if (url) return url;
    } catch {
      // try next query
    }
  }

  return `https://placehold.co/800x450?text=${encodeURIComponent(dishQuery)}`;
}

function parseRecipeJson(text: string) {
  const clean = text.replace(/```(?:json)?/g, "").replace(/```/g, "").trim();
  return JSON.parse(clean);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { mood, country, cuisine, dishes, diet, cookTime, ingredients, lastTitle, pinnedDish, flag } = body;

    const prompt = buildRecipePrompt({ mood, country, cuisine, dishes, diet, cookTime, ingredients, lastTitle, pinnedDish });

    let parsed: Record<string, unknown> | null = null;
    for (let attempt = 0; attempt < 2; attempt++) {
      const msg = await client.messages.create({
        model: "claude-haiku-4-5",
        max_tokens: 1024,
        messages: [{ role: "user", content: prompt }],
      });
      const text = (msg.content[0] as { type: string; text: string }).text;
      try {
        parsed = parseRecipeJson(text);
        break;
      } catch {
        if (attempt === 1) throw new Error("Failed to parse recipe JSON after retry");
      }
    }

    const title = (parsed!.title as string) || "Untitled Recipe";
    const imageUrl = await fetchFoodImage(title, cuisine);

    return NextResponse.json({
      ...parsed,
      imageUrl,
      flag: flag ?? "🌍",
      country,
      cuisine,
      mood,
      diet,
    });
  } catch (err) {
    console.error("generate-recipe error:", err);
    return NextResponse.json({ error: "Failed to generate recipe" }, { status: 500 });
  }
}
