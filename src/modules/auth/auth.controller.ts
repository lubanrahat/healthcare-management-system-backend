import type { Request, Response } from "express";
import { catchAsync } from "../../shared/utils/async-handler.util";
import AuthService from "./auth.service";
import { ResponseUtil } from "../../shared/utils/response.util";
import HttpStatus from "../../shared/constants/http-status";
import { logger } from "../../shared/logger/logger";
import ms, { type StringValue } from "ms";
import { env } from "../../config/env";
import TokenService from "../../shared/utils/token";
import { CookieService } from "../../shared/utils/cookie";

class AuthController {
  public registerPatient = catchAsync(async (req: Request, res: Response) => {
    const service = new AuthService();
    const result = await service.registerPatient(req.body);
    const { accessToken, refreshToken, token } = result;

    TokenService.setAccessToken(res, accessToken);
    TokenService.setRefreshToken(res, refreshToken);
    TokenService.setBetterAuthSessionCookie(res, token as string);

    logger.info(`Patient registered successfully: ${result.user?.email}`);
    return ResponseUtil.success(
      res,
      result,
      "Patient registered successfully",
      HttpStatus.CREATED,
    );
  });

  public login = catchAsync(async (req: Request, res: Response) => {
    const service = new AuthService();
    const result = await service.login(req.body);
    const { accessToken, refreshToken, token } = result;

    TokenService.setAccessToken(res, accessToken);
    TokenService.setRefreshToken(res, refreshToken);
    TokenService.setBetterAuthSessionCookie(res, token);

    logger.info(`User logged in successfully: ${result.user?.email}`);
    return ResponseUtil.success(res, result, "Login successful", HttpStatus.OK);
  });

  public getMe = catchAsync(async (req: Request, res: Response) => {
    const service = new AuthService();
    const result = await service.getMe(req.user.userId);
    return ResponseUtil.success(
      res,
      result,
      "User fetched successfully",
      HttpStatus.OK,
    );
  });

  public getNewToken = catchAsync(async (req: Request, res: Response) => {
    const service = new AuthService();

    const refreshToken = req.cookies.refreshToken;
    const betterAuthSessionToken = req.cookies["better-auth.session_token"];
    if (!refreshToken) {
      return ResponseUtil.error(
        res,
        "Refresh token not found",
        HttpStatus.UNAUTHORIZED,
      );
    }

    const result = await service.getNewToken(
      refreshToken,
      betterAuthSessionToken,
    );
    const { accessToken, refreshToken: newRefreshToken, sessionToken } = result;

    TokenService.setAccessToken(res, accessToken);
    TokenService.setRefreshToken(res, newRefreshToken);
    TokenService.setBetterAuthSessionCookie(res, sessionToken);

    return ResponseUtil.success(res, result, "Login successful", HttpStatus.OK);
  });

  public changePassword = catchAsync(async (req: Request, res: Response) => {
    const service = new AuthService();
    const betterAuthSessionToken = req.cookies["better-auth.session_token"];
    const payload = req.body;
    logger.info(betterAuthSessionToken, payload);
    const result = await service.changePassword(payload, req.headers);
    return ResponseUtil.success(
      res,
      result,
      "Password changed successfully",
      HttpStatus.OK,
    );
  });

  public logoutUser = catchAsync(async (req: Request, res: Response) => {
    const service = new AuthService();
    const betterAuthSessionToken = req.cookies["better-auth.session_token"];
    const result = await service.logoutUser(betterAuthSessionToken);
    CookieService.clear(res, "better-auth.session_token");
    CookieService.clear(res, "refreshToken");
    CookieService.clear(res, "accessToken");
    return ResponseUtil.success(
      res,
      result,
      "User logged out successfully",
      HttpStatus.OK,
    );
  });
}

export default AuthController;
