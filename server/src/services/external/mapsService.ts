import axios from "axios";

const MAPBOX_TOKEN = process.env.MAPBOX_ACCESS_TOKEN;
const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const MAPBOX_URL = "https://api.mapbox.com/geocoding/v5/mapbox.places";

export interface GeocodeResult {
  lng: number;
  lat: number;
  placeName: string;
  source: "mapbox" | "nominatim";
}

/**
 * Geocodes a place name (e.g. "Maasai Mara, Kenya") to coordinates.
 * Used at seed time — coordinates are stored on the Destination document
 * afterward, so this is not called on every request.
 */
export async function geocodePlace(query: string): Promise<GeocodeResult | null> {
  if (MAPBOX_TOKEN) {
    try {
      const { data } = await axios.get(`${MAPBOX_URL}/${encodeURIComponent(query)}.json`, {
        params: { access_token: MAPBOX_TOKEN, country: "KE", limit: 1 },
      });

      const feature = data.features?.[0];
      if (feature) {
        const [lng, lat] = feature.center;
        return { lng, lat, placeName: feature.place_name, source: "mapbox" };
      }
    } catch (err) {
      console.warn("Mapbox geocoding failed, falling back to Nominatim:", err);
    }
  }

  // Fallback: free, no key required, but rate-limited (max ~1 req/sec)
  const { data } = await axios.get(NOMINATIM_URL, {
    params: { q: `${query}, Kenya`, format: "json", limit: 1 },
    headers: { "User-Agent": "Safiri-Travel-App/1.0" },
  });

  const result = data?.[0];
  if (!result) return null;

  return {
    lng: parseFloat(result.lon),
    lat: parseFloat(result.lat),
    placeName: result.display_name,
    source: "nominatim",
  };
}
