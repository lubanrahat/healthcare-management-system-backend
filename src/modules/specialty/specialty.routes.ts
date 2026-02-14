import express, { type Router } from "express";
import SpecialtyController from "./specialty.controller";
import { withAuth } from "../../shared/middlewares/auth.middleware";
import { UserRole } from "../../generated/prisma/client/enums";
import { multerUpload } from "../../config/multer.config";

export default function registerSpecialtyRoutes(): Router {
  const router = express.Router();
  const controller = new SpecialtyController();

  router.post(
    "/",
    // withAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
    multerUpload.single("file"),
    // controller.createSpecialty.bind(controller),
  );
  router.get("/", controller.getAllSpecialties.bind(controller));
  router.get("/:id", controller.getSpecialty.bind(controller));
  router.delete(
    "/:id",
    withAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
    controller.deleteSpecialty.bind(controller),
  );
  router.put(
    "/:id",
    withAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
    controller.updateSpecialty.bind(controller),
  );

  return router;
}