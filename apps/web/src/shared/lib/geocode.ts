export type GeoResult = {
  id: string;
  name: string;
  address: string;
  lng: number;
  lat: number;
};

const TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

export function geocodingEnabled(): boolean {
  return typeof TOKEN === "string" && TOKEN.length > 0;
}

type MapboxFeature = {
  id: string;
  text: string;
  place_name: string;
  center: [number, number];
};

export async function geocode(
  query: string,
  opts?: { proximity?: [number, number] },
): Promise<GeoResult[]> {
  if (!geocodingEnabled() || query.trim().length < 2) return [];
  const params = new URLSearchParams({
    access_token: TOKEN,
    limit: "6",
    language: "ru",
  });
  if (opts?.proximity) {
    params.set("proximity", `${opts.proximity[0]},${opts.proximity[1]}`);
  }
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
    query.trim(),
  )}.json?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = (await res.json()) as { features?: MapboxFeature[] };
  return (data.features ?? []).map((f) => ({
    id: f.id,
    name: f.text,
    address: f.place_name,
    lng: f.center[0],
    lat: f.center[1],
  }));
}
