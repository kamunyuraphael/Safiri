import "dotenv/config";
import mongoose from "mongoose";
import app from "./app";
import { connectDB } from "./config/db";
import { assertJwtConfig } from "./utils/jwt";

const PORT = process.env.PORT || 5000;

async function startServer() {
  assertJwtConfig();
  await connectDB();

  const server = app.listen(PORT, () => {
    console.log(`Safiri server running on port ${PORT}`);
  });

  // Finish in-flight requests and close the DB cleanly on Ctrl+C or a deploy restart.
  const shutdown = (signal: string) => {
    console.log(`${signal} received, shutting down...`);
    server.close(async () => {
      await mongoose.connection.close();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10_000).unref(); // don't hang forever
  };
  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled promise rejection:", reason);
});

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
