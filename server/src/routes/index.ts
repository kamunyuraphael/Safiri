import { Router } from "express";
import destinationRoutes from "./destination.routes";
import itineraryRoutes from "./itinerary.routes";
import authRoutes from "./auth.routes";
import chatRoutes from "./chat.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/destinations", destinationRoutes);
router.use("/itineraries", itineraryRoutes);
router.use("/chat", chatRoutes);

export default router;
