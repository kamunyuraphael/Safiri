import "dotenv/config";
import { connectDB } from "../config/db";
import mongoose from "mongoose";
import Destination from "../models/Destination.model";
import { uploadImageFromUrl } from "../services/cloudinaryService";

async function backfill() {
  await connectDB();

  const destinations = await Destination.find({});
  console.log(`Checking ${destinations.length} destination(s) for un-migrated images...`);

  let migratedCount = 0;

  for (const destination of destinations) {
    let changed = false;

    for (const image of destination.images) {
      // Skip images that already have a Cloudinary publicId — already migrated.
      if (image.publicId) continue;

      try {
        const { url, publicId } = await uploadImageFromUrl(image.url);
        image.url = url;
        image.publicId = publicId;
        changed = true;
        migratedCount++;
      } catch (err) {
        console.warn(
          `Failed to migrate an image for "${destination.name}" (left as-is):`,
          err
        );
      }
    }

    if (changed) {
      await destination.save();
      console.log(`Updated "${destination.name}"`);
    } else {
      console.log(`Skipping "${destination.name}" — already migrated or has no images`);
    }
  }

  console.log(`Backfill complete. ${migratedCount} image(s) migrated to Cloudinary.`);
  await mongoose.disconnect();
  process.exit(0);
}

backfill().catch((err) => {
  console.error("Backfill script failed:", err);
  process.exit(1);
});
