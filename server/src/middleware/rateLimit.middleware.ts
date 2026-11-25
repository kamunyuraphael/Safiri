import { rateLimit } from "express-rate-limit";

const json = (message: string, code: string) => ({ message, code });

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 600,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: json("Too many requests. Please slow down.", "RATE_LIMITED"),
});

// Login and register: slows credential stuffing.
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: json("Too many attempts. Try again in a few minutes.", "RATE_LIMITED"),
});

// The chat endpoint costs real money per call, so it gets two windows.
export const chatBurstLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 8,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: json("You're sending messages quickly. Give it a moment and try again.", "RATE_LIMITED"),
});

export const chatHourlyLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 60,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: json("You've reached the hourly chat limit. Please come back a little later.", "RATE_LIMITED"),
});
