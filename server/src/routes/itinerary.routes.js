"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const itinerary_controller_1 = require("../controllers/itinerary.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.requireAuth); // all itinerary routes require a logged-in user
router.get("/", itinerary_controller_1.getMyItineraries);
router.get("/:id", itinerary_controller_1.getItineraryById);
router.post("/", itinerary_controller_1.createItinerary);
router.put("/:id", itinerary_controller_1.updateItinerary);
router.post("/:id/recalculate-budget", itinerary_controller_1.recalculateBudget);
router.delete("/:id", itinerary_controller_1.deleteItinerary);
exports.default = router;
//# sourceMappingURL=itinerary.routes.js.map