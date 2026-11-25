import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import apiRoutes from "./routes";
import { errorMiddleware, notFoundMiddleware } from "./middleware/error.middleware";
import { apiLimiter } from "./middleware/rateLimit.middleware";

const app = express();

// Behind a proxy/load balancer (Render, Railway, Nginx...) set TRUST_PROXY=1
// so rate limiting sees real client IPs instead of the proxy's.
if (process.env.TRUST_PROXY) {
  app.set("trust proxy", Number(process.env.TRUST_PROXY) || 1);
}

// Comma-separated list, e.g. CLIENT_URL=http://localhost:5173,https://safiri.app
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(helmet());
app.use(
  cors({
    origin: (origin, cb) => {
      // No Origin header means a non-browser client (curl, server to server): allow.
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      cb(new Error(`Origin ${origin} is not allowed by CORS`));
    },
  })
);
app.use(express.json({ limit: "100kb" }));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.use("/api", apiLimiter, apiRoutes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
