import { IItinerary } from "../models/Itinerary.model";
import { IBudgetSummary } from "../models/Itinerary.model";
/**
 * Groups stops by day to determine the number of trip days,
 * then sums each populated destination's per-day/per-night cost
 * fields for the itinerary's chosen budget tier.
 */
export declare function calculateBudgetSummary(itinerary: IItinerary): IBudgetSummary;
//# sourceMappingURL=budget.service.d.ts.map