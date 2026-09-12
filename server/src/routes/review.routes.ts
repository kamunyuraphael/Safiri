import { Router } from "express";
import {
  getReviewsForDestination,
  createReview,
  deleteReview,
} from "../controllers/review.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { upload } from "../middleware/upload.middleware";

const router = Router({ mergeParams: true });

router.get("/", getReviewsForDestination);
router.post("/", requireAuth, upload.array("images", 5), createReview);
router.delete("/:id", requireAuth, deleteReview);

export default router;
