"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const review_controller_1 = require("../controllers/review.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const upload_middleware_1 = require("../middleware/upload.middleware");
const router = (0, express_1.Router)({ mergeParams: true });
router.get("/", review_controller_1.getReviewsForDestination);
router.post("/", auth_middleware_1.requireAuth, upload_middleware_1.upload.array("images", 5), review_controller_1.createReview);
router.delete("/:id", auth_middleware_1.requireAuth, review_controller_1.deleteReview);
exports.default = router;
//# sourceMappingURL=review.routes.js.map