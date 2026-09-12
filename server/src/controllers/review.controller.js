"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteReview = exports.createReview = exports.getReviewsForDestination = void 0;
const express_1 = require("express");
const asyncHandler_1 = require("../utils/asyncHandler");
const Review_model_1 = __importDefault(require("../models/Review.model"));
const Destination_model_1 = __importDefault(require("../models/Destination.model"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const cloudinaryService_1 = require("../services/cloudinaryService");
// GET /api/destinations/:destinationId/reviews
exports.getReviewsForDestination = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const reviews = await Review_model_1.default.find({ destination: req.params.destinationId }).populate("user", "name avatarUrl");
    res.json(reviews);
});
// POST /api/destinations/:destinationId/reviews
exports.createReview = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const files = req.files || [];
    const uploadedImages = [];
    for (const file of files) {
        const { url } = await (0, cloudinaryService_1.uploadImageFromBuffer)(file.buffer, "safiri/reviews");
        uploadedImages.push(url);
    }
    const review = await Review_model_1.default.create({
        ...req.body,
        destination: req.params.destinationId,
        user: req.user.userId,
        images: uploadedImages,
    });
    // recalculate destination's avgRating + reviewCount
    const stats = await Review_model_1.default.aggregate([
        { $match: { destination: review.destination } },
        { $group: { _id: "$destination", avgRating: { $avg: "$rating" }, count: { $sum: 1 } } },
    ]);
    if (stats.length > 0) {
        await Destination_model_1.default.findByIdAndUpdate(review.destination, {
            avgRating: Math.round(stats[0].avgRating * 10) / 10,
            reviewCount: stats[0].count,
        });
    }
    res.status(201).json(review);
});
// DELETE /api/reviews/:id
exports.deleteReview = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const review = await Review_model_1.default.findOneAndDelete({
        _id: req.params.id,
        user: req.user.userId,
    });
    if (!review) {
        return res.status(404).json({ message: "Review not found" });
    }
    res.json({ message: "Review deleted" });
});
//# sourceMappingURL=review.controller.js.map