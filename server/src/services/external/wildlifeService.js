"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWildlifeNearby = getWildlifeNearby;
const axios_1 = __importDefault(require("axios"));
const GBIF_OCCURRENCE_URL = "https://api.gbif.org/v1/occurrence/search";
/**
 * Looks up commonly-recorded species near a destination's coordinates.
 * Called at seed time and stored on the Destination document (or a
 * dedicated field) since species lists rarely change day-to-day.
 */
async function getWildlifeNearby(lng, lat, radiusKm = 25) {
    // GBIF doesn't take a radius directly; use a bounding decimal-degree offset
    // as a simple approximation (~1 degree ≈ 111km at the equator).
    const offset = radiusKm / 111;
    const { data } = await axios_1.default.get(GBIF_OCCURRENCE_URL, {
        params: {
            decimalLatitude: `${lat - offset},${lat + offset}`,
            decimalLongitude: `${lng - offset},${lng + offset}`,
            kingdomKey: 1, // Animalia
            limit: 50,
        },
    });
    const seen = new Map();
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
//# sourceMappingURL=wildlifeService.js.map