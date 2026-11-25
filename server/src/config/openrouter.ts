export const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

// Any model slug from https://openrouter.ai/models works here, including
// ":free" variants. Change it in .env without touching code.
export const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini";

// Optional: if the primary model is down or rate limited, OpenRouter will
// automatically retry the request on this one.
export const OPENROUTER_FALLBACK_MODEL = process.env.OPENROUTER_FALLBACK_MODEL || "";

// Optional attribution headers OpenRouter uses for its app rankings.
export const OPENROUTER_SITE_URL = process.env.OPENROUTER_SITE_URL || "http://localhost:5173";
export const OPENROUTER_APP_NAME = process.env.OPENROUTER_APP_NAME || "Safiri";

export function getOpenRouterApiKey(): string {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) {
    throw new Error("OPENROUTER_API_KEY is not set in environment variables");
  }
  return key;
}
