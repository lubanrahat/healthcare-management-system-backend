import type { Request, Response, NextFunction } from "express";
import { ZodError, type ZodSchema } from "zod";
import AppError from "../errors/app-error";
import HttpStatus from "../constants/http-status";
import ErrorCodes from "../errors/error-codes";

export const validateRequest =
  <T>(schema: ZodSchema<T>) =>
  (req: Request, _res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        }));
        return next(
          new AppError(
            "Validation failed",
            HttpStatus.BAD_REQUEST,
            ErrorCodes.VALIDATION_ERROR,
            formattedErrors,
          ),
        );
      }
      next(error);
    }
  };

export const validateBody = <T>(schema: ZodSchema<T>) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        }));
        return next(
          new AppError(
            "Validation failed",
            HttpStatus.BAD_REQUEST,
            ErrorCodes.VALIDATION_ERROR,
            formattedErrors,
          ),
        );
      }
      next(error);
    }
  };
};

export const validate = validateBody;
export const zodValidation = validateBody;
