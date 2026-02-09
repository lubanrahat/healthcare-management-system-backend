import { Router } from "express";
import registerHealthRoutes from "../modules/health/health.routes";
import registerAuthRoutes from "../modules/auth/auth.routes";
import registerSpecialtyRoutes from "../modules/specialty/specialty.routes";
import registerDoctorRoutes from "../modules/user/user.routes";

export function registerIndexRoutes(): Router {
  const router = Router();

  router.use("/health", registerHealthRoutes());
  router.use("/auth", registerAuthRoutes());
  router.use("/specialty", registerSpecialtyRoutes());
  router.use("/doctors", registerDoctorRoutes());

  return router;
}

export const IndexRouter = registerIndexRoutes();
