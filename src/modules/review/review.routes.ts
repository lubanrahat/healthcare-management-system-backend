import express, { type Router } from "express";

import { withAuth } from "../../shared/middlewares/auth.middleware";
import { UserRole } from "../../generated/prisma/client/enums";
import ReviewConstant from "./review.controller";
import { validateRequest } from "../../shared/middlewares/validate.middleware";
import { ReviewValidation } from "./review.validation";

export default function registerReviewRoutes(): Router {
  const router = express.Router();
  const controller = new ReviewConstant();

  router.get("/", controller.getAllReviews);

  router.post(
    "/",
    withAuth(UserRole.PATIENT),
    validateRequest({ body: ReviewValidation.createReviewZodSchema }),
    controller.giveReview,
  );

  router.get(
    "/my-reviews",
    withAuth(UserRole.PATIENT, UserRole.DOCTOR),
    controller.myReviews,
  );

  router.patch(
    "/:id",
    withAuth(UserRole.PATIENT),
    validateRequest({ body: ReviewValidation.updateReviewZodSchema }),
    controller.updateReview,
  );

  router.delete("/:id", withAuth(UserRole.PATIENT), controller.deleteReview);

  return router;
}
