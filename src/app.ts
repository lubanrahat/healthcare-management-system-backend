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
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";
import path from "node:path";
import cors from "cors";
import PaymentController from "./modules/payment/payment.controller";
import corn from "node-cron";
import AppointmentService from "./modules/appointment/appointment.service";

function createApp(): Application {
  const app: Application = express();

  app.use(
    cors({
      origin: process.env.FRONTEND_URL,
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
      allowedHeaders: ["Content-Type", "Authorization"],
    }),
  );

  app.post(
    "/webhook",
    express.raw({ type: "application/json" }),
    PaymentController.handleStripeWebhookEvent,
  );

  app.set("view engine", "ejs");
  app.set("views", path.resolve(process.cwd(), "src/templates"));

  app.use("/api/auth", toNodeHandler(auth));

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  corn.schedule("0 0 * * *", async () => {
    try {
      const appointmentService = new AppointmentService();
      await appointmentService.cancelUnpaidAppointments();
      logger.info("Scheduled task: Canceled unpaid appointments");
    } catch (error) {
      logger.error("Error in scheduled task: Canceled unpaid appointments", error);
    }
  });

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
