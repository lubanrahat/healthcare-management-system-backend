import express, { type Router } from "express";

import { withAuth } from "../../shared/middlewares/auth.middleware";
import { UserRole } from "../../generated/prisma/client/enums";
import AppointmentController from "./appointment.controller";

export default function registerAuthRoutes(): Router {
  const router = express.Router();
  const controller = new AppointmentController();

  router.post(
    "/book-appointment",
    withAuth(UserRole.PATIENT),
    controller.bookAppointment,
  );
  router.get(
    "/my-appointments",
    withAuth(UserRole.PATIENT, UserRole.DOCTOR),
    controller.getMyAppointments,
  );
  router.patch(
    "/change-appointment-status/:id",
    withAuth(
      UserRole.PATIENT,
      UserRole.DOCTOR,
      UserRole.ADMIN,
      UserRole.SUPER_ADMIN,
    ),
    controller.changeAppointmentStatus,
  );
  router.get(
    "/my-single-appointment/:id",
    withAuth(UserRole.PATIENT, UserRole.DOCTOR),
    controller.getMySingleAppointment,
  );
  router.get(
    "/all-appointments",
    withAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
    controller.getAllAppointments,
  );
  router.post(
    "/book-appointment-with-pay-later",
    withAuth(UserRole.PATIENT),
    controller.bookAppointmentWithPayLater,
  );
  router.post(
    "/initiate-payment/:id",
    withAuth(UserRole.PATIENT),
    controller.initiatePayment,
  );

  return router;
}
