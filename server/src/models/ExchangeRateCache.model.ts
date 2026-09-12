import { Schema, model, Document } from "mongoose";

export interface IExchangeRateCache extends Document {
  baseCurrency: string;       // always "KES" for Safiri
  rates: Record<string, number>; // e.g. { USD: 0.0077, EUR: 0.0071 }
  fetchedAt: Date;
}

const exchangeRateCacheSchema = new Schema<IExchangeRateCache>({
  baseCurrency: { type: String, required: true, default: "KES", unique: true },
  rates: { type: Schema.Types.Mixed, required: true },
  fetchedAt: { type: Date, default: Date.now },
});

export default model<IExchangeRateCache>("ExchangeRateCache", exchangeRateCacheSchema);
