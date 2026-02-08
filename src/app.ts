import express, { type Application, type Request, type Response } from "express";
import { IndexRouter } from "./routes";
import { errorHandler } from "./shared/middlewares/global-error.middleware";
import { ResponseUtil } from "./shared/utils/response.util";
import HttpStatus from "./shared/constants/http-status";

function createApp(): Application {
  const app: Application = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use("/api/v1", IndexRouter);

  app.use((req: Request, res: Response) => {
    ResponseUtil.error(res, "Route not found", HttpStatus.NOT_FOUND);
  });

  app.use(errorHandler);

  return app;
}

export default createApp;
