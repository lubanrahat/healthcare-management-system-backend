import express, { type Router } from "express";
import AuthController from "./auth.controller";
import { validateRequest } from "../../shared/middlewares/validate.middleware";
import { createUserSchema, loginSchema } from "./auth.validation";

export default function registerAuthRoutes(): Router {
  const router = express.Router();
  const controller = new AuthController();

  router.post(
    "/register",
    validateRequest(createUserSchema),
    controller.registerPatient.bind(controller),
  );

  router.post(
    "/login",
    validateRequest(loginSchema),
    controller.login.bind(controller),
  );

  return router;
}
