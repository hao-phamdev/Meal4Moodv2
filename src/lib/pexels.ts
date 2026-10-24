// Food photo lookup with three progressively broader queries.
export async function fetchFoodImage(dishQuery: string, cuisineQuery: string): Promise<string> {
  const placeholder = `https://placehold.co/800x450?text=${encodeURIComponent(dishQuery)}`;
  const key = process.env.PEXELS_API_KEY;
  if (!key) return placeholder;

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

  return placeholder;
}
