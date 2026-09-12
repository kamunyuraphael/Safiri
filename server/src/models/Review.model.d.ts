import { Document, Types } from "mongoose";
export interface IReview extends Document {
    destination: Types.ObjectId;
    user: Types.ObjectId;
    rating: number;
    comment: string;
    images: string[];
    visitedDate?: Date;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: import("mongoose").Model<IReview, {}, {}, {}, Document<unknown, {}, IReview, {}, import("mongoose").DefaultSchemaOptions> & IReview & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IReview>;
export default _default;
//# sourceMappingURL=Review.model.d.ts.map