import axios from "axios";

/** Turns any thrown value into a message that is safe and useful to show a user. */
export function getErrorMessage(err: unknown, fallback = "Something went wrong. Please try again."): string {
  if (axios.isAxiosError(err)) {
    if (!err.response) {
      return err.code === "ECONNABORTED"
        ? "The request took too long. Please try again."
        : "Can't reach the server. Check your connection and try again.";
    }
    const message = err.response.data?.message;
    if (typeof message === "string" && message) return message;
  }
  return fallback;
}

export function getErrorCode(err: unknown): string | undefined {
  return axios.isAxiosError(err) ? err.response?.data?.code : undefined;
}
