import type { BudgetTier, Destination } from "@/types/destination";
import type { BudgetSummary } from "@/types/itinerary";

type CostSource = Pick<Destination, "_id" | "estimatedCosts">;

/**
 * Mirrors the server's calculation so the planner can show a live total while
 * editing: every distinct (destination, day) pair costs one night of
 * accommodation plus a day of food, transport and activities, per traveler.
 * The server recomputes the saved figure, so this is only a preview.
 */
export function calculateBudget(
  stops: { destinationId: string; day: number }[],
  destinations: Map<string, CostSource>,
  tier: BudgetTier,
  numTravelers: number
): BudgetSummary {
  const seen = new Set<string>();
  const days = new Set<number>();
  let totalAccommodation = 0;
  let totalFood = 0;
  let totalTransport = 0;
  let totalActivities = 0;
  let currency = "KES";

  for (const stop of stops) {
    const costs = destinations.get(stop.destinationId)?.estimatedCosts?.[tier];
    if (!costs) continue;

    days.add(stop.day);
    const key = `${stop.destinationId}:${stop.day}`;
    if (seen.has(key)) continue;
    seen.add(key);

    currency = costs.currency || currency;
    totalAccommodation += costs.accommodation * numTravelers;
    totalFood += costs.food * numTravelers;
    totalTransport += costs.transport * numTravelers;
    totalActivities += costs.activities * numTravelers;
  }

  return {
    tier,
    numTravelers,
    numDays: days.size || 1,
    totalAccommodation,
    totalFood,
    totalTransport,
    totalActivities,
    grandTotal: totalAccommodation + totalFood + totalTransport + totalActivities,
    currency,
  };
}

export function formatMoney(currency: string, amount: number): string {
  return `${currency} ${Math.round(amount).toLocaleString()}`;
}

export const TIER_LABELS: Record<BudgetTier, string> = {
  budget: "Budget",
  midRange: "Mid-range",
  luxury: "Luxury",
};
