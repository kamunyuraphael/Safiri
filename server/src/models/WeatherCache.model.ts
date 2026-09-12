import { Schema, model, Document, Types } from "mongoose";

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

const weatherCacheSchema = new Schema<IWeatherCache>({
  destination: { type: Schema.Types.ObjectId, ref: "Destination", required: true, unique: true },
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

export default model<IWeatherCache>("WeatherCache", weatherCacheSchema);
