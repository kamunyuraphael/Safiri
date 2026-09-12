"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentWeather = getCurrentWeather;
exports.getClimateAverages = getClimateAverages;
const axios_1 = __importDefault(require("axios"));
const WeatherCache_model_1 = __importStar(require("../../models/WeatherCache.model"));
const mongoose_1 = require("mongoose");
const OPEN_METEO_FORECAST_URL = "https://api.open-meteo.com/v1/forecast";
const OPEN_METEO_ARCHIVE_URL = "https://archive-api.open-meteo.com/v1/archive";
const CURRENT_CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
// Climate averages barely change; refresh roughly monthly.
const CLIMATE_CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const WEATHER_CODE_DESCRIPTIONS = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    51: "Light drizzle",
    61: "Light rain",
    63: "Moderate rain",
    65: "Heavy rain",
    80: "Rain showers",
    95: "Thunderstorm",
};
/**
 * Fetches (or serves cached) current weather for a destination's coordinates.
 */
async function getCurrentWeather(destinationId, lng, lat) {
    const cached = await WeatherCache_model_1.default.findOne({ destination: destinationId });
    const isFresh = cached?.current?.fetchedAt &&
        Date.now() - cached.current.fetchedAt.getTime() < CURRENT_CACHE_TTL_MS;
    if (isFresh && cached) {
        return cached.current;
    }
    const { data } = await axios_1.default.get(OPEN_METEO_FORECAST_URL, {
        params: {
            latitude: lat,
            longitude: lng,
            current: "temperature_2m,weather_code",
            timezone: "auto",
        },
    });
    const current = {
        tempC: data.current.temperature_2m,
        condition: WEATHER_CODE_DESCRIPTIONS[data.current.weather_code] || "Unknown",
        fetchedAt: new Date(),
    };
    await WeatherCache_model_1.default.findOneAndUpdate({ destination: destinationId }, { destination: destinationId, current, lastRefreshed: new Date() }, { upsert: true, new: true });
    return current;
}
/**
 * Fetches (or serves cached) monthly climate averages for a destination,
 * used to validate/enrich the manually-curated `bestSeasons` data.
 * Pulls 5 years of historical daily data and averages by month.
 */
async function getClimateAverages(destinationId, lng, lat) {
    const cached = await WeatherCache_model_1.default.findOne({ destination: destinationId });
    const isFresh = cached?.climateAverages?.length &&
        Date.now() - cached.lastRefreshed.getTime() < CLIMATE_CACHE_TTL_MS;
    if (isFresh && cached) {
        return cached.climateAverages;
    }
    const endDate = new Date();
    const startDate = new Date();
    startDate.setFullYear(endDate.getFullYear() - 5);
    const { data } = await axios_1.default.get(OPEN_METEO_ARCHIVE_URL, {
        params: {
            latitude: lat,
            longitude: lng,
            start_date: startDate.toISOString().slice(0, 10),
            end_date: endDate.toISOString().slice(0, 10),
            daily: "temperature_2m_mean,precipitation_sum",
            timezone: "auto",
        },
    });
    const monthlyTotals = {};
    data.daily.time.forEach((dateStr, i) => {
        const month = new Date(dateStr).toLocaleString("en-US", { month: "short" });
        if (!monthlyTotals[month]) {
            monthlyTotals[month] = { tempSum: 0, precipSum: 0, count: 0 };
        }
        monthlyTotals[month].tempSum += data.daily.temperature_2m_mean[i] ?? 0;
        monthlyTotals[month].precipSum += data.daily.precipitation_sum[i] ?? 0;
        monthlyTotals[month].count += 1;
    });
    const climateAverages = Object.entries(monthlyTotals).map(([month, totals]) => ({
        month,
        avgTempC: Math.round((totals.tempSum / totals.count) * 10) / 10,
        avgPrecipitationMm: Math.round((totals.precipSum / totals.count) * 10) / 10,
    }));
    await WeatherCache_model_1.default.findOneAndUpdate({ destination: destinationId }, { destination: destinationId, climateAverages, lastRefreshed: new Date() }, { upsert: true, new: true });
    return climateAverages;
}
//# sourceMappingURL=weatherService.js.map