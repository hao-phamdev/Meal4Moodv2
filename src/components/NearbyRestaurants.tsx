"use client";
import { useState, useEffect } from "react";

interface Restaurant {
  name: string;
  distKm: number;
  lat: number;
  lon: number;
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDist(km: number): string {
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
}

interface Props {
  cuisine: string;
  onClose: () => void;
}

export default function NearbyRestaurants({ cuisine, onClose }: Props) {
  const [status, setStatus] = useState<"locating" | "loading" | "done" | "error">("locating");
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function fetch_nearby() {
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 })
        );
        if (cancelled) return;

        const { latitude: lat, longitude: lon } = pos.coords;
        setStatus("loading");

        const tag = cuisine.toLowerCase();

        // Map cuisine names to OSM tags (including common synonyms)
        const CUISINE_SYNONYMS: Record<string, string[]> = {
          japanese: ["japanese", "sushi", "ramen", "japanese;sushi"],
          chinese:  ["chinese", "dim_sum", "cantonese"],
          indian:   ["indian", "curry"],
          thai:     ["thai"],
          korean:   ["korean"],
          vietnamese: ["vietnamese", "pho"],
          mexican:  ["mexican", "tex-mex"],
          italian:  ["italian", "pizza", "pasta"],
          french:   ["french"],
          greek:    ["greek"],
          turkish:  ["turkish", "kebab"],
          moroccan: ["moroccan"],
          brazilian: ["brazilian", "churrasco"],
          peruvian: ["peruvian"],
          spanish:  ["spanish", "tapas"],
        };

        const tags = CUISINE_SYNONYMS[tag] ?? [tag];
        const tagRegex = tags.join("|");

        const query = `[out:json][timeout:15];(node["amenity"="restaurant"]["cuisine"~"${tagRegex}",i](around:5000,${lat},${lon});way["amenity"="restaurant"]["cuisine"~"${tagRegex}",i](around:5000,${lat},${lon}););out center 8;`;

        const res = await fetch("https://overpass-api.de/api/interpreter", {
          method: "POST",
          body: query,
        });
        const data = await res.json();

        const results: Restaurant[] = (data.elements ?? [])
          .filter((el: Record<string, unknown>) => (el.tags as Record<string, string>)?.name)
          .map((el: Record<string, unknown>) => {
            const elLat = (el.lat as number) ?? (el.center as Record<string, number>)?.lat;
            const elLon = (el.lon as number) ?? (el.center as Record<string, number>)?.lon;
            return {
              name: (el.tags as Record<string, string>).name,
              distKm: haversineKm(lat, lon, elLat, elLon),
              lat: elLat,
              lon: elLon,
            };
          })
          .sort((a: Restaurant, b: Restaurant) => a.distKm - b.distKm)
          .slice(0, 5);

        if (!cancelled) {
          setRestaurants(results);
          setStatus("done");
        }
      } catch (e) {
        if (!cancelled) {
          const geo = e as GeolocationPositionError;
          setErrorMsg(geo.code === 1
            ? "Location access denied. Enable location in your browser settings."
            : "Couldn't find nearby restaurants. Try again.");
          setStatus("error");
        }
      }
    }

    fetch_nearby();
    return () => { cancelled = true; };
  }, [cuisine]);

  return (
    <div style={{ marginTop: 12, background: "var(--card-bg)", border: "0.5px solid var(--m4m-light)", borderRadius: 12, padding: 16 }}>
      <h4 style={{ fontSize: 15, fontWeight: 500, color: "var(--text-primary)", margin: "0 0 12px 0" }}>
        {cuisine} restaurants near you
      </h4>

      {(status === "locating" || status === "loading") && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ height: 48, borderRadius: 8, background: "var(--border-tertiary)", opacity: 0.5, animation: "shimmer 1.4s infinite" }} />
          ))}
          <p style={{ fontSize: 12, color: "var(--text-tertiary)", textAlign: "center", margin: 0 }}>
            {status === "locating" ? "Getting your location…" : "Finding restaurants…"}
          </p>
        </div>
      )}

      {status === "error" && (
        <p style={{ fontSize: 13, color: "#A32D2D", margin: 0 }}>{errorMsg}</p>
      )}

      {status === "done" && restaurants.length === 0 && (
        <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0 }}>
          No {cuisine.toLowerCase()} restaurants found nearby. Try expanding your search area.
        </p>
      )}

      {status === "done" && restaurants.length > 0 && (
        <div>
          {restaurants.map((r, i) => (
            <div key={r.name + i}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, padding: "10px 0" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.3 }}>{r.name}</div>
                  <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6, marginTop: 6 }}>
                    <span style={{ background: "var(--m4m-surface)", color: "var(--m4m-deep)", fontSize: 11, fontWeight: 500, padding: "2px 8px", borderRadius: 20 }}>{cuisine}</span>
                    <span style={{ background: "rgba(127,142,127,0.12)", color: "var(--text-secondary)", fontSize: 11, fontWeight: 500, padding: "2px 8px", borderRadius: 20 }}>{formatDist(r.distKm)}</span>
                  </div>
                </div>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${r.lat},${r.lon}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "var(--m4m-brand)", fontSize: 13, fontWeight: 500, textDecoration: "none", whiteSpace: "nowrap", marginTop: 2 }}>
                  Directions ↗
                </a>
              </div>
              {i < restaurants.length - 1 && <div style={{ height: 1, background: "var(--border-tertiary)", opacity: 0.6 }} />}
            </div>
          ))}
          <p style={{ fontSize: 11, color: "var(--text-tertiary)", textAlign: "center", margin: "12px 0 0 0" }}>
            Data from OpenStreetMap
          </p>
        </div>
      )}

      <button
        onClick={onClose}
        style={{
          marginTop: 10, width: "100%", background: "transparent",
          border: "0.5px solid var(--border-tertiary)", color: "var(--text-secondary)",
          borderRadius: 8, height: 32, fontSize: 12, fontWeight: 500,
          fontFamily: "inherit", cursor: "pointer",
        }}>
        Close
      </button>
    </div>
  );
}
