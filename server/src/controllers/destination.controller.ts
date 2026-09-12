import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import Destination from "../models/Destination.model";
import { getCurrentWeather, getClimateAverages } from "../services/external/weatherService";
import { convertFromKes } from "../services/external/currencyService";
import { getWildlifeNearby } from "../services/external/wildlifeService";

// GET /api/destinations?region=&category=&suitableFor=&search=
export const getDestinations = asyncHandler(async (req: Request, res: Response) => {
  const { region, category, suitableFor, search, tag } = req.query;

  const filter: Record<string, any> = {};
  if (region) filter.region = region;
  if (category) filter.category = category;
  if (suitableFor) filter.suitableFor = suitableFor;
  if (tag) filter.tags = tag;
  if (search) filter.$text = { $search: String(search) };

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
  const { lng, lat, maxDistanceKm = 100 } = req.query;

  const destinations = await Destination.find({
    coordinates: {
      $near: {
        $geometry: { type: "Point", coordinates: [Number(lng), Number(lat)] },
        $maxDistance: Number(maxDistanceKm) * 1000,
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

  const tier = (req.query.tier as string) || "midRange";
  const currency = (req.query.currency as string) || "KES";
  const costs = destination.estimatedCosts[tier as keyof typeof destination.estimatedCosts];

  if (!costs) {
    return res.status(400).json({ message: `Invalid budget tier: ${tier}` });
  }

  const converted = {
    accommodation: await convertFromKes(costs.accommodation, currency),
    food: await convertFromKes(costs.food, currency),
    transport: await convertFromKes(costs.transport, currency),
    activities: await convertFromKes(costs.activities, currency),
    currency: currency.toUpperCase(),
  };

  res.json({ tier, ...converted });
});

// GET /api/destinations/:slug/wildlife
export const getDestinationWildlife = asyncHandler(async (req: Request, res: Response) => {
  const destination = await Destination.findOne({ slug: req.params.slug });
  if (!destination) {
    return res.status(404).json({ message: "Destination not found" });
  }

  // Seeded at data-collection time — served straight from the document,
  // no live GBIF call, so this endpoint never hits their rate limits.
  if (destination.wildlife?.length) {
    return res.json({ destination: destination.name, wildlife: destination.wildlife });
  }

  // Fallback for destinations seeded before wildlife data existed.
  const [lng, lat] = destination.coordinates.coordinates;
  const wildlife = await getWildlifeNearby(lng, lat);
  res.json({ destination: destination.name, wildlife });
});
