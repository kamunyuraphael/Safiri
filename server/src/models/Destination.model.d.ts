import { Document } from "mongoose";
export type DestinationCategory = "national-park" | "beach" | "mountain" | "lake" | "cultural-site" | "town" | "conservancy" | "waterfall" | "urban";
export type TravelerType = "solo" | "couple" | "family" | "group" | "honeymoon";
export type BudgetTier = "budget" | "midRange" | "luxury";
export interface IDestinationImage {
    url: string;
    publicId?: string;
    credit?: string;
    source?: string;
}
export interface ICostBreakdown {
    accommodation: number;
    food: number;
    transport: number;
    activities: number;
    currency: string;
}
export interface IEstimatedCosts {
    budget: ICostBreakdown;
    midRange: ICostBreakdown;
    luxury: ICostBreakdown;
}
export interface ISeasonInfo {
    name: string;
    months: string[];
    weatherSummary: string;
    isRecommended: boolean;
}
export interface IWildlifeSpecies {
    scientificName: string;
    commonName?: string;
    taxonKey?: number;
}
export interface IDestination extends Document {
    name: string;
    slug: string;
    region: string;
    county: string;
    category: DestinationCategory;
    description: string;
    shortDescription: string;
    coordinates: {
        type: "Point";
        coordinates: [number, number];
    };
    images: IDestinationImage[];
    estimatedCosts: IEstimatedCosts;
    entryFee?: {
        citizen?: number;
        resident?: number;
        nonResident?: number;
        currency: string;
    };
    bestSeasons: ISeasonInfo[];
    climate: {
        avgTempLowC: number;
        avgTempHighC: number;
        weatherPattern: string;
    };
    suitableFor: TravelerType[];
    wildlife: IWildlifeSpecies[];
    tags: string[];
    avgRating: number;
    reviewCount: number;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: import("mongoose").Model<IDestination, {}, {}, {}, Document<unknown, {}, IDestination, {}, import("mongoose").DefaultSchemaOptions> & IDestination & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IDestination>;
export default _default;
//# sourceMappingURL=Destination.model.d.ts.map