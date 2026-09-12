export type DestinationCategory =
  | "national-park"
  | "beach"
  | "mountain"
  | "lake"
  | "cultural-site"
  | "town"
  | "conservancy"
  | "waterfall"
  | "urban";

export type TravelerType = "solo" | "couple" | "family" | "group" | "honeymoon";
export type BudgetTier = "budget" | "midRange" | "luxury";

export interface DestinationImage {
  url: string;
  credit?: string;
  source?: string;
}

export interface CostBreakdown {
  accommodation: number;
  food: number;
  transport: number;
  activities: number;
  currency: string;
}

export interface SeasonInfo {
  name: string;
  months: string[];
  weatherSummary: string;
  isRecommended: boolean;
}

export interface Destination {
  _id: string;
  name: string;
  slug: string;
  region: string;
  county: string;
  category: DestinationCategory;
  description: string;
  shortDescription: string;
  coordinates: { type: "Point"; coordinates: [number, number] };
  images: DestinationImage[];
  estimatedCosts: Record<BudgetTier, CostBreakdown>;
  bestSeasons: SeasonInfo[];
  climate: { avgTempLowC: number; avgTempHighC: number; weatherPattern: string };
  suitableFor: TravelerType[];
  tags: string[];
  avgRating: number;
  reviewCount: number;
}

export interface DestinationFilters {
  region?: string;
  category?: DestinationCategory;
  suitableFor?: TravelerType;
  search?: string;
  tag?: string;
}
