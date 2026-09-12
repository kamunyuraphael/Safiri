"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorMiddleware = errorMiddleware;
exports.notFoundMiddleware = notFoundMiddleware;
const express_1 = require("express");
function errorMiddleware(err, req, res, next) {
    const statusCode = err.statusCode || 500;
    console.error(`[Error] ${req.method} ${req.path} -`, err.message);
    res.status(statusCode).json({
        message: err.message || "Internal server error",
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
}
function notFoundMiddleware(req, res) {
    res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}
//# sourceMappingURL=error.middleware.js.map