import { Document } from "mongoose";
export interface IExchangeRateCache extends Document {
    baseCurrency: string;
    rates: Record<string, number>;
    fetchedAt: Date;
}
declare const _default: import("mongoose").Model<IExchangeRateCache, {}, {}, {}, Document<unknown, {}, IExchangeRateCache, {}, import("mongoose").DefaultSchemaOptions> & IExchangeRateCache & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IExchangeRateCache>;
export default _default;
//# sourceMappingURL=ExchangeRateCache.model.d.ts.map