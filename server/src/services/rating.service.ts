import { Types } from "mongoose";
import Review from "../models/Review.model";
import Destination from "../models/Destination.model";

/** Recomputes a destination's avgRating and reviewCount from its reviews. */
export async function recalculateDestinationRating(destinationId: Types.ObjectId | string): Promise<void> {
  const id = new Types.ObjectId(String(destinationId));

  const stats = await Review.aggregate([
    { $match: { destination: id } },
    { $group: { _id: "$destination", avgRating: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);

  const avgRating = stats.length ? Math.round(stats[0].avgRating * 10) / 10 : 0;
  const reviewCount = stats.length ? stats[0].count : 0;

  await Destination.findByIdAndUpdate(id, { avgRating, reviewCount });
}
