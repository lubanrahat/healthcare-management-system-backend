import express, { type Application } from "express";
import { IndexRouter } from "./routes";

function createApp(): Application {
  const app: Application = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use("/api/v1", IndexRouter);

  return app;
}

export default createApp;
