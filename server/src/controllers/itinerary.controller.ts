import { Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import Itinerary from "../models/Itinerary.model";
import Destination from "../models/Destination.model";
import { AuthRequest } from "../middleware/auth.middleware";
import { calculateBudgetSummary } from "../services/budget.service";
import { HttpError } from "../utils/httpError";

// Only the destination fields the UI and budget math actually need.
const DESTINATION_FIELDS = "name slug region county category shortDescription images estimatedCosts";

const populateStops = { path: "stops.destination", select: DESTINATION_FIELDS };

async function assertDestinationsExist(stops: { destination: string }[] | undefined) {
  if (!stops?.length) return;
  const ids = [...new Set(stops.map((s) => String(s.destination)))];
  const found = await Destination.countDocuments({ _id: { $in: ids } });
  if (found !== ids.length) {
    throw new HttpError(400, "One or more stops point to a destination that doesn't exist", "BAD_DESTINATION");
  }
}

// Fills endDate from startDate + trip length when the client didn't send one.
function inferEndDate(startDate?: Date | null, endDate?: Date | null, stops?: { day: number }[]) {
  if (endDate || !startDate || !stops?.length) return endDate ?? undefined;
  const lastDay = Math.max(...stops.map((s) => s.day));
  const end = new Date(startDate);
  end.setDate(end.getDate() + lastDay - 1);
  return end;
}

// Recomputes the budget from the saved stops so it's always in sync.
async function refreshBudget(itineraryId: string) {
  const itinerary = await Itinerary.findById(itineraryId).populate(populateStops);
  if (!itinerary) return null;
  itinerary.budgetSummary = calculateBudgetSummary(itinerary);
  await itinerary.save();
  return itinerary;
}

// GET /api/itineraries  (current user's itineraries, newest first)
export const getMyItineraries = asyncHandler(async (req: AuthRequest, res: Response) => {
  const itineraries = await Itinerary.find({ user: req.user!.userId })
    .sort({ updatedAt: -1 })
    .populate(populateStops);
  res.json(itineraries);
});

// GET /api/itineraries/:id
export const getItineraryById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const itinerary = await Itinerary.findOne({
    _id: req.params.id,
    user: req.user!.userId,
  }).populate(populateStops);

  if (!itinerary) {
    throw new HttpError(404, "Itinerary not found", "NOT_FOUND");
  }
  res.json(itinerary);
});

// POST /api/itineraries
export const createItinerary = asyncHandler(async (req: AuthRequest, res: Response) => {
  const body = req.body;
  await assertDestinationsExist(body.stops);

  const created = await Itinerary.create({
    ...body,
    endDate: inferEndDate(body.startDate, body.endDate, body.stops),
    user: req.user!.userId, // always the logged-in user, never from the body
  });

  const itinerary = await refreshBudget(created.id);
  res.status(201).json(itinerary);
});

// PUT /api/itineraries/:id
export const updateItinerary = asyncHandler(async (req: AuthRequest, res: Response) => {
  const body = req.body;

  const itinerary = await Itinerary.findOne({ _id: req.params.id, user: req.user!.userId });
  if (!itinerary) {
    throw new HttpError(404, "Itinerary not found", "NOT_FOUND");
  }

  await assertDestinationsExist(body.stops);

  itinerary.set(body); // body is schema-validated, so `user` and other internals can't be set
  if (body.stops || body.startDate) {
    itinerary.endDate = inferEndDate(itinerary.startDate, body.endDate, itinerary.stops) ?? itinerary.endDate;
  }
  await itinerary.save();

  const refreshed = await refreshBudget(itinerary.id);
  res.json(refreshed);
});

// POST /api/itineraries/:id/recalculate-budget
export const recalculateBudget = asyncHandler(async (req: AuthRequest, res: Response) => {
  const owned = await Itinerary.exists({ _id: req.params.id, user: req.user!.userId });
  if (!owned) {
    throw new HttpError(404, "Itinerary not found", "NOT_FOUND");
  }
  const itinerary = await refreshBudget(String(req.params.id));
  res.json(itinerary);
});

// DELETE /api/itineraries/:id
export const deleteItinerary = asyncHandler(async (req: AuthRequest, res: Response) => {
  const itinerary = await Itinerary.findOneAndDelete({
    _id: req.params.id,
    user: req.user!.userId,
  });
  if (!itinerary) {
    throw new HttpError(404, "Itinerary not found", "NOT_FOUND");
  }
  res.json({ message: "Itinerary deleted" });
});
