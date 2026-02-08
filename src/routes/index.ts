import { Router } from "express";
import registerHealthRoutes from "../modules/health/health.routes";
import registerAuthRoutes from "../modules/auth/auth.routes";

export function registerIndexRoutes(): Router {
  const router = Router();

  router.use("/health", registerHealthRoutes());
  router.use("/auth", registerAuthRoutes());

  return router;
}

export const IndexRouter = registerIndexRoutes();
