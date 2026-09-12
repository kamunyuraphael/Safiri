"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const costBreakdownSchema = new mongoose_1.Schema({
    accommodation: { type: Number, required: true },
    food: { type: Number, required: true },
    transport: { type: Number, required: true },
    activities: { type: Number, required: true },
    currency: { type: String, default: "KES" },
}, { _id: false });
const seasonInfoSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    months: [{ type: String, required: true }],
    weatherSummary: { type: String, required: true },
    isRecommended: { type: Boolean, default: false },
}, { _id: false });
const destinationSchema = new mongoose_1.Schema({
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    region: { type: String, required: true, index: true },
    county: { type: String, required: true, index: true },
    category: {
        type: String,
        required: true,
        enum: [
            "national-park",
            "beach",
            "mountain",
            "lake",
            "cultural-site",
            "town",
            "conservancy",
            "waterfall",
            "urban",
        ],
        index: true,
    },
    description: { type: String, required: true },
    shortDescription: { type: String, required: true, maxlength: 200 },
    coordinates: {
        type: {
            type: String,
            enum: ["Point"],
            default: "Point",
        },
        coordinates: {
            type: [Number], // [lng, lat]
            required: true,
        },
    },
    images: [
        {
            url: { type: String, required: true },
            publicId: { type: String },
            credit: { type: String },
            source: { type: String },
        },
    ],
    estimatedCosts: {
        budget: { type: costBreakdownSchema, required: true },
        midRange: { type: costBreakdownSchema, required: true },
        luxury: { type: costBreakdownSchema, required: true },
    },
    entryFee: {
        citizen: { type: Number },
        resident: { type: Number },
        nonResident: { type: Number },
        currency: { type: String, default: "KES" },
    },
    bestSeasons: [seasonInfoSchema],
    climate: {
        avgTempLowC: { type: Number, required: true },
        avgTempHighC: { type: Number, required: true },
        weatherPattern: { type: String, required: true },
    },
    suitableFor: [
        {
            type: String,
            enum: ["solo", "couple", "family", "group", "honeymoon"],
            index: true,
        },
    ],
    wildlife: [
        {
            scientificName: { type: String, required: true },
            commonName: { type: String },
            taxonKey: { type: Number },
        },
    ],
    tags: [{ type: String, index: true }],
    avgRating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
}, { timestamps: true });
destinationSchema.index({ coordinates: "2dsphere" });
destinationSchema.index({ name: "text", description: "text", tags: "text" });
exports.default = (0, mongoose_1.model)("Destination", destinationSchema);
//# sourceMappingURL=Destination.model.js.map