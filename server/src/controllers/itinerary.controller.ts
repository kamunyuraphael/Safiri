import { Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import Itinerary from "../models/Itinerary.model";
import Destination from "../models/Destination.model";
import { AuthRequest } from "../middleware/auth.middleware";
import { calculateBudgetSummary } from "../services/budget.service";

// GET /api/itineraries  (current user's itineraries)
export const getMyItineraries = asyncHandler(async (req: AuthRequest, res: Response) => {
  const itineraries = await Itinerary.find({ user: req.user!.userId }).populate(
    "stops.destination"
  );
  res.json(itineraries);
});

// GET /api/itineraries/:id
export const getItineraryById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const itinerary = await Itinerary.findOne({
    _id: req.params.id,
    user: req.user!.userId,
  }).populate("stops.destination");

  if (!itinerary) {
    return res.status(404).json({ message: "Itinerary not found" });
  }
  res.json(itinerary);
});

// POST /api/itineraries
export const createItinerary = asyncHandler(async (req: AuthRequest, res: Response) => {
  const itinerary = await Itinerary.create({ ...req.body, user: req.user!.userId });
  res.status(201).json(itinerary);
});

// PUT /api/itineraries/:id  (update stops, travelerType, budgetTier, etc.)
export const updateItinerary = asyncHandler(async (req: AuthRequest, res: Response) => {
  const itinerary = await Itinerary.findOneAndUpdate(
    { _id: req.params.id, user: req.user!.userId },
    req.body,
    { new: true, runValidators: true }
  );

  if (!itinerary) {
    return res.status(404).json({ message: "Itinerary not found" });
  }
  res.json(itinerary);
});

// POST /api/itineraries/:id/recalculate-budget
export const recalculateBudget = asyncHandler(async (req: AuthRequest, res: Response) => {
  const itinerary = await Itinerary.findOne({
    _id: req.params.id,
    user: req.user!.userId,
  }).populate("stops.destination");

  if (!itinerary) {
    return res.status(404).json({ message: "Itinerary not found" });
  }

  itinerary.budgetSummary = calculateBudgetSummary(itinerary);
  await itinerary.save();

  res.json(itinerary);
});

// DELETE /api/itineraries/:id
export const deleteItinerary = asyncHandler(async (req: AuthRequest, res: Response) => {
  const itinerary = await Itinerary.findOneAndDelete({
    _id: req.params.id,
    user: req.user!.userId,
  });
  if (!itinerary) {
    return res.status(404).json({ message: "Itinerary not found" });
  }
  res.json({ message: "Itinerary deleted" });
});
