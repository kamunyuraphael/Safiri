"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getExchangeRates = getExchangeRates;
exports.convertFromKes = convertFromKes;
const axios_1 = __importDefault(require("axios"));
const ExchangeRateCache_model_1 = __importDefault(require("../../models/ExchangeRateCache.model"));
const FRANKFURTER_BASE_URL = "https://api.frankfurter.app";
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
const BASE_CURRENCY = "KES";
/**
 * Returns { USD: 0.0077, EUR: 0.0071, ... } — rates FROM KES to other currencies.
 * Serves from cache if fetched within the last hour, otherwise refreshes.
 */
async function getExchangeRates() {
    const cached = await ExchangeRateCache_model_1.default.findOne({ baseCurrency: BASE_CURRENCY });
    const isFresh = cached && Date.now() - cached.fetchedAt.getTime() < CACHE_TTL_MS;
    if (isFresh && cached) {
        return cached.rates;
    }
    const { data } = await axios_1.default.get(`${FRANKFURTER_BASE_URL}/latest`, {
        params: { from: BASE_CURRENCY },
    });
    const rates = data.rates;
    await ExchangeRateCache_model_1.default.findOneAndUpdate({ baseCurrency: BASE_CURRENCY }, { baseCurrency: BASE_CURRENCY, rates, fetchedAt: new Date() }, { upsert: true, new: true });
    return rates;
}
/**
 * Converts an amount in KES to the target currency.
 * Falls back to returning the original amount if the currency isn't found.
 */
async function convertFromKes(amountKes, targetCurrency) {
    if (targetCurrency.toUpperCase() === BASE_CURRENCY)
        return amountKes;
    const rates = await getExchangeRates();
    const rate = rates[targetCurrency.toUpperCase()];
    if (!rate) {
        throw new Error(`Unsupported currency: ${targetCurrency}`);
    }
    return Math.round(amountKes * rate * 100) / 100;
}
//# sourceMappingURL=currencyService.js.map