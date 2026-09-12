"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDestinationWildlife = exports.getDestinationBudgetInCurrency = exports.getDestinationWeather = exports.deleteDestination = exports.updateDestination = exports.createDestination = exports.getNearbyDestinations = exports.getDestinationBySlug = exports.getDestinations = void 0;
const express_1 = require("express");
const asyncHandler_1 = require("../utils/asyncHandler");
const Destination_model_1 = __importDefault(require("../models/Destination.model"));
const weatherService_1 = require("../services/external/weatherService");
const currencyService_1 = require("../services/external/currencyService");
const wildlifeService_1 = require("../services/external/wildlifeService");
// GET /api/destinations?region=&category=&suitableFor=&search=
exports.getDestinations = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { region, category, suitableFor, search, tag } = req.query;
    const filter = {};
    if (region)
        filter.region = region;
    if (category)
        filter.category = category;
    if (suitableFor)
        filter.suitableFor = suitableFor;
    if (tag)
        filter.tags = tag;
    if (search)
        filter.$text = { $search: String(search) };
    const destinations = await Destination_model_1.default.find(filter).sort({ avgRating: -1 });
    res.json(destinations);
});
// GET /api/destinations/:slug
exports.getDestinationBySlug = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const destination = await Destination_model_1.default.findOne({ slug: req.params.slug });
    if (!destination) {
        return res.status(404).json({ message: "Destination not found" });
    }
    res.json(destination);
});
// GET /api/destinations/near?lng=&lat=&maxDistanceKm=
exports.getNearbyDestinations = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { lng, lat, maxDistanceKm = 100 } = req.query;
    const destinations = await Destination_model_1.default.find({
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
exports.createDestination = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const destination = await Destination_model_1.default.create(req.body);
    res.status(201).json(destination);
});
// PUT /api/destinations/:id  (admin only)
exports.updateDestination = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const destination = await Destination_model_1.default.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });
    if (!destination) {
        return res.status(404).json({ message: "Destination not found" });
    }
    res.json(destination);
});
// DELETE /api/destinations/:id  (admin only)
exports.deleteDestination = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const destination = await Destination_model_1.default.findByIdAndDelete(req.params.id);
    if (!destination) {
        return res.status(404).json({ message: "Destination not found" });
    }
    res.json({ message: "Destination deleted" });
});
// GET /api/destinations/:slug/weather
exports.getDestinationWeather = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const destination = await Destination_model_1.default.findOne({ slug: req.params.slug });
    if (!destination) {
        return res.status(404).json({ message: "Destination not found" });
    }
    const [lng, lat] = destination.coordinates.coordinates;
    const [current, climateAverages] = await Promise.all([
        (0, weatherService_1.getCurrentWeather)(destination.id, lng, lat),
        (0, weatherService_1.getClimateAverages)(destination.id, lng, lat),
    ]);
    res.json({ current, climateAverages, bestSeasons: destination.bestSeasons });
});
// GET /api/destinations/:slug/budget?currency=USD&tier=midRange
exports.getDestinationBudgetInCurrency = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const destination = await Destination_model_1.default.findOne({ slug: req.params.slug });
    if (!destination) {
        return res.status(404).json({ message: "Destination not found" });
    }
    const tier = req.query.tier || "midRange";
    const currency = req.query.currency || "KES";
    const costs = destination.estimatedCosts[tier];
    if (!costs) {
        return res.status(400).json({ message: `Invalid budget tier: ${tier}` });
    }
    const converted = {
        accommodation: await (0, currencyService_1.convertFromKes)(costs.accommodation, currency),
        food: await (0, currencyService_1.convertFromKes)(costs.food, currency),
        transport: await (0, currencyService_1.convertFromKes)(costs.transport, currency),
        activities: await (0, currencyService_1.convertFromKes)(costs.activities, currency),
        currency: currency.toUpperCase(),
    };
    res.json({ tier, ...converted });
});
// GET /api/destinations/:slug/wildlife
exports.getDestinationWildlife = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const destination = await Destination_model_1.default.findOne({ slug: req.params.slug });
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
    const wildlife = await (0, wildlifeService_1.getWildlifeNearby)(lng, lat);
    res.json({ destination: destination.name, wildlife });
});
//# sourceMappingURL=destination.controller.js.map