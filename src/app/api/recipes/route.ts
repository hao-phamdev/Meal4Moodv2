import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data, error } = await supabase
      .from("saved_recipes")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    const recipes = (data ?? []).map((r: Record<string, unknown>) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      cookTime: r.cook_time,
      servings: r.servings,
      ingredients: r.ingredients,
      steps: r.steps,
      imageUrl: r.image_url,
      flag: r.flag ?? "🌍",
      country: r.country,
      cuisine: r.cuisine,
      mood: r.mood,
      diet: r.diet ?? [],
      createdAt: r.created_at,
    }));

    return NextResponse.json({ recipes });
  } catch (err) {
    console.error("GET /api/recipes error:", err);
    return NextResponse.json({ error: "Failed to fetch recipes" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const recipe = await req.json();

    const { data, error } = await supabase
      .from("saved_recipes")
      .insert({
        user_id: user.id,
        title: recipe.title,
        description: recipe.description,
        cook_time: recipe.cookTime,
        servings: recipe.servings,
        ingredients: recipe.ingredients,
        steps: recipe.steps,
        image_url: recipe.imageUrl,
        flag: recipe.flag,
        country: recipe.country,
        cuisine: recipe.cuisine,
        mood: recipe.mood,
        diet: recipe.diet ?? [],
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ id: data.id });
  } catch (err) {
    console.error("POST /api/recipes error:", err);
    return NextResponse.json({ error: "Failed to save recipe" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const { error } = await supabase
      .from("saved_recipes")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/recipes error:", err);
    return NextResponse.json({ error: "Failed to delete recipe" }, { status: 500 });
  }
}
