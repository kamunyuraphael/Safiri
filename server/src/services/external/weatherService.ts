import axios from "axios";
import WeatherCache, { IWeatherCache } from "../../models/WeatherCache.model";
import { Types } from "mongoose";

const OPEN_METEO_FORECAST_URL = "https://api.open-meteo.com/v1/forecast";
const OPEN_METEO_ARCHIVE_URL = "https://archive-api.open-meteo.com/v1/archive";
const CURRENT_CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
// Climate averages barely change; refresh roughly monthly.
const CLIMATE_CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000;

const WEATHER_CODE_DESCRIPTIONS: Record<number, string> = {
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
export async function getCurrentWeather(
  destinationId: Types.ObjectId | string,
  lng: number,
  lat: number
): Promise<IWeatherCache["current"]> {
  const cached = await WeatherCache.findOne({ destination: destinationId });

  const isFresh =
    cached?.current?.fetchedAt &&
    Date.now() - cached.current.fetchedAt.getTime() < CURRENT_CACHE_TTL_MS;

  if (isFresh && cached) {
    return cached.current;
  }

  const { data } = await axios.get(OPEN_METEO_FORECAST_URL, {
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

  await WeatherCache.findOneAndUpdate(
    { destination: destinationId },
    { destination: destinationId, current, lastRefreshed: new Date() },
    { upsert: true, new: true }
  );

  return current;
}

/**
 * Fetches (or serves cached) monthly climate averages for a destination,
 * used to validate/enrich the manually-curated `bestSeasons` data.
 * Pulls 5 years of historical daily data and averages by month.
 */
export async function getClimateAverages(
  destinationId: Types.ObjectId | string,
  lng: number,
  lat: number
): Promise<IWeatherCache["climateAverages"]> {
  const cached = await WeatherCache.findOne({ destination: destinationId });

  const isFresh =
    cached?.climateAverages?.length &&
    Date.now() - cached.lastRefreshed.getTime() < CLIMATE_CACHE_TTL_MS;

  if (isFresh && cached) {
    return cached.climateAverages;
  }

  const endDate = new Date();
  const startDate = new Date();
  startDate.setFullYear(endDate.getFullYear() - 5);

  const { data } = await axios.get(OPEN_METEO_ARCHIVE_URL, {
    params: {
      latitude: lat,
      longitude: lng,
      start_date: startDate.toISOString().slice(0, 10),
      end_date: endDate.toISOString().slice(0, 10),
      daily: "temperature_2m_mean,precipitation_sum",
      timezone: "auto",
    },
  });

  const monthlyTotals: Record<string, { tempSum: number; precipSum: number; count: number }> = {};

  data.daily.time.forEach((dateStr: string, i: number) => {
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

  await WeatherCache.findOneAndUpdate(
    { destination: destinationId },
    { destination: destinationId, climateAverages, lastRefreshed: new Date() },
    { upsert: true, new: true }
  );

  return climateAverages;
}
