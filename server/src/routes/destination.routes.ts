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
import { validate } from "../middleware/validate.middleware";
import { nearbyQuerySchema, budgetQuerySchema } from "../validation/schemas";
import reviewRoutes from "./review.routes";

const router = Router();

router.get("/", getDestinations);
router.get("/near", validate(nearbyQuerySchema, "query"), getNearbyDestinations);
router.get("/:slug", getDestinationBySlug);
router.get("/:slug/weather", getDestinationWeather);
router.get("/:slug/budget", validate(budgetQuerySchema, "query"), getDestinationBudgetInCurrency);
router.get("/:slug/wildlife", getDestinationWildlife);

router.post("/", requireAuth, requireAdmin, createDestination);
router.put("/:id", requireAuth, requireAdmin, updateDestination);
router.delete("/:id", requireAuth, requireAdmin, deleteDestination);

// nested: /api/destinations/:destinationId/reviews
router.use("/:destinationId/reviews", reviewRoutes);

export default router;
