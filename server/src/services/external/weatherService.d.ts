import { IWeatherCache } from "../../models/WeatherCache.model";
import { Types } from "mongoose";
/**
 * Fetches (or serves cached) current weather for a destination's coordinates.
 */
export declare function getCurrentWeather(destinationId: Types.ObjectId | string, lng: number, lat: number): Promise<IWeatherCache["current"]>;
/**
 * Fetches (or serves cached) monthly climate averages for a destination,
 * used to validate/enrich the manually-curated `bestSeasons` data.
 * Pulls 5 years of historical daily data and averages by month.
 */
export declare function getClimateAverages(destinationId: Types.ObjectId | string, lng: number, lat: number): Promise<IWeatherCache["climateAverages"]>;
//# sourceMappingURL=weatherService.d.ts.map