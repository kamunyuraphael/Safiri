"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateBudgetSummary = calculateBudgetSummary;
const Itinerary_model_1 = require("../models/Itinerary.model");
const Destination_model_1 = require("../models/Destination.model");
const Itinerary_model_2 = require("../models/Itinerary.model");
/**
 * Groups stops by day to determine the number of trip days,
 * then sums each populated destination's per-day/per-night cost
 * fields for the itinerary's chosen budget tier.
 */
function calculateBudgetSummary(itinerary) {
    const tier = itinerary.budgetTier;
    const numTravelers = itinerary.numTravelers;
    const uniqueDays = new Set(itinerary.stops.map((s) => s.day));
    const numDays = uniqueDays.size || 1;
    let totalAccommodation = 0;
    let totalFood = 0;
    let totalTransport = 0;
    let totalActivities = 0;
    let currency = "KES";
    // one cost entry per unique destination visited (avoids double-counting
    // accommodation if the same destination spans multiple days as one stop)
    const seenDestinations = new Set();
    for (const stop of itinerary.stops) {
        const destination = stop.destination;
        if (!destination || !destination.estimatedCosts)
            continue;
        const destId = destination.id?.toString() ?? String(destination._id);
        const costs = destination.estimatedCosts[tier];
        currency = costs.currency;
        if (!seenDestinations.has(destId)) {
            totalAccommodation += costs.accommodation * numTravelers;
            seenDestinations.add(destId);
        }
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
//# sourceMappingURL=budget.service.js.map