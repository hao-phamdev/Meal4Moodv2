// Run: npx ts-node tools/seed-test-recipe.ts
// Seeds a test recipe into Supabase for a given user_id
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const TEST_RECIPE = {
  user_id: "REPLACE_WITH_USER_ID",
  title: "Seed Test — Pad Thai",
  description: "A test recipe seeded for development.",
  cook_time: 20,
  servings: 2,
  ingredients: ["rice noodles", "eggs", "bean sprouts", "peanuts", "fish sauce"],
  steps: ["Cook noodles", "Stir-fry everything", "Serve with lime"],
  photo_url: "https://placehold.co/800x600?text=Pad+Thai",
  country: "Thailand",
  cuisine: "Thai",
  mood: 70,
  diet: [],
};

async function seed() {
  const { error } = await supabase.from("recipes").insert(TEST_RECIPE);
  if (error) console.error("Seed failed:", error);
  else console.log("Seeded successfully.");
}

seed();
