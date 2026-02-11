import express, { type Router } from "express";
import DoctorController from "./doctor.controller";
import { withAuth } from "../../shared/middlewares/auth.middleware";
import { UserRole } from "../../generated/prisma/client/enums";
import { validateRequest } from "../../shared/middlewares/validate.middleware";
import { updateDoctorZodSchema } from "./doctor.validation";

export default function registerDoctorRoutes(): Router {
  const router = express.Router();
  const controller = new DoctorController();

  router.get(
    "/",
    withAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
    controller.getAllDoctors.bind(controller),
  );

  router.get(
    "/:id",
    withAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
    controller.getDoctorById.bind(controller),
  );

  router.put(
    "/:id",
    withAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
    validateRequest({ body: updateDoctorZodSchema }),
    controller.updateDoctor.bind(controller),
  );

  router.delete(
    "/:id",
    withAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
    controller.deleteDoctor.bind(controller),
  );

  return router;
}
