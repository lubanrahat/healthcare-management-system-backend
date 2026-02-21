import express, { type Router } from "express";
import AdminController from "./admin.controller";
import { UserRole } from "../../generated/prisma/client/enums";
import { validateRequest } from "../../shared/middlewares/validate.middleware";
import { updateAdminZodSchema } from "./admin.validation";
import { withAuth } from "../../shared/middlewares/auth.middleware";

export default function registerAdminRoutes(): Router {
  const router = express.Router();
  const controller = new AdminController();

  router.get(
    "/",
    withAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
    controller.getAllAdmins.bind(controller),
  );

  router.get(
    "/:id",
    withAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
    controller.getAdminById.bind(controller),
  );

  router.put(
    "/:id",
    withAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
    validateRequest({ body: updateAdminZodSchema }),
    controller.updateAdmin.bind(controller),
  );

  router.delete(
    "/:id",
    withAuth(UserRole.SUPER_ADMIN),
    controller.deleteAdmin.bind(controller),
  );

  router.patch(
    "/change-user-status",
    withAuth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
    controller.changeUserStatus,
  );
  router.patch(
    "/change-user-role",
    withAuth(UserRole.SUPER_ADMIN),
    controller.changeUserRole,
  );

  return router;
}
