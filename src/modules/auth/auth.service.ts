import type { JwtPayload } from "jsonwebtoken";
import { env } from "../../config/env";
import { UserStatus } from "../../generated/prisma/client/enums";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import HttpStatus from "../../shared/constants/http-status";
import AppError from "../../shared/errors/app-error";
import ErrorCodes from "../../shared/errors/error-codes";
import { logger } from "../../shared/logger/logger";
import JwtService from "../../shared/utils/jwt";
import TokenService from "../../shared/utils/token";
import type {
  IChangePasswordPayload,
  ILoginPayload,
  IRegisterPatientPayload,
  SessionResponse,
} from "./auth.interface";
import { he, th } from "zod/locales";

class AuthService {
  public registerPatient = async (payload: IRegisterPatientPayload) => {
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

      const accessToken = TokenService.generateAccessToken({
        userId: data.user.id,
        role: data.user.role,
        name: data.user.name,
        email: data.user.email,
        status: data.user.status,
        isDeleted: data.user.isDeleted,
        emailVerified: data.user.emailVerified,
      });

      const refreshToken = TokenService.generateRefreshToken({
        userId: data.user.id,
        role: data.user.role,
        name: data.user.name,
        email: data.user.email,
        status: data.user.status,
        isDeleted: data.user.isDeleted,
        emailVerified: data.user.emailVerified,
      });

      return {
        ...data,
        patient,
        accessToken,
        refreshToken,
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

  public login = async (payload: ILoginPayload) => {
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

    const accessToken = TokenService.generateAccessToken({
      userId: data.user.id,
      role: data.user.role,
      name: data.user.name,
      email: data.user.email,
      status: data.user.status,
      isDeleted: data.user.isDeleted,
      emailVerified: data.user.emailVerified,
    });

    const refreshToken = TokenService.generateRefreshToken({
      userId: data.user.id,
      role: data.user.role,
      name: data.user.name,
      email: data.user.email,
      status: data.user.status,
      isDeleted: data.user.isDeleted,
      emailVerified: data.user.emailVerified,
    });

    return {
      ...data,
      accessToken,
      refreshToken,
    };
  };

  public getMe = async (userId: string) => {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    return user;
  };

  public getNewToken = async (refreshToken: string, sessionToken: string) => {
    const isSessionTokenExist = await prisma.session.findUnique({
      where: {
        token: sessionToken,
      },
    });
    if (!isSessionTokenExist) {
      throw new AppError("Session token not found", HttpStatus.NOT_FOUND);
    }
    const verifiedRefreshToken = JwtService.verifyToken(
      refreshToken,
      env.REFRESH_TOKEN_SECRET,
    );
    const data = verifiedRefreshToken.data as JwtPayload;
    const newAccessToken = TokenService.generateAccessToken({
      userId: data.user.id,
      role: data.user.role,
      name: data.user.name,
      email: data.user.email,
      status: data.user.status,
      isDeleted: data.user.isDeleted,
      emailVerified: data.user.emailVerified,
    });

    const newRefreshToken = TokenService.generateRefreshToken({
      userId: data.user.id,
      role: data.user.role,
      name: data.user.name,
      email: data.user.email,
      status: data.user.status,
      isDeleted: data.user.isDeleted,
      emailVerified: data.user.emailVerified,
    });

    const updatedSession = await prisma.session.update({
      where: {
        token: sessionToken,
      },
      data: {
        token: newRefreshToken,
        expiresAt: new Date(Date.now() + 60 * 60 * 24 * 1000),
        updatedAt: new Date(),
      },
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      sessionToken: updatedSession.token,
    };
  };

  public changePassword = async (
    payload: IChangePasswordPayload,
    headers: any,
  ) => {
    const { newPassword, currentPassword } = payload;

    try {
      const result = await auth.api.changePassword({
        body: {
          currentPassword,
          newPassword,
          revokeOtherSessions: true,
        },
        headers: headers instanceof Headers ? headers : new Headers(headers),
      });
      return result;
    } catch (error: any) {
      logger.error("Failed to change password", error);
      throw error;
    }
  };

  public logoutUser = async (sessionToken: string) => {
    const result = await auth.api.signOut({
      headers: {
        Authorization: `Bearer ${sessionToken}`,
      },
    });
    return result;
  };

  public verifyEmail = async (email: string, otp: string) => {
    const result = await auth.api.verifyEmailOTP({
      body: {
        email,
        otp,
      },
    });

    if (result.status && !result.user.emailVerified) {
      await prisma.user.update({
        where: {
          email,
        },
        data: {
          emailVerified: true,
        },
      });
    }

    return result;
  };

  public forgotPassword = async (email: string) => {
    const exgistingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!exgistingUser) {
      throw new AppError(
        "User not found",
        HttpStatus.NOT_FOUND,
        ErrorCodes.USER_NOT_FOUND,
      );
    }

    if (!exgistingUser.emailVerified) {
      throw new AppError(
        "Email not verified. Please verify your email before resetting password",
        HttpStatus.BAD_REQUEST,
        ErrorCodes.VALIDATION_ERROR,
      );
    }

    if (
      exgistingUser.isDeleted ||
      exgistingUser.status === UserStatus.DELETED
    ) {
      throw new AppError(
        "User not found",
        HttpStatus.NOT_FOUND,
        ErrorCodes.USER_NOT_FOUND,
      );
    }

    await auth.api.requestPasswordResetEmailOTP({
      body: {
        email,
      },
    });
  };

  public resetPassword = async (
    email: string,
    otp: string,
    newPassword: string,
  ) => {
    const exgistingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!exgistingUser) {
      throw new AppError(
        "User not found",
        HttpStatus.NOT_FOUND,
        ErrorCodes.USER_NOT_FOUND,
      );
    }

    if (!exgistingUser.emailVerified) {
      throw new AppError(
        "Email not verified. Please verify your email before resetting password",
        HttpStatus.BAD_REQUEST,
        ErrorCodes.VALIDATION_ERROR,
      );
    }

    if (
      exgistingUser.isDeleted ||
      exgistingUser.status === UserStatus.DELETED
    ) {
      throw new AppError(
        "User not found",
        HttpStatus.NOT_FOUND,
        ErrorCodes.USER_NOT_FOUND,
      );
    }

    await auth.api.resetPasswordEmailOTP({
      body: {
        email,
        otp,
        password: newPassword,
      },
    });

    if (exgistingUser.needPasswordChange) {
      await prisma.user.update({
        where: {
          email,
        },
        data: {
          needPasswordChange: false,
        },
      });
    }

    await prisma.session.deleteMany({
      where: {
        userId: exgistingUser.id,
      },
    });
  };

  public handleGoogleLoginSuccess = async (session: SessionResponse) => {
    const isPatientExist = await prisma.patient.findUnique({
      where: {
        userId: session.user.id,
      },
    });

    if (!isPatientExist) {
      await prisma.patient.create({
        data: {
          userId: session.user.id,
          name: session.user.name,
          email: session.user.email,
        },
      });
    }

    const accessToken = TokenService.generateAccessToken({
      userId: session.user.id,
      role: session.user.role,
      name: session.user.name,
      email: session.user.email,
      status: session.user.status,
      isDeleted: session.user.isDeleted,
      emailVerified: session.user.emailVerified,
    });

    const refreshToken = TokenService.generateRefreshToken({
      userId: session.user.id,
      role: session.user.role,
      name: session.user.name,
      email: session.user.email,
      status: session.user.status,
      isDeleted: session.user.isDeleted,
      emailVerified: session.user.emailVerified,
    });

    return {
      accessToken,
      refreshToken,
    };
  };
}

export default AuthService;
