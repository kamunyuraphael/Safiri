"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const exchangeRateCacheSchema = new mongoose_1.Schema({
    baseCurrency: { type: String, required: true, default: "KES", unique: true },
    rates: { type: mongoose_1.Schema.Types.Mixed, required: true },
    fetchedAt: { type: Date, default: Date.now },
});
exports.default = (0, mongoose_1.model)("ExchangeRateCache", exchangeRateCacheSchema);
//# sourceMappingURL=ExchangeRateCache.model.js.map