import type { Request, Response, NextFunction } from "express";
import { randomUUID } from "crypto";
import { logger } from "../logger/logger";


export const requestIdMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const requestId = req.get("x-request-id") ?? randomUUID();

  req.id = requestId;
  res.setHeader("x-request-id", requestId);

  logger.info("Incoming request", {
    requestId,
    method: req.method,
    path: req.originalUrl,
  });

  next();
};
