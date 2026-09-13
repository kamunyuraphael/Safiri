import "dotenv/config";
import path from "path";
import fs from "fs";
import { connectDB } from "../config/db";
import mongoose from "mongoose";
import Destination from "../models/Destination.model";
import { uploadImageFromFile } from "../services/cloudinaryService";

const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];

/**
 * Expects a folder structure like:
 *
 *   server/local-images/
 *     maasai-mara-national-reserve/
 *       01.jpg
 *       02.jpg
 *     diani-beach/
 *       beach-1.jpg
 *
 * Each subfolder name must match a Destination's `slug` exactly.
 * Run with: npm run upload:local-images
 * Optional: npm run upload:local-images -- --replace
 *   (replaces existing images instead of appending to them)
 */
async function uploadLocalImages() {
  await connectDB();

  const replaceExisting = process.argv.includes("--replace");
  const baseDir = path.join(process.cwd(), "local-images");

  if (!fs.existsSync(baseDir)) {
    console.log(`No "local-images" folder found at ${baseDir}.`);
    console.log(`Create it with one subfolder per destination slug, e.g.:`);
    console.log(`  server/local-images/maasai-mara-national-reserve/photo1.jpg`);
    process.exit(0);
  }

  const slugFolders = fs.readdirSync(baseDir).filter((entry) =>
    fs.statSync(path.join(baseDir, entry)).isDirectory()
  );

  console.log(`Found ${slugFolders.length} destination folder(s) to process.`);

  for (const slug of slugFolders) {
    const destination = await Destination.findOne({ slug });
    if (!destination) {
      console.log(`Skipping "${slug}" — no destination with that slug exists.`);
      continue;
    }

    const folderPath = path.join(baseDir, slug);
    const files = fs
      .readdirSync(folderPath)
      .filter((f) => IMAGE_EXTENSIONS.includes(path.extname(f).toLowerCase()));

    if (files.length === 0) {
      console.log(`No image files found in "${slug}" folder.`);
      continue;
    }

    const uploadedImages = [];
    for (const file of files) {
      try {
        const { url, publicId } = await uploadImageFromFile(path.join(folderPath, file));
        uploadedImages.push({ url, publicId, source: "manual-upload" });
        console.log(`  Uploaded ${file} for "${destination.name}"`);
      } catch (err) {
        console.warn(`  Failed to upload ${file} for "${destination.name}":`, err);
      }
    }

    if (uploadedImages.length === 0) continue;

    destination.images = replaceExisting
      ? uploadedImages
      : [...destination.images, ...uploadedImages];

    await destination.save();
    console.log(
      `Saved ${uploadedImages.length} image(s) for "${destination.name}" (${
        replaceExisting ? "replaced" : "appended"
      })`
    );
  }

  console.log("Done.");
  await mongoose.disconnect();
  process.exit(0);
}

uploadLocalImages().catch((err) => {
  console.error("Upload script failed:", err);
  process.exit(1);
});
