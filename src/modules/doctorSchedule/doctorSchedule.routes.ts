import express, { type Router } from "express";

import { withAuth } from "../../shared/middlewares/auth.middleware";
import { UserRole } from "../../generated/prisma/client/enums";
import DoctorScheduleController from "./doctorSchedule.controller";

export default function registerDoctorScheduleRoutes(): Router {
  const router = express.Router();
  const controller = new DoctorScheduleController();

  router.post(
    "/my",
    withAuth(UserRole.DOCTOR),
    controller.createMyDoctorSchedule.bind(controller),
  );

  router.get(
    "/my",
    withAuth(UserRole.DOCTOR),
    controller.getMyDoctorSchedules.bind(controller),
  );

  router.get(
    "/",
    withAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
    controller.getAllDoctorSchedules.bind(controller),
  );

  router.get(
    "/:doctorId/:scheduleId",
    withAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
    controller.getDoctorScheduleById.bind(controller),
  );

  router.put(
    "/my",
    withAuth(UserRole.DOCTOR),
    controller.updateMyDoctorSchedule.bind(controller),
  );

  router.delete(
    "/:id",
    withAuth(UserRole.DOCTOR),
    controller.deleteMyDoctorSchedule.bind(controller),
  );

  return router;
}
