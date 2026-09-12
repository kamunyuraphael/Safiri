import { Document, Types } from "mongoose";
export interface IWeatherCache extends Document {
    destination: Types.ObjectId;
    current: {
        tempC: number;
        condition: string;
        fetchedAt: Date;
    };
    climateAverages?: {
        month: string;
        avgTempC: number;
        avgPrecipitationMm: number;
    }[];
    lastRefreshed: Date;
}
declare const _default: import("mongoose").Model<IWeatherCache, {}, {}, {}, Document<unknown, {}, IWeatherCache, {}, import("mongoose").DefaultSchemaOptions> & IWeatherCache & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IWeatherCache>;
export default _default;
//# sourceMappingURL=WeatherCache.model.d.ts.map