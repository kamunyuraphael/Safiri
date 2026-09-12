import { Schema, Document } from "mongoose";
export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    avatarUrl?: string;
    role: "user" | "admin";
    savedDestinations: Schema.Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: import("mongoose").Model<IUser, {}, {}, {}, Document<unknown, {}, IUser, {}, import("mongoose").DefaultSchemaOptions> & IUser & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IUser>;
export default _default;
//# sourceMappingURL=User.model.d.ts.map