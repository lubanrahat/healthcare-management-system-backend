import { Router } from "express";
import registerHealthRoutes from "../modules/health/health.routes";

export function registerIndexRoutes(): Router {
  const router = Router();

  router.use("/health", registerHealthRoutes());

  return router;
}

export const IndexRouter = registerIndexRoutes();