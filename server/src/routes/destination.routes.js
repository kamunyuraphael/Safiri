"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const destination_controller_1 = require("../controllers/destination.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const review_routes_1 = __importDefault(require("./review.routes"));
const router = (0, express_1.Router)();
router.get("/", destination_controller_1.getDestinations);
router.get("/near", destination_controller_1.getNearbyDestinations);
router.get("/:slug", destination_controller_1.getDestinationBySlug);
router.get("/:slug/weather", destination_controller_1.getDestinationWeather);
router.get("/:slug/budget", destination_controller_1.getDestinationBudgetInCurrency);
router.get("/:slug/wildlife", destination_controller_1.getDestinationWildlife);
router.post("/", auth_middleware_1.requireAuth, auth_middleware_1.requireAdmin, destination_controller_1.createDestination);
router.put("/:id", auth_middleware_1.requireAuth, auth_middleware_1.requireAdmin, destination_controller_1.updateDestination);
router.delete("/:id", auth_middleware_1.requireAuth, auth_middleware_1.requireAdmin, destination_controller_1.deleteDestination);
// nested: /api/destinations/:destinationId/reviews
router.use("/:destinationId/reviews", review_routes_1.default);
exports.default = router;
//# sourceMappingURL=destination.routes.js.map