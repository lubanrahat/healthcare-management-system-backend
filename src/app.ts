import express, {
  type Application,
  type Request,
  type Response,
} from "express";
import { IndexRouter } from "./routes";
import cookieParser from "cookie-parser";
import { errorHandler } from "./shared/middlewares/global-error.middleware";
import { ResponseUtil } from "./shared/utils/response.util";
import HttpStatus from "./shared/constants/http-status";
import { requestIdMiddleware } from "./shared/middlewares/request-id.middleware";
import { requestLogger } from "./shared/middlewares/request-logger.middleware";
import { logger } from "./shared/logger/logger";

function createApp(): Application {
  const app: Application = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // Request processing middlewares should come before routes
  app.use(requestIdMiddleware);
  app.use(requestLogger);

  app.use("/api/v1", IndexRouter);

  app.use((req: Request, res: Response) => {
    logger.warn(`Route not found: ${req.method} ${req.originalUrl}`);
    ResponseUtil.error(res, "Route not found", HttpStatus.NOT_FOUND);
  });

  app.use(errorHandler);

  return app;
}

export default createApp;
