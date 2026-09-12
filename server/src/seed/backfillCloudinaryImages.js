"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const db_1 = require("../config/db");
const mongoose_1 = __importDefault(require("mongoose"));
const Destination_model_1 = __importDefault(require("../models/Destination.model"));
const cloudinaryService_1 = require("../services/cloudinaryService");
async function backfill() {
    await (0, db_1.connectDB)();
    const destinations = await Destination_model_1.default.find({});
    console.log(`Checking ${destinations.length} destination(s) for un-migrated images...`);
    let migratedCount = 0;
    for (const destination of destinations) {
        let changed = false;
        for (const image of destination.images) {
            // Skip images that already have a Cloudinary publicId — already migrated.
            if (image.publicId)
                continue;
            try {
                const { url, publicId } = await (0, cloudinaryService_1.uploadImageFromUrl)(image.url);
                image.url = url;
                image.publicId = publicId;
                changed = true;
                migratedCount++;
            }
            catch (err) {
                console.warn(`Failed to migrate an image for "${destination.name}" (left as-is):`, err);
            }
        }
        if (changed) {
            await destination.save();
            console.log(`Updated "${destination.name}"`);
        }
        else {
            console.log(`Skipping "${destination.name}" — already migrated or has no images`);
        }
    }
    console.log(`Backfill complete. ${migratedCount} image(s) migrated to Cloudinary.`);
    await mongoose_1.default.disconnect();
    process.exit(0);
}
backfill().catch((err) => {
    console.error("Backfill script failed:", err);
    process.exit(1);
});
//# sourceMappingURL=backfillCloudinaryImages.js.map