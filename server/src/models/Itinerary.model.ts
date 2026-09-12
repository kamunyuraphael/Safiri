import { Schema, model, Document, Types } from "mongoose";
import { BudgetTier } from "./Destination.model";

export interface IItineraryStop {
  destination: Types.ObjectId;
  day: number;              // day number within the trip (1, 2, 3...)
  order: number;            // order of stop within that day
  notes?: string;
  arrivalTime?: string;     // "9:00 AM" style, optional
}

export interface IBudgetSummary {
  tier: BudgetTier;
  numTravelers: number;
  numDays: number;
  totalAccommodation: number;
  totalFood: number;
  totalTransport: number;
  totalActivities: number;
  grandTotal: number;
  currency: string;
}

export interface IItinerary extends Document {
  user: Types.ObjectId;
  title: string;
  travelerType: "solo" | "couple" | "family" | "group" | "honeymoon";
  numTravelers: number;
  budgetTier: BudgetTier;
  startDate?: Date;
  endDate?: Date;
  stops: IItineraryStop[];
  budgetSummary?: IBudgetSummary;   // computed from stops + destination costs
  isPublic: boolean;                 // allow sharing itineraries later
  createdAt: Date;
  updatedAt: Date;
}

const itineraryStopSchema = new Schema<IItineraryStop>(
  {
    destination: { type: Schema.Types.ObjectId, ref: "Destination", required: true },
    day: { type: Number, required: true, min: 1 },
    order: { type: Number, required: true, min: 0 },
    notes: { type: String },
    arrivalTime: { type: String },
  },
  { _id: false }
);

const budgetSummarySchema = new Schema<IBudgetSummary>(
  {
    tier: { type: String, enum: ["budget", "midRange", "luxury"], required: true },
    numTravelers: { type: Number, required: true },
    numDays: { type: Number, required: true },
    totalAccommodation: { type: Number, required: true },
    totalFood: { type: Number, required: true },
    totalTransport: { type: Number, required: true },
    totalActivities: { type: Number, required: true },
    grandTotal: { type: Number, required: true },
    currency: { type: String, default: "KES" },
  },
  { _id: false }
);

const itinerarySchema = new Schema<IItinerary>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true },
    travelerType: {
      type: String,
      enum: ["solo", "couple", "family", "group", "honeymoon"],
      required: true,
    },
    numTravelers: { type: Number, required: true, min: 1, default: 1 },
    budgetTier: { type: String, enum: ["budget", "midRange", "luxury"], default: "midRange" },
    startDate: { type: Date },
    endDate: { type: Date },
    stops: [itineraryStopSchema],
    budgetSummary: { type: budgetSummarySchema },
    isPublic: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default model<IItinerary>("Itinerary", itinerarySchema);
