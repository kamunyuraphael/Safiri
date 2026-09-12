"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.register = void 0;
const express_1 = require("express");
const bcrypt_1 = __importDefault(require("bcrypt"));
const asyncHandler_1 = require("../utils/asyncHandler");
const User_model_1 = __importDefault(require("../models/User.model"));
const jwt_1 = require("../utils/jwt");
// POST /api/auth/register
exports.register = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { name, email, password } = req.body;
    const existing = await User_model_1.default.findOne({ email });
    if (existing) {
        return res.status(409).json({ message: "Email already registered" });
    }
    const hashedPassword = await bcrypt_1.default.hash(password, 10);
    const user = await User_model_1.default.create({ name, email, password: hashedPassword });
    const token = (0, jwt_1.signToken)({ userId: user.id, role: user.role });
    res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email } });
});
// POST /api/auth/login
exports.login = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { email, password } = req.body;
    const user = await User_model_1.default.findOne({ email }).select("+password");
    if (!user || !(await bcrypt_1.default.compare(password, user.password))) {
        return res.status(401).json({ message: "Invalid email or password" });
    }
    const token = (0, jwt_1.signToken)({ userId: user.id, role: user.role });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
});
//# sourceMappingURL=auth.controller.js.map