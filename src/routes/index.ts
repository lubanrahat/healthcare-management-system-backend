import { Router } from "express";
import registerHealthRoutes from "../modules/health/health.routes";
import registerAuthRoutes from "../modules/auth/auth.routes";
import registerSpecialtyRoutes from "../modules/specialty/specialty.routes";
import registerUsersRoutes from "../modules/user/user.routes";
import registerDoctorRoutes from "../modules/doctor/doctor.routes";
import registerAdminRoutes from "../modules/admin/admin.routes";
import registerScheduleRoutes from "../modules/schedule/schedule.routes";
import registerReviewRoutes from "../modules/review/review.routes";
import registerAppointmentRoutes from "../modules/appointment/appointment.routes";

export function registerIndexRoutes(): Router {
  const router = Router();

  router.use("/health", registerHealthRoutes());
  router.use("/auth", registerAuthRoutes());
  router.use("/specialty", registerSpecialtyRoutes());
  router.use("/users", registerUsersRoutes());
  router.use("/doctors", registerDoctorRoutes());
  router.use("/admins", registerAdminRoutes());
  router.use("/schedules", registerScheduleRoutes());
  router.use("/appointments", registerAppointmentRoutes());
  router.use("/reviews", registerReviewRoutes());

  return router;
}

export const IndexRouter = registerIndexRoutes();
