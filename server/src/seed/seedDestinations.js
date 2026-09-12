"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const db_1 = require("../config/db");
const mongoose_1 = __importDefault(require("mongoose"));
const Destination_model_1 = __importDefault(require("../models/Destination.model"));
const destinations_data_1 = require("./data/destinations.data");
const fetchImages_1 = require("./fetchImages");
const wildlifeService_1 = require("../services/external/wildlifeService");
function slugify(name) {
    return name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-");
}
const CURRENCY = "KES";
async function seed() {
    await (0, db_1.connectDB)();
    console.log(`Seeding ${destinations_data_1.seedDestinations.length} destinations...`);
    for (const item of destinations_data_1.seedDestinations) {
        const slug = slugify(item.name);
        const existing = await Destination_model_1.default.findOne({ slug });
        if (existing) {
            console.log(`Skipping "${item.name}" — already seeded`);
            continue;
        }
        const images = await (0, fetchImages_1.fetchDestinationImages)(item.imageQuery);
        let wildlife = [];
        try {
            wildlife = await (0, wildlifeService_1.getWildlifeNearby)(item.coordinates[0], item.coordinates[1]);
        }
        catch (err) {
            console.warn(`Failed to fetch wildlife for "${item.name}", continuing without it:`, err);
        }
        await Destination_model_1.default.create({
            name: item.name,
            slug,
            region: item.region,
            county: item.county,
            category: item.category,
            description: item.description,
            shortDescription: item.shortDescription,
            coordinates: { type: "Point", coordinates: item.coordinates },
            images,
            estimatedCosts: {
                budget: { ...item.estimatedCosts.budget, currency: CURRENCY },
                midRange: { ...item.estimatedCosts.midRange, currency: CURRENCY },
                luxury: { ...item.estimatedCosts.luxury, currency: CURRENCY },
            },
            entryFee: item.entryFee ? { ...item.entryFee, currency: CURRENCY } : undefined,
            bestSeasons: item.bestSeasons,
            climate: item.climate,
            suitableFor: item.suitableFor,
            wildlife,
            tags: item.tags,
        });
        console.log(`Seeded "${item.name}" with ${images.length} image(s), ${wildlife.length} species`);
    }
    console.log("Seeding complete.");
    await mongoose_1.default.disconnect();
    process.exit(0);
}
seed().catch((err) => {
    console.error("Seed script failed:", err);
    process.exit(1);
});
//# sourceMappingURL=seedDestinations.js.map