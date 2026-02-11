import express, { type Router } from "express";
import UserController from "./user.controller";
import { validateRequest } from "../../shared/middlewares/validate.middleware";
import { createAdminZodSchema, createDoctorZodSchema } from "./user.validation";
import { UserRole } from "../../generated/prisma/client/enums";
import { withAuth } from "../../shared/middlewares/auth.middleware";

export default function registerUsersRoutes(): Router {
  const router = express.Router();
  const controller = new UserController();

  router.post(
    "/create-doctor",
    withAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
    validateRequest({ body: createDoctorZodSchema }),
    controller.createDoctor.bind(controller),
  );

  router.post(
    "/create-admin",
    withAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
    validateRequest({ body: createAdminZodSchema }),
    controller.createAdmin.bind(controller),
  );

  return router;
}
