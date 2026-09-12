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
export declare function geocodePlace(query: string): Promise<GeocodeResult | null>;
//# sourceMappingURL=mapsService.d.ts.map