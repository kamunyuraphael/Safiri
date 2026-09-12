import { Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import Review from "../models/Review.model";
import Destination from "../models/Destination.model";
import { AuthRequest } from "../middleware/auth.middleware";
import { uploadImageFromBuffer } from "../services/cloudinaryService";

// GET /api/destinations/:destinationId/reviews
export const getReviewsForDestination = asyncHandler(async (req: AuthRequest, res: Response) => {
  const reviews = await Review.find({ destination: req.params.destinationId }).populate(
    "user",
    "name avatarUrl"
  );
  res.json(reviews);
});

// POST /api/destinations/:destinationId/reviews
export const createReview = asyncHandler(async (req: AuthRequest, res: Response) => {
  const files = (req.files as Express.Multer.File[]) || [];

  const uploadedImages: string[] = [];
  for (const file of files) {
    const { url } = await uploadImageFromBuffer(file.buffer, "safiri/reviews");
    uploadedImages.push(url);
  }

  const review = await Review.create({
    ...req.body,
    destination: req.params.destinationId,
    user: req.user!.userId,
    images: uploadedImages,
  });

  // recalculate destination's avgRating + reviewCount
  const stats = await Review.aggregate([
    { $match: { destination: review.destination } },
    { $group: { _id: "$destination", avgRating: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);

  if (stats.length > 0) {
    await Destination.findByIdAndUpdate(review.destination, {
      avgRating: Math.round(stats[0].avgRating * 10) / 10,
      reviewCount: stats[0].count,
    });
  }

  res.status(201).json(review);
});

// DELETE /api/reviews/:id
export const deleteReview = asyncHandler(async (req: AuthRequest, res: Response) => {
  const review = await Review.findOneAndDelete({
    _id: req.params.id,
    user: req.user!.userId,
  });
  if (!review) {
    return res.status(404).json({ message: "Review not found" });
  }
  res.json({ message: "Review deleted" });
});
