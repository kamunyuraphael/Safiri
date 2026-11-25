import { Router } from "express";
import {
  getReviewsForDestination,
  createReview,
  deleteReview,
} from "../controllers/review.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { upload } from "../middleware/upload.middleware";
import { validate } from "../middleware/validate.middleware";
import { reviewSchema } from "../validation/schemas";

const router = Router({ mergeParams: true });

router.get("/", getReviewsForDestination);
// multer must run first so the multipart fields exist in req.body before validation
router.post("/", requireAuth, upload.array("images", 5), validate(reviewSchema), createReview);
router.delete("/:id", requireAuth, deleteReview);

export default router;
