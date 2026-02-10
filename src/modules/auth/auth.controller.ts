import type { Request, Response } from "express";
import { catchAsync } from "../../shared/utils/async-handler.util";
import AuthService from "./auth.service";
import { ResponseUtil } from "../../shared/utils/response.util";
import HttpStatus from "../../shared/constants/http-status";
import { logger } from "../../shared/logger/logger";
import CookieService from "../../shared/utils/cookie";
import ms, { type StringValue } from "ms";
import { env } from "../../config/env";

class AuthController {
  public registerPatient = catchAsync(async (req: Request, res: Response) => {
    const service = new AuthService();
    const result = await service.registerPatient(req.body);
    const { accessToken, refreshToken, token } = result;

    CookieService.setAccessToken(res, accessToken);
    CookieService.setRefreshToken(res, refreshToken);
    CookieService.setBetterAuthSessionCookie(res, token as string);

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

    CookieService.setAccessToken(res, accessToken);
    CookieService.setRefreshToken(res, refreshToken);
    CookieService.setBetterAuthSessionCookie(res, token);

    logger.info(`User logged in successfully: ${result.user?.email}`);
    return ResponseUtil.success(res, result, "Login successful", HttpStatus.OK);
  });
}

export default AuthController;
