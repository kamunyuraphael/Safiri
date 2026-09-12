"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const weatherCacheSchema = new mongoose_1.Schema({
    destination: { type: mongoose_1.Schema.Types.ObjectId, ref: "Destination", required: true, unique: true },
    current: {
        tempC: { type: Number },
        condition: { type: String },
        fetchedAt: { type: Date },
    },
    climateAverages: [
        {
            month: { type: String },
            avgTempC: { type: Number },
            avgPrecipitationMm: { type: Number },
        },
    ],
    lastRefreshed: { type: Date, default: Date.now },
});
exports.default = (0, mongoose_1.model)("WeatherCache", weatherCacheSchema);
//# sourceMappingURL=WeatherCache.model.js.map