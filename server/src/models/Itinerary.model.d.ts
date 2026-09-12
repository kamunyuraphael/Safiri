import { Document, Types } from "mongoose";
import { BudgetTier } from "./Destination.model";
export interface IItineraryStop {
    destination: Types.ObjectId;
    day: number;
    order: number;
    notes?: string;
    arrivalTime?: string;
}
export interface IBudgetSummary {
    tier: BudgetTier;
    numTravelers: number;
    numDays: number;
    totalAccommodation: number;
    totalFood: number;
    totalTransport: number;
    totalActivities: number;
    grandTotal: number;
    currency: string;
}
export interface IItinerary extends Document {
    user: Types.ObjectId;
    title: string;
    travelerType: "solo" | "couple" | "family" | "group" | "honeymoon";
    numTravelers: number;
    budgetTier: BudgetTier;
    startDate?: Date;
    endDate?: Date;
    stops: IItineraryStop[];
    budgetSummary?: IBudgetSummary;
    isPublic: boolean;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: import("mongoose").Model<IItinerary, {}, {}, {}, Document<unknown, {}, IItinerary, {}, import("mongoose").DefaultSchemaOptions> & IItinerary & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IItinerary>;
export default _default;
//# sourceMappingURL=Itinerary.model.d.ts.map