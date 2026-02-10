import type { Request, Response, NextFunction } from "express";
import AppError from "../errors/app-error";
import { ResponseUtil } from "../utils/response.util";
import { ZodError } from "zod";
import { PrismaErrorHandler } from "../utils/prisma-error-handler";
import HttpStatus from "../constants/http-status";
import ErrorCodes from "../errors/error-codes";
import { Prisma } from "../../generated/prisma/client/client";
import { logger } from "../logger/logger";

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Handle custom AppError
  if (err instanceof AppError) {
    return ResponseUtil.error(
      res,
      err.message,
      err.statusCode,
      err.code,
      err.details,
    );
  }

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    const formattedErrors = err.issues.map((issue) => ({
      field: issue.path.length ? issue.path.join(".") : "_root",
      message: issue.message,
    }));

    return ResponseUtil.error(
      res,
      "Validation failed",
      HttpStatus.BAD_REQUEST,
      ErrorCodes.VALIDATION_ERROR,
      formattedErrors,
    );
  }

  // Handle Prisma errors
  if (
    err instanceof Prisma.PrismaClientKnownRequestError ||
    err instanceof Prisma.PrismaClientValidationError ||
    err instanceof Prisma.PrismaClientInitializationError
  ) {
    const prismaError = PrismaErrorHandler.handle(err);
    return ResponseUtil.error(
      res,
      prismaError.message,
      prismaError.statusCode,
      prismaError.code,
      prismaError.details,
    );
  }

  // Handle JWT errors
  if (err instanceof Error && err.name === "JsonWebTokenError") {
    return ResponseUtil.error(
      res,
      "Invalid token",
      HttpStatus.UNAUTHORIZED,
      ErrorCodes.INVALID_TOKEN,
    );
  }

  if (err instanceof Error && err.name === "TokenExpiredError") {
    return ResponseUtil.error(
      res,
      "Token expired",
      HttpStatus.UNAUTHORIZED,
      ErrorCodes.TOKEN_EXPIRED,
    );
  }

  // Log unexpected errors
  logger.error("Unhandled error:", err);

  // Default fallback
  const message =
    process.env.NODE_ENV === "production"
      ? "Internal server error"
      : err instanceof Error
        ? err.message
        : "Unknown error";

  return ResponseUtil.error(
    res,
    message,
    HttpStatus.INTERNAL_SERVER_ERROR,
    ErrorCodes.INTERNAL_ERROR,
  );
};
