"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const userSchema = new mongoose_1.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    password: { type: String, required: true, select: false },
    avatarUrl: { type: String },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    savedDestinations: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "Destination" }],
}, { timestamps: true });
exports.default = (0, mongoose_1.model)("User", userSchema);
//# sourceMappingURL=User.model.js.map