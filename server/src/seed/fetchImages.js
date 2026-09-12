"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchDestinationImages = fetchDestinationImages;
const axios_1 = __importDefault(require("axios"));
const Destination_model_1 = require("../models/Destination.model");
const cloudinaryService_1 = require("../services/cloudinaryService");
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;
const UNSPLASH_SEARCH_URL = "https://api.unsplash.com/search/photos";
/**
 * Fetches up to `count` images for a search query from Unsplash, then
 * transfers each one to Cloudinary so the stored URL is permanent and
 * under your own control rather than a third-party hotlink. If no
 * Unsplash key is configured, returns an empty array rather than
 * failing the whole seed run — destinations can still be seeded
 * without images and backfilled later.
 */
async function fetchDestinationImages(query, count = 3) {
    if (!UNSPLASH_ACCESS_KEY) {
        console.warn(`UNSPLASH_ACCESS_KEY not set — skipping images for "${query}"`);
        return [];
    }
    try {
        const { data } = await axios_1.default.get(UNSPLASH_SEARCH_URL, {
            params: { query, per_page: count, orientation: "landscape" },
            headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` },
        });
        const images = [];
        for (const photo of data.results) {
            try {
                const { url, publicId } = await (0, cloudinaryService_1.uploadImageFromUrl)(photo.urls.regular);
                images.push({
                    url,
                    publicId,
                    credit: photo.user?.name,
                    source: "unsplash",
                });
            }
            catch (uploadErr) {
                console.warn(`Cloudinary transfer failed for one image in "${query}":`, uploadErr);
                // Fall back to the original Unsplash URL rather than losing the image entirely.
                images.push({ url: photo.urls.regular, credit: photo.user?.name, source: "unsplash" });
            }
        }
        return images;
    }
    catch (err) {
        console.warn(`Failed to fetch images for "${query}":`, err);
        return [];
    }
}
//# sourceMappingURL=fetchImages.js.map