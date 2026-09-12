/**
 * Curated seed data for Safiri's initial destination catalog.
 * Cost figures are approximate KES averages for planning purposes,
 * not live pricing. Coordinates are approximate landmark centers.
 */
export interface SeedDestinationInput {
    name: string;
    region: string;
    county: string;
    category: string;
    description: string;
    shortDescription: string;
    coordinates: [number, number];
    imageQuery: string;
    estimatedCosts: {
        budget: {
            accommodation: number;
            food: number;
            transport: number;
            activities: number;
        };
        midRange: {
            accommodation: number;
            food: number;
            transport: number;
            activities: number;
        };
        luxury: {
            accommodation: number;
            food: number;
            transport: number;
            activities: number;
        };
    };
    entryFee?: {
        citizen?: number;
        resident?: number;
        nonResident?: number;
    };
    bestSeasons: {
        name: string;
        months: string[];
        weatherSummary: string;
        isRecommended: boolean;
    }[];
    climate: {
        avgTempLowC: number;
        avgTempHighC: number;
        weatherPattern: string;
    };
    suitableFor: string[];
    tags: string[];
}
export declare const seedDestinations: SeedDestinationInput[];
//# sourceMappingURL=destinations.data.d.ts.map