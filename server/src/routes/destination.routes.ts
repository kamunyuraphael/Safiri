import { Router } from "express";
import {
  getDestinations,
  getDestinationBySlug,
  getNearbyDestinations,
  createDestination,
  updateDestination,
  deleteDestination,
  getDestinationWeather,
  getDestinationBudgetInCurrency,
  getDestinationWildlife,
} from "../controllers/destination.controller";
import { requireAuth, requireAdmin } from "../middleware/auth.middleware";
import reviewRoutes from "./review.routes";

const router = Router();

router.get("/", getDestinations);
router.get("/near", getNearbyDestinations);
router.get("/:slug", getDestinationBySlug);
router.get("/:slug/weather", getDestinationWeather);
router.get("/:slug/budget", getDestinationBudgetInCurrency);
router.get("/:slug/wildlife", getDestinationWildlife);

router.post("/", requireAuth, requireAdmin, createDestination);
router.put("/:id", requireAuth, requireAdmin, updateDestination);
router.delete("/:id", requireAuth, requireAdmin, deleteDestination);

// nested: /api/destinations/:destinationId/reviews
router.use("/:destinationId/reviews", reviewRoutes);

export default router;
