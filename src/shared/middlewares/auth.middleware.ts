import { UserStatus, UserRole } from "../../generated/prisma/client/enums";
import type { Request, Response, NextFunction } from "express";
import { CookieService } from "../utils/cookie";
import { ResponseUtil } from "../utils/response.util";
import HttpStatus from "../constants/http-status";
import { prisma } from "../../lib/prisma";
import AppError from "../errors/app-error";
import JwtService from "../utils/jwt";
import { env } from "../../config/env";

export const withAuth =
  (...authRoles: UserRole[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
     
      const sessionToken = CookieService.get(req, "better-auth.session_token");

      if (!sessionToken) {
        return ResponseUtil.error(
          res,
          "Unauthorized - No session token",
          HttpStatus.UNAUTHORIZED,
        );
      }

      const sessionExists = await prisma.session.findUnique({
        where: {
          token: sessionToken,
          expiresAt: {
            gt: new Date(),
          },
        },
        include: {
          user: true,
        },
      });

      if (!sessionExists || !sessionExists.user) {
        throw new AppError(
          "Unauthorized access! Invalid or expired session.",
          HttpStatus.UNAUTHORIZED,
        );
      }

      const user = sessionExists.user;

      const now = new Date();
      const expiresAt = new Date(sessionExists.expiresAt);
      const createdAt = new Date(sessionExists.createdAt);

      const sessionLifeTime = expiresAt.getTime() - createdAt.getTime();
      const timeRemaining = expiresAt.getTime() - now.getTime();
      const percentRemaining = (timeRemaining / sessionLifeTime) * 100;

      if (percentRemaining < 20) {
        res.setHeader("X-Session-Refresh", "true");
        res.setHeader("X-Session-Expires-At", expiresAt.toISOString());
        res.setHeader("X-Time-Remaining", timeRemaining.toString());

        console.log("Session Expiring Soon!!");
      }

      if (
        user.status === UserStatus.BLOCKED ||
        user.status === UserStatus.DELETED
      ) {
        throw new AppError(
          "Unauthorized access! User is blocked or deleted.",
          HttpStatus.UNAUTHORIZED,
        );
      }

      if (user.isDeleted) {
        throw new AppError(
          "Unauthorized access! User is deleted.",
          HttpStatus.UNAUTHORIZED,
        );
      }

      
      if (authRoles.length > 0 && !authRoles.includes(user.role)) {
        throw new AppError(
          "Forbidden access! You do not have permission to access this resource.",
          HttpStatus.FORBIDDEN,
        );
      }

      const accessToken = CookieService.get(req, "accessToken");

      if (!accessToken) {
        throw new AppError(
          "Unauthorized access! No access token provided.",
          HttpStatus.UNAUTHORIZED,
        );
      }

      const verifiedToken = JwtService.verifyToken(
        accessToken,
        env.ACCESS_TOKEN_SECRET,
      );

      if (verifiedToken.role !== user.role) {
        throw new AppError(
          "Unauthorized access! Token role mismatch.",
          HttpStatus.UNAUTHORIZED,
        );
      }

      req.user = {
        userId: user.id,
        role: user.role,
        email: user.email,
      };

      next();
    } catch (error) {
      next(error);
    }
  };
