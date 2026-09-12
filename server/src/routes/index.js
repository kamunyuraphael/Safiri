"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const destination_routes_1 = __importDefault(require("./destination.routes"));
const itinerary_routes_1 = __importDefault(require("./itinerary.routes"));
const auth_routes_1 = __importDefault(require("./auth.routes"));
const router = (0, express_1.Router)();
router.use("/auth", auth_routes_1.default);
router.use("/destinations", destination_routes_1.default);
router.use("/itineraries", itinerary_routes_1.default);
exports.default = router;
//# sourceMappingURL=index.js.map