import type { AuthUser } from "@/types/auth";

export const TOKEN_KEY = "safiri_token";
export const USER_KEY = "safiri_user";
// Fired by the API layer when the server says our token is no longer valid.
export const UNAUTHORIZED_EVENT = "safiri:unauthorized";

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

// A corrupted value must never crash the app on load, so parsing is guarded.
export function getStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed.id === "string" && typeof parsed.name === "string" ? parsed : null;
  } catch {
    return null;
  }
}

export function storeAuth(token: string, user: AuthUser) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch {
    /* storage unavailable (private mode, quota): the session just won't persist */
  }
}

export function clearAuth() {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch {
    /* ignore */
  }
}
