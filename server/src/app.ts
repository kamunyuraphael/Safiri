import express from "express";
import cors from "cors";
import morgan from "morgan";
import apiRoutes from "./routes";
import { errorMiddleware, notFoundMiddleware } from "./middleware/error.middleware";

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use("/api", apiRoutes);

app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
