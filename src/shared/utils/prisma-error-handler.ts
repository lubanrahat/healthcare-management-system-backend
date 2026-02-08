
import { Prisma } from "../../generated/prisma/client/client";
import HttpStatus from "../constants/http-status";
import ErrorCodes from "../errors/error-codes";

type ErrorResponse = {
  message: string;
  statusCode: number;
  code: string;
  details: any;
};

export class PrismaErrorHandler {
  static handle(err: any): ErrorResponse {
    let statusCode = 400;
    let message = "Database Error";
    let code = "DATABASE_ERROR";
    let details: any = null;

    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      // Handle unique constraint violation
      if (err.code === "P2002") {
        statusCode = HttpStatus.BAD_REQUEST;
        const target = (err.meta as any)?.target;
        message = target ? `${target} already exists` : "Duplicate entry";
        code = ErrorCodes.DUPLICATE_ENTRY;
        details = err.meta;
      }
      // Handle record not found
      else if (err.code === "P2025") {
        statusCode = HttpStatus.NOT_FOUND;
        message = "Record not found";
        code = ErrorCodes.NOT_FOUND;
        details = err.meta;
      }
      // Handle foreign key constraint violation
      else if (err.code === "P2003") {
        statusCode = HttpStatus.BAD_REQUEST;
        message = "Foreign key constraint failed";
        code = "FOREIGN_KEY_CONSTRAINT";
        details = err.meta;
      } else {
        message = err.message;
        code = err.code;
        details = err.meta;
      }
    } else if (err instanceof Prisma.PrismaClientValidationError) {
      statusCode = HttpStatus.BAD_REQUEST;
      message = "Validation Error";
      code = ErrorCodes.VALIDATION_ERROR;
      // Simplified message for validation errors
      const match = err.message.match(/Argument `(\w+)` is missing/);
      if (match) {
        message = `Missing required field: ${match[1]}`;
      } else {
        message = "Invalid data format";
      }
      details = err.message;
    } else if (err instanceof Prisma.PrismaClientInitializationError) {
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      message = "Database connection error";
      code = ErrorCodes.DB_CONNECTION_ERROR;
      details = err.message;
    }

    return {
      message,
      statusCode,
      code,
      details,
    };
  }
}
