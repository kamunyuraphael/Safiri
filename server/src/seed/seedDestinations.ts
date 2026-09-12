import "dotenv/config";
import { connectDB } from "../config/db";
import mongoose from "mongoose";
import Destination from "../models/Destination.model";
import { seedDestinations } from "./data/destinations.data";
import { fetchDestinationImages } from "./fetchImages";
import { getWildlifeNearby } from "../services/external/wildlifeService";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
}

const CURRENCY = "KES";

async function seed() {
  await connectDB();

  console.log(`Seeding ${seedDestinations.length} destinations...`);

  for (const item of seedDestinations) {
    const slug = slugify(item.name);
    const existing = await Destination.findOne({ slug });

    if (existing) {
      console.log(`Skipping "${item.name}" — already seeded`);
      continue;
    }

    const images = await fetchDestinationImages(item.imageQuery);

    let wildlife: { scientificName: string; commonName?: string; taxonKey: number }[] = [];
    try {
      wildlife = await getWildlifeNearby(item.coordinates[0], item.coordinates[1]);
    } catch (err) {
      console.warn(`Failed to fetch wildlife for "${item.name}", continuing without it:`, err);
    }

    await Destination.create({
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
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed script failed:", err);
  process.exit(1);
});
