import { th } from "zod/locales";
import { UserStatus } from "../../generated/prisma/client/enums";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import HttpStatus from "../../shared/constants/http-status";
import AppError from "../../shared/errors/app-error";
import ErrorCodes from "../../shared/errors/error-codes";
import { logger } from "../../shared/logger/logger";
import type { CreateUserInput, LoginInput } from "./auth.validation";

class AuthService {
  public registerPatient = async (payload: CreateUserInput) => {
    const { name, email, password } = payload;
    const data = await auth.api.signUpEmail({
      body: {
        name,
        email,
        password,
      },
    });

    if (!data.user) {
      throw new AppError(
        "User not found",
        HttpStatus.NOT_FOUND,
        ErrorCodes.USER_NOT_FOUND,
      );
    }

    try {
      const patient = await prisma.patient.create({
        data: {
          userId: data.user.id,
          name,
          email,
        },
      });

      return {
        ...data,
        patient,
      };
    } catch (error) {
      logger.error("Failed to create patient", error);
      try {
        await prisma.user.delete({ where: { id: data.user.id } });
      } catch (cleanupError) {
        logger.error("Failed to rollback user creation", cleanupError);
      }
      throw new AppError(
        "Failed to create patient",
        HttpStatus.INTERNAL_SERVER_ERROR,
        ErrorCodes.INTERNAL_SERVER_ERROR,
      );
    }
  };
  public login = async (payload: LoginInput) => {
    const { email, password } = payload;
    const data = await auth.api.signInEmail({
      body: {
        email,
        password,
      },
    });
    if (!data.user) {
      throw new AppError(
        "User not found",
        HttpStatus.NOT_FOUND,
        ErrorCodes.USER_NOT_FOUND,
      );
    }
    if (data.user.isDeleted || data.user.status === UserStatus.DELETED) {
      throw new AppError(
        "User not found",
        HttpStatus.NOT_FOUND,
        ErrorCodes.USER_NOT_FOUND,
      );
    }

    return data;
  };
}

export default AuthService;
