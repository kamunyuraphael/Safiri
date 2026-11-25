import { Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import Review from "../models/Review.model";
import Destination from "../models/Destination.model";
import { AuthRequest } from "../middleware/auth.middleware";
import { uploadImageFromBuffer } from "../services/cloudinaryService";
import { recalculateDestinationRating } from "../services/rating.service";
import { HttpError } from "../utils/httpError";

// GET /api/destinations/:destinationId/reviews
export const getReviewsForDestination = asyncHandler(async (req: AuthRequest, res: Response) => {
  const reviews = await Review.find({ destination: req.params.destinationId })
    .sort({ createdAt: -1 })
    .populate("user", "name avatarUrl");
  res.json(reviews);
});

// POST /api/destinations/:destinationId/reviews
export const createReview = asyncHandler(async (req: AuthRequest, res: Response) => {
  const destinationId = String(req.params.destinationId);
  const userId = req.user!.userId;

  // Check everything that can fail cheaply BEFORE uploading images, so a
  // rejected review never leaves orphaned files in Cloudinary.
  const destinationExists = await Destination.exists({ _id: destinationId });
  if (!destinationExists) {
    throw new HttpError(404, "Destination not found", "NOT_FOUND");
  }

  const alreadyReviewed = await Review.exists({ destination: destinationId, user: userId });
  if (alreadyReviewed) {
    throw new HttpError(409, "You've already reviewed this destination", "ALREADY_REVIEWED");
  }

  const files = (req.files as Express.Multer.File[]) || [];
  const uploadedImages: string[] = [];
  for (const file of files) {
    const { url } = await uploadImageFromBuffer(file.buffer, "safiri/reviews");
    uploadedImages.push(url);
  }

  // Only whitelisted fields (validated by reviewSchema) reach the database.
  const { rating, comment, visitedDate } = req.body;
  const review = await Review.create({
    rating,
    comment,
    visitedDate,
    destination: destinationId,
    user: userId,
    images: uploadedImages,
  });

  await recalculateDestinationRating(review.destination);
  res.status(201).json(review);
});

// DELETE /api/destinations/:destinationId/reviews/:id
export const deleteReview = asyncHandler(async (req: AuthRequest, res: Response) => {
  const filter: Record<string, unknown> = { _id: req.params.id };
  if (req.user!.role !== "admin") filter.user = req.user!.userId; // admins can moderate

  const review = await Review.findOneAndDelete(filter);
  if (!review) {
    throw new HttpError(404, "Review not found", "NOT_FOUND");
  }

  await recalculateDestinationRating(review.destination);
  res.json({ message: "Review deleted" });
});
