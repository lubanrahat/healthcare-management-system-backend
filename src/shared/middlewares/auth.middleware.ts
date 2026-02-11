import type { NextFunction, Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { UserStatus, type UserRole } from "../../generated/prisma/client/enums";
import { CookieService } from "../utils/cookie";
import AppError from "../errors/app-error";
import HttpStatus from "../constants/http-status";
import JwtService from "../utils/jwt";
import { env } from "../../config/env";

export const withAuth =
  (...authRoles: UserRole[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const sessionToken = CookieService.get(req, "better-auth.session_token");

      if (!sessionToken) {
        throw new Error("Unauthorized access! No session token provided.");
      }

      if (sessionToken) {
        const sessionExists = await prisma.session.findFirst({
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

        if (sessionExists && sessionExists.user) {
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
              "Unauthorized access! User is not active.",
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

          req.user = {
            userId: user.id,
            role: user.role,
            email: user.email,
          };
        }

        const accessToken = CookieService.get(req, "accessToken");

        if (!accessToken) {
          throw new AppError(
            "Unauthorized access! No access token provided.",
            HttpStatus.UNAUTHORIZED,
          );
        }
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

      if (!verifiedToken.success) {
        throw new AppError(
          "Unauthorized access! Invalid access token.",
          HttpStatus.UNAUTHORIZED,
        );
      }

      if (
        authRoles.length > 0 &&
        !authRoles.includes(verifiedToken.data!.role as UserRole)
      ) {
        throw new AppError(
          "Forbidden access! You do not have permission to access this resource.",
          HttpStatus.FORBIDDEN,
        );
      }

      next();
    } catch (error: any) {
      next(error);
    }
  };
