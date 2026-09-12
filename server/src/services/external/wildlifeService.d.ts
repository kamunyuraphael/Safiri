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
export declare function getWildlifeNearby(lng: number, lat: number, radiusKm?: number): Promise<WildlifeSpecies[]>;
//# sourceMappingURL=wildlifeService.d.ts.map