import { Schema, model, Document } from "mongoose";

export type DestinationCategory =
  | "national-park"
  | "beach"
  | "mountain"
  | "lake"
  | "cultural-site"
  | "town"
  | "conservancy"
  | "waterfall"
  | "urban";

export type TravelerType = "solo" | "couple" | "family" | "group" | "honeymoon";

export type BudgetTier = "budget" | "midRange" | "luxury";

export interface IDestinationImage {
  url: string;
  publicId?: string; // Cloudinary public_id, needed to delete/replace the image later
  credit?: string;   // photographer/source name
  source?: string;   // "unsplash" | "pexels" | "wikimedia" | "user-upload"
}

export interface ICostBreakdown {
  accommodation: number;  // avg cost per night
  food: number;            // avg cost per day
  transport: number;       // avg cost per day (local transport/park transfers)
  activities: number;      // avg cost per day (entry fees, guided tours, etc.)
  currency: string;
}

export interface IEstimatedCosts {
  budget: ICostBreakdown;
  midRange: ICostBreakdown;
  luxury: ICostBreakdown;
}

export interface ISeasonInfo {
  name: string;            // e.g. "Dry Season", "Long Rains"
  months: string[];        // e.g. ["Jan", "Feb", "Mar"]
  weatherSummary: string;  // e.g. "Warm, minimal rainfall, best for wildlife viewing"
  isRecommended: boolean;  // flags the best window(s) to visit
}

export interface IWildlifeSpecies {
  scientificName: string;
  commonName?: string;
  taxonKey?: number;
}

export interface IDestination extends Document {
  name: string;
  slug: string;
  region: string;          // e.g. "Rift Valley", "Coast", "Central"
  county: string;          // e.g. "Narok", "Kwale", "Nakuru"
  category: DestinationCategory;
  description: string;
  shortDescription: string;
  coordinates: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  };
  images: IDestinationImage[];

  // Budget planning
  estimatedCosts: IEstimatedCosts;
  entryFee?: {
    citizen?: number;
    resident?: number;
    nonResident?: number;
    currency: string;
  };

  // Best time to visit
  bestSeasons: ISeasonInfo[];
  climate: {
    avgTempLowC: number;
    avgTempHighC: number;
    weatherPattern: string; // short general description
  };

  // Trip-fit recommendations
  suitableFor: TravelerType[];

  wildlife: IWildlifeSpecies[];

  tags: string[];           // e.g. ["wildlife", "safari", "big-five"]
  avgRating: number;
  reviewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const costBreakdownSchema = new Schema<ICostBreakdown>(
  {
    accommodation: { type: Number, required: true },
    food: { type: Number, required: true },
    transport: { type: Number, required: true },
    activities: { type: Number, required: true },
    currency: { type: String, default: "KES" },
  },
  { _id: false }
);

const seasonInfoSchema = new Schema<ISeasonInfo>(
  {
    name: { type: String, required: true },
    months: [{ type: String, required: true }],
    weatherSummary: { type: String, required: true },
    isRecommended: { type: Boolean, default: false },
  },
  { _id: false }
);

const destinationSchema = new Schema<IDestination>(
  {
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
  },
  { timestamps: true }
);

destinationSchema.index({ coordinates: "2dsphere" });
destinationSchema.index({ name: "text", description: "text", tags: "text" });

export default model<IDestination>("Destination", destinationSchema);
