import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import Destination, { BudgetTier } from "../models/Destination.model";
import { getCurrentWeather, getClimateAverages } from "../services/external/weatherService";
import { convertFromKes } from "../services/external/currencyService";
import { getWildlifeNearby } from "../services/external/wildlifeService";

// GET /api/destinations?region=&category=&suitableFor=&search=
export const getDestinations = asyncHandler(async (req: Request, res: Response) => {
  const { region, category, suitableFor, search, tag } = req.query;

  // Coerce to plain strings so query-string tricks (arrays, nested objects)
  // can never become Mongo operators.
  const filter: Record<string, any> = {};
  if (region) filter.region = String(region);
  if (category) filter.category = String(category);
  if (suitableFor) filter.suitableFor = String(suitableFor);
  if (tag) filter.tags = String(tag);
  if (search) filter.$text = { $search: String(search).slice(0, 100) };

  const destinations = await Destination.find(filter).sort({ avgRating: -1 });
  res.json(destinations);
});

// GET /api/destinations/:slug
export const getDestinationBySlug = asyncHandler(async (req: Request, res: Response) => {
  const destination = await Destination.findOne({ slug: req.params.slug });
  if (!destination) {
    return res.status(404).json({ message: "Destination not found" });
  }
  res.json(destination);
});

// GET /api/destinations/near?lng=&lat=&maxDistanceKm=
export const getNearbyDestinations = asyncHandler(async (req: Request, res: Response) => {
  const { lng, lat, maxDistanceKm } = (req as any).validatedQuery as {
    lng: number;
    lat: number;
    maxDistanceKm: number;
  };

  const destinations = await Destination.find({
    coordinates: {
      $near: {
        $geometry: { type: "Point", coordinates: [lng, lat] },
        $maxDistance: maxDistanceKm * 1000,
      },
    },
  });
  res.json(destinations);
});

// POST /api/destinations  (admin only)
export const createDestination = asyncHandler(async (req: Request, res: Response) => {
  const destination = await Destination.create(req.body);
  res.status(201).json(destination);
});

// PUT /api/destinations/:id  (admin only)
export const updateDestination = asyncHandler(async (req: Request, res: Response) => {
  const destination = await Destination.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!destination) {
    return res.status(404).json({ message: "Destination not found" });
  }
  res.json(destination);
});

// DELETE /api/destinations/:id  (admin only)
export const deleteDestination = asyncHandler(async (req: Request, res: Response) => {
  const destination = await Destination.findByIdAndDelete(req.params.id);
  if (!destination) {
    return res.status(404).json({ message: "Destination not found" });
  }
  res.json({ message: "Destination deleted" });
});

// GET /api/destinations/:slug/weather
export const getDestinationWeather = asyncHandler(async (req: Request, res: Response) => {
  const destination = await Destination.findOne({ slug: req.params.slug });
  if (!destination) {
    return res.status(404).json({ message: "Destination not found" });
  }

  const [lng, lat] = destination.coordinates.coordinates;
  const [current, climateAverages] = await Promise.all([
    getCurrentWeather(destination.id, lng, lat),
    getClimateAverages(destination.id, lng, lat),
  ]);

  res.json({ current, climateAverages, bestSeasons: destination.bestSeasons });
});

// GET /api/destinations/:slug/budget?currency=USD&tier=midRange
export const getDestinationBudgetInCurrency = asyncHandler(async (req: Request, res: Response) => {
  const destination = await Destination.findOne({ slug: req.params.slug });
  if (!destination) {
    return res.status(404).json({ message: "Destination not found" });
  }

  const { tier, currency } = (req as any).validatedQuery as { tier: BudgetTier; currency: string };
  const costs = destination.estimatedCosts[tier];

  // Sequential on purpose: the first call warms the exchange-rate cache so
  // the remaining three don't each trigger an upstream fetch.
  const accommodation = await convertFromKes(costs.accommodation, currency);
  const food = await convertFromKes(costs.food, currency);
  const transport = await convertFromKes(costs.transport, currency);
  const activities = await convertFromKes(costs.activities, currency);

  const converted = { accommodation, food, transport, activities, currency };

  res.json({ tier, ...converted });
});

// GET /api/destinations/:slug/wildlife
export const getDestinationWildlife = asyncHandler(async (req: Request, res: Response) => {
  const destination = await Destination.findOne({ slug: req.params.slug });
  if (!destination) {
    return res.status(404).json({ message: "Destination not found" });
  }

  // Seeded at data-collection time, served straight from the document,
  // no live GBIF call, so this endpoint never hits their rate limits.
  if (destination.wildlife?.length) {
    return res.json({ destination: destination.name, wildlife: destination.wildlife });
  }

  // Fallback for destinations seeded before wildlife data existed.
  const [lng, lat] = destination.coordinates.coordinates;
  const wildlife = await getWildlifeNearby(lng, lat);
  res.json({ destination: destination.name, wildlife });
});
