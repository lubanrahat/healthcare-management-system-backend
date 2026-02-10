import type { Request, Response, NextFunction } from "express";
import { ZodError, type ZodSchema } from "zod";
import AppError from "../errors/app-error";

type RequestSchemas = {
  body?: ZodSchema<any>;
  query?: ZodSchema<any>;
  params?: ZodSchema<any>;
};

export const validateRequest =
  (schemas: RequestSchemas) =>
  (req: Request, _res: Response, next: NextFunction) => {
    try {
      // Validate body
      if (schemas.body) {
        const result = schemas.body.safeParse(req.body);
        if (!result.success) {
          throw new AppError(
            "Validation failed",
            400,
            "VALIDATION_ERROR",
            result.error,
          );
        }
        req.body = result.data; // sanitized & typed
      }

      // Validate query
      if (schemas.query) {
        const result = schemas.query.safeParse(req.query);
        if (!result.success) {
          throw new AppError(
            "Validation failed",
            400,
            "VALIDATION_ERROR",
            result.error,
          );
        }
        req.query = result.data;
      }

      // Validate params
      if (schemas.params) {
        const result = schemas.params.safeParse(req.params);
        if (!result.success) {
          throw new AppError(
            "Validation failed",
            400,
            "VALIDATION_ERROR",
            result.error,
          );
        }
        req.params = result.data;
      }

      next();
    } catch (err) {
      next(err);
    }
  };
