import express, { type Router } from "express";
import AuthController from "./auth.controller";
import { validateRequest } from "../../shared/middlewares/validate.middleware";
import { loginSchema, registerPatientSchema } from "./auth.validation";
import { withAuth } from "../../shared/middlewares/auth.middleware";
import { UserRole } from "../../generated/prisma/client/enums";

export default function registerAuthRoutes(): Router {
  const router = express.Router();
  const controller = new AuthController();

  router.post(
    "/register",
    validateRequest({ body: registerPatientSchema }),
    controller.registerPatient.bind(controller),
  );

  router.post(
    "/login",
    validateRequest({ body: loginSchema }),
    controller.login.bind(controller),
  );

  router.post(
    "/change-password",
    withAuth(
      UserRole.ADMIN,
      UserRole.DOCTOR,
      UserRole.PATIENT,
      UserRole.SUPER_ADMIN,
    ),
    controller.changePassword.bind(controller),
  );

  router.get(
    "/logout",
    withAuth(
      UserRole.ADMIN,
      UserRole.DOCTOR,
      UserRole.PATIENT,
      UserRole.SUPER_ADMIN,
    ),
    controller.logoutUser.bind(controller),
  );

  router.post("/verify-email", controller.verifyEmail.bind(controller));
  router.post("/forgot-password", controller.forgotPassword.bind(controller));
  router.post("/reset-password", controller.resetPassword.bind(controller));

  router.get("/login/google", controller.googleLogin.bind(controller));
  router.get("/google/success", controller.googleLoginSuccess.bind(controller));
  router.get("oauth/error", controller.googleLoginError.bind(controller));

  return router;
}
