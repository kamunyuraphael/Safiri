import crypto from "crypto";
import jwt from "jsonwebtoken";

const JWT_EXPIRES_IN = "7d";

export interface JwtPayload {
  userId: string;
  role: "user" | "admin";
}

let cachedSecret: string | null = null;

// No hardcoded fallback: a known default secret lets anyone forge admin tokens.
// In production a missing JWT_SECRET is a startup error. In development we use
// a random per-process secret (sessions reset on restart) and say so loudly.
function getSecret(): string {
  if (cachedSecret) return cachedSecret;

  const fromEnv = process.env.JWT_SECRET;
  if (fromEnv && fromEnv.length >= 16) {
    cachedSecret = fromEnv;
    return cachedSecret;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET must be set (16+ characters) in production");
  }

  console.warn(
    "[auth] JWT_SECRET is missing or too short. Using a temporary secret; logins will reset on every restart. " +
      "Add JWT_SECRET to server/.env (generate one with: node -e \"console.log(require('crypto').randomBytes(48).toString('hex'))\")."
  );
  cachedSecret = crypto.randomBytes(48).toString("hex");
  return cachedSecret;
}

export function assertJwtConfig(): void {
  getSecret();
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, getSecret(), { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, getSecret()) as JwtPayload;
}
