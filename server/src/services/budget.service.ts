import { IItinerary } from "../models/Itinerary.model";
import { IDestination, BudgetTier } from "../models/Destination.model";
import { IBudgetSummary } from "../models/Itinerary.model";

/**
 * Each (destination, day) pair is one day on the ground, so it costs one
 * night of accommodation plus one day of food, transport and activities,
 * per traveler. Several stops at the same destination on the same day are
 * still one day there and are not charged twice.
 *
 * (The previous version charged accommodation once per destination no
 * matter how many days were spent there, which under-counted longer stays.)
 */
export function calculateBudgetSummary(itinerary: IItinerary): IBudgetSummary {
  const tier: BudgetTier = itinerary.budgetTier;
  const numTravelers = itinerary.numTravelers;
  const uniqueDays = new Set(itinerary.stops.map((s) => s.day));
  const numDays = uniqueDays.size || 1;

  let totalAccommodation = 0;
  let totalFood = 0;
  let totalTransport = 0;
  let totalActivities = 0;
  let currency = "KES";

  const seen = new Set<string>();

  for (const stop of itinerary.stops) {
    const destination = stop.destination as unknown as IDestination;
    const costs = destination?.estimatedCosts?.[tier];
    if (!costs) continue;

    const key = `${String(destination._id)}:${stop.day}`;
    if (seen.has(key)) continue;
    seen.add(key);

    currency = costs.currency || currency;
    totalAccommodation += costs.accommodation * numTravelers;
    totalFood += costs.food * numTravelers;
    totalTransport += costs.transport * numTravelers;
    totalActivities += costs.activities * numTravelers;
  }

  const grandTotal = totalAccommodation + totalFood + totalTransport + totalActivities;

  return {
    tier,
    numTravelers,
    numDays,
    totalAccommodation,
    totalFood,
    totalTransport,
    totalActivities,
    grandTotal,
    currency,
  };
}
