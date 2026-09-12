import { Schema, model, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;       // hashed
  avatarUrl?: string;
  role: "user" | "admin";
  savedDestinations: Schema.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    password: { type: String, required: true, select: false },
    avatarUrl: { type: String },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    savedDestinations: [{ type: Schema.Types.ObjectId, ref: "Destination" }],
  },
  { timestamps: true }
);

export default model<IUser>("User", userSchema);
