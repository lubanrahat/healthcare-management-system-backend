import express, { type Router } from "express";
import DoctorController from "./doctor.controller";
import { withAuth } from "../../shared/middlewares/auth.middleware";
import { UserRole } from "../../generated/prisma/client/enums";

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

  return router;
}
