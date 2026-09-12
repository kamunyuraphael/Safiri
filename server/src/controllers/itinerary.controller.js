"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteItinerary = exports.recalculateBudget = exports.updateItinerary = exports.createItinerary = exports.getItineraryById = exports.getMyItineraries = void 0;
const express_1 = require("express");
const asyncHandler_1 = require("../utils/asyncHandler");
const Itinerary_model_1 = __importDefault(require("../models/Itinerary.model"));
const Destination_model_1 = __importDefault(require("../models/Destination.model"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const budget_service_1 = require("../services/budget.service");
// GET /api/itineraries  (current user's itineraries)
exports.getMyItineraries = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const itineraries = await Itinerary_model_1.default.find({ user: req.user.userId }).populate("stops.destination");
    res.json(itineraries);
});
// GET /api/itineraries/:id
exports.getItineraryById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const itinerary = await Itinerary_model_1.default.findOne({
        _id: req.params.id,
        user: req.user.userId,
    }).populate("stops.destination");
    if (!itinerary) {
        return res.status(404).json({ message: "Itinerary not found" });
    }
    res.json(itinerary);
});
// POST /api/itineraries
exports.createItinerary = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const itinerary = await Itinerary_model_1.default.create({ ...req.body, user: req.user.userId });
    res.status(201).json(itinerary);
});
// PUT /api/itineraries/:id  (update stops, travelerType, budgetTier, etc.)
exports.updateItinerary = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const itinerary = await Itinerary_model_1.default.findOneAndUpdate({ _id: req.params.id, user: req.user.userId }, req.body, { new: true, runValidators: true });
    if (!itinerary) {
        return res.status(404).json({ message: "Itinerary not found" });
    }
    res.json(itinerary);
});
// POST /api/itineraries/:id/recalculate-budget
exports.recalculateBudget = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const itinerary = await Itinerary_model_1.default.findOne({
        _id: req.params.id,
        user: req.user.userId,
    }).populate("stops.destination");
    if (!itinerary) {
        return res.status(404).json({ message: "Itinerary not found" });
    }
    itinerary.budgetSummary = (0, budget_service_1.calculateBudgetSummary)(itinerary);
    await itinerary.save();
    res.json(itinerary);
});
// DELETE /api/itineraries/:id
exports.deleteItinerary = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const itinerary = await Itinerary_model_1.default.findOneAndDelete({
        _id: req.params.id,
        user: req.user.userId,
    });
    if (!itinerary) {
        return res.status(404).json({ message: "Itinerary not found" });
    }
    res.json({ message: "Itinerary deleted" });
});
//# sourceMappingURL=itinerary.controller.js.map