import { z } from "zod";

const objectId = z.string().regex(/^[a-f\d]{24}$/i, "must be a valid id");

export const travelerTypes = ["solo", "couple", "family", "group", "honeymoon"] as const;
export const budgetTiers = ["budget", "midRange", "luxury"] as const;

// ---------- auth ----------
export const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(60),
  email: z.string().trim().toLowerCase().email("Enter a valid email address").max(254),
  // bcrypt only uses the first 72 bytes, so cap there instead of silently truncating.
  password: z.string().min(8, "Password must be at least 8 characters").max(72, "Password must be 72 characters or fewer"),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required").max(72),
});

// ---------- chat ----------
export const chatSchema = z.object({
  messages: z
    .array(
      z.object({
        // "system" is deliberately not allowed: clients must not be able to inject instructions.
        role: z.enum(["user", "assistant"]),
        content: z.string().trim().min(1).max(1000, "Messages are limited to 1000 characters"),
      })
    )
    .min(1, "messages[] is required")
    .max(40)
    .refine((m) => m[m.length - 1].role === "user", "The last message must come from the user"),
});

// ---------- itineraries ----------
const stopSchema = z.object({
  destination: objectId,
  day: z.number().int().min(1).max(60),
  order: z.number().int().min(0).max(50),
  notes: z.string().trim().max(500).optional(),
  arrivalTime: z.string().trim().max(20).optional(),
});

const itineraryBase = z.object({
  title: z.string().trim().min(1, "Give your trip a title").max(100),
  travelerType: z.enum(travelerTypes),
  numTravelers: z.number().int().min(1).max(50),
  budgetTier: z.enum(budgetTiers),
  startDate: z.coerce.date().optional().nullable(),
  endDate: z.coerce.date().optional().nullable(),
  stops: z.array(stopSchema).max(150),
  isPublic: z.boolean(),
});

// Create: sensible defaults for the optional bits.
export const itineraryBodySchema = itineraryBase.extend({
  budgetTier: z.enum(budgetTiers).default("midRange"),
  stops: z.array(stopSchema).max(150).default([]),
  isPublic: z.boolean().default(false),
});

// Update: every field optional, and no defaults so omitted fields stay untouched.
export const itineraryUpdateSchema = itineraryBase.partial();

// ---------- reviews ----------
export const reviewSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().min(1, "Write a short comment").max(1000),
  visitedDate: z.coerce.date().optional(),
});

// ---------- destinations ----------
export const nearbyQuerySchema = z.object({
  lng: z.coerce.number({ error: "lng (longitude) is required and must be a number" }).min(-180).max(180),
  lat: z.coerce.number({ error: "lat (latitude) is required and must be a number" }).min(-90).max(90),
  maxDistanceKm: z.coerce.number().positive().max(500).default(100),
});

export const budgetQuerySchema = z.object({
  tier: z.enum(budgetTiers).default("midRange"),
  currency: z.string().trim().length(3, "Currency must be a 3-letter code").toUpperCase().default("KES"),
});
