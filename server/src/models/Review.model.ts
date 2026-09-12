import { Schema, model, Document, Types } from "mongoose";

export interface IReview extends Document {
  destination: Types.ObjectId;
  user: Types.ObjectId;
  rating: number;          // 1-5
  comment: string;
  images: string[];        // Cloudinary URLs from user uploads
  visitedDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    destination: { type: Schema.Types.ObjectId, ref: "Destination", required: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, maxlength: 1000 },
    images: [{ type: String }],
    visitedDate: { type: Date },
  },
  { timestamps: true }
);

// prevent duplicate reviews by the same user for the same destination
reviewSchema.index({ destination: 1, user: 1 }, { unique: true });

export default model<IReview>("Review", reviewSchema);
