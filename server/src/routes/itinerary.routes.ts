import { Router } from "express";
import {
  getMyItineraries,
  getItineraryById,
  createItinerary,
  updateItinerary,
  recalculateBudget,
  deleteItinerary,
} from "../controllers/itinerary.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.use(requireAuth); // all itinerary routes require a logged-in user

router.get("/", getMyItineraries);
router.get("/:id", getItineraryById);
router.post("/", createItinerary);
router.put("/:id", updateItinerary);
router.post("/:id/recalculate-budget", recalculateBudget);
router.delete("/:id", deleteItinerary);

export default router;
