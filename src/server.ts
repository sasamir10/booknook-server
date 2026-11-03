import cors from "cors";
import express from "express";
import { isCorsOriginAllowed } from "./config/cors.js";
import { closeDatabase, connectDatabase } from "./config/db.js";
import { env } from "./config/env.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import booksRouter from "./routes/books.routes.js";
import borrowsRouter from "./routes/borrows.routes.js";

async function start(): Promise<void> {
  await connectDatabase();
  const app = express();
  app.disable("x-powered-by");
  app.use(cors({
    origin(origin, callback) {
      if (isCorsOriginAllowed(origin, env.NODE_ENV, env.CLIENT_URL)) return callback(null, true);
      return callback(new Error("Origin is not allowed by CORS."));
    },
    credentials: false,
  }));
  app.use(express.json({ limit: "1mb" }));
  app.use("/books", booksRouter);
  app.use("/borrows", borrowsRouter);
  app.use(notFoundHandler);
  app.use(errorHandler);

  const server = app.listen(env.PORT, () => console.log(`BookNook API listening on port ${env.PORT}`));
  const shutdown = async () => {
    server.close(async () => {
      await closeDatabase();
      process.exit(0);
    });
  };
  process.on("SIGINT", () => void shutdown());
  process.on("SIGTERM", () => void shutdown());
}

start().catch((error: unknown) => {
  console.error("Unable to start BookNook API:", error);
  process.exit(1);
});
