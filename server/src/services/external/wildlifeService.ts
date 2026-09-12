import axios from "axios";

const GBIF_OCCURRENCE_URL = "https://api.gbif.org/v1/occurrence/search";

export interface WildlifeSpecies {
  scientificName: string;
  commonName?: string;
  taxonKey: number;
}

/**
 * Looks up commonly-recorded species near a destination's coordinates.
 * Called at seed time and stored on the Destination document (or a
 * dedicated field) since species lists rarely change day-to-day.
 */
export async function getWildlifeNearby(
  lng: number,
  lat: number,
  radiusKm = 25
): Promise<WildlifeSpecies[]> {
  // GBIF doesn't take a radius directly; use a bounding decimal-degree offset
  // as a simple approximation (~1 degree ≈ 111km at the equator).
  const offset = radiusKm / 111;

  const { data } = await axios.get(GBIF_OCCURRENCE_URL, {
    params: {
      decimalLatitude: `${lat - offset},${lat + offset}`,
      decimalLongitude: `${lng - offset},${lng + offset}`,
      kingdomKey: 1, // Animalia
      limit: 50,
    },
  });

  const seen = new Map<number, WildlifeSpecies>();

  for (const record of data.results || []) {
    if (record.taxonKey && record.scientificName && !seen.has(record.taxonKey)) {
      seen.set(record.taxonKey, {
        scientificName: record.scientificName,
        commonName: record.vernacularName,
        taxonKey: record.taxonKey,
      });
    }
  }

  return Array.from(seen.values());
}
