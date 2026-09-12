"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const reviewSchema = new mongoose_1.Schema({
    destination: { type: mongoose_1.Schema.Types.ObjectId, ref: "Destination", required: true, index: true },
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, maxlength: 1000 },
    images: [{ type: String }],
    visitedDate: { type: Date },
}, { timestamps: true });
// prevent duplicate reviews by the same user for the same destination
reviewSchema.index({ destination: 1, user: 1 }, { unique: true });
exports.default = (0, mongoose_1.model)("Review", reviewSchema);
//# sourceMappingURL=Review.model.js.map