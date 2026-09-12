"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const Destination_model_1 = require("./Destination.model");
const itineraryStopSchema = new mongoose_1.Schema({
    destination: { type: mongoose_1.Schema.Types.ObjectId, ref: "Destination", required: true },
    day: { type: Number, required: true, min: 1 },
    order: { type: Number, required: true, min: 0 },
    notes: { type: String },
    arrivalTime: { type: String },
}, { _id: false });
const budgetSummarySchema = new mongoose_1.Schema({
    tier: { type: String, enum: ["budget", "midRange", "luxury"], required: true },
    numTravelers: { type: Number, required: true },
    numDays: { type: Number, required: true },
    totalAccommodation: { type: Number, required: true },
    totalFood: { type: Number, required: true },
    totalTransport: { type: Number, required: true },
    totalActivities: { type: Number, required: true },
    grandTotal: { type: Number, required: true },
    currency: { type: String, default: "KES" },
}, { _id: false });
const itinerarySchema = new mongoose_1.Schema({
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true },
    travelerType: {
        type: String,
        enum: ["solo", "couple", "family", "group", "honeymoon"],
        required: true,
    },
    numTravelers: { type: Number, required: true, min: 1, default: 1 },
    budgetTier: { type: String, enum: ["budget", "midRange", "luxury"], default: "midRange" },
    startDate: { type: Date },
    endDate: { type: Date },
    stops: [itineraryStopSchema],
    budgetSummary: { type: budgetSummarySchema },
    isPublic: { type: Boolean, default: false },
}, { timestamps: true });
exports.default = (0, mongoose_1.model)("Itinerary", itinerarySchema);
//# sourceMappingURL=Itinerary.model.js.map