import type { Response } from "express";
import type { ApiResponse } from "../types/response.types";

export class ResponseUtil {
  static success<T>(
    res: Response,
    data: T,
    message?: string,
    statusCode = 200,
  ) {
    const response: ApiResponse<T> = {
      success: true,
      message: message || "Success",
      data,
      meta: {
        timestamp: new Date().toISOString(),
      },
    };
    return res.status(statusCode).json(response);
  }

  static error(
    res: Response,
    message: string,
    statusCode = 500,
    errorCode?: string,
    details?: any,
  ) {
    const response: ApiResponse = {
      success: false,
      error: {
        code: errorCode || "INTERNAL_ERROR",
        message,
        details,
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    };
    return res.status(statusCode).json(response);
  }

  static paginated<T>(
    res: Response,
    data: T[],
    page: number,
    limit: number,
    total: number,
    message?: string,
  ) {
    const response: ApiResponse<T[]> = {
      success: true,
      message: message || "Success",
      data,
      meta: {
        timestamp: new Date().toISOString(),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
    return res.status(200).json(response);
  }
}
