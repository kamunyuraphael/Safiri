import "dotenv/config";
import { connectDB } from "../config/db";
import mongoose from "mongoose";
import Destination from "../models/Destination.model";
import { fetchDestinationImages } from "./fetchImages";

// Maps destination category to a reasonable Unsplash search query,
// reusing the same imageQuery style as the main seed data.
function buildQuery(name: string): string {
  return `${name} Kenya`;
}

async function backfillMissingImages() {
  await connectDB();

  const missing = await Destination.find({
    $or: [{ images: { $size: 0 } }, { images: { $exists: false } }],
  });

  console.log(`Found ${missing.length} destination(s) with no images.`);

  for (const destination of missing) {
    const images = await fetchDestinationImages(buildQuery(destination.name));

    if (images.length === 0) {
      console.log(`Still no images for "${destination.name}" — try again later (rate limit likely).`);
      continue;
    }

    destination.images = images;
    await destination.save();
    console.log(`Backfilled ${images.length} image(s) for "${destination.name}"`);
  }

  console.log("Done.");
  await mongoose.disconnect();
  process.exit(0);
}

backfillMissingImages().catch((err) => {
  console.error("Backfill script failed:", err);
  process.exit(1);
});
