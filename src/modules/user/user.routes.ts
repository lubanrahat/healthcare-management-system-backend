import express, { type Router } from "express";
import UserController from "./user.controller";
import { validateRequest } from "../../shared/middlewares/validate.middleware";
import { createDoctorZodSchema } from "./user.validation";

export default function registerUsersRoutes(): Router {
  const router = express.Router();
  const controller = new UserController();

  router.post(
    "/create-doctor",
    validateRequest({ body: createDoctorZodSchema }),
    controller.createDoctor.bind(controller),
  );

  return router;
}
