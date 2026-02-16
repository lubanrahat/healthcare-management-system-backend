import express, { type Router } from "express";

import { withAuth } from "../../shared/middlewares/auth.middleware";
import { UserRole } from "../../generated/prisma/client/enums";
import ScheduleController from "./schedule.controller";

export default function registerScheduleRoutes(): Router {
  const router = express.Router();
  const controller = new ScheduleController();

  router.post(
    "/",
    withAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
    controller.createSchedule.bind(controller),
  );

  router.get(
    "/",
    withAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
    controller.getAllSchedules.bind(controller),
  );

  router.get(
    "/:id",
    withAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
    controller.getScheduleById.bind(controller),
  );

  router.put(
    "/:id",
    withAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
    controller.updateSchedule.bind(controller),
  );

  router.delete(
    "/:id",
    withAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
    controller.deleteSchedule.bind(controller),
  );

  return router;
}
