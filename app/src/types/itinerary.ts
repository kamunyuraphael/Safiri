import type { BudgetTier, Destination, TravelerType } from "./destination";

// The server populates only these destination fields on itinerary stops.
export type StopDestination = Pick<
  Destination,
  "_id" | "name" | "slug" | "region" | "county" | "category" | "shortDescription" | "images" | "estimatedCosts"
>;

export interface ItineraryStop {
  destination: StopDestination | string;
  day: number;
  order: number;
  notes?: string;
}

export interface BudgetSummary {
  tier: BudgetTier;
  numTravelers: number;
  numDays: number;
  totalAccommodation: number;
  totalFood: number;
  totalTransport: number;
  totalActivities: number;
  grandTotal: number;
  currency: string;
}

export interface Itinerary {
  _id: string;
  title: string;
  travelerType: TravelerType;
  numTravelers: number;
  budgetTier: BudgetTier;
  startDate?: string;
  endDate?: string;
  stops: ItineraryStop[];
  budgetSummary?: BudgetSummary;
  createdAt: string;
  updatedAt: string;
}

export interface ItineraryInput {
  title: string;
  travelerType: TravelerType;
  numTravelers: number;
  budgetTier: BudgetTier;
  startDate?: string | null;
  stops: { destination: string; day: number; order: number; notes?: string }[];
}
