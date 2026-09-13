const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
// Flash models are the free-tier ones on Google AI Studio. Configurable via
// env var so you can bump to a newer Flash version without a code change.
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";

export const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

export function getGeminiApiKey(): string {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not set in environment variables");
  }
  return GEMINI_API_KEY;
}
