import type { Request, Response } from "express";
import { catchAsync } from "../../shared/utils/async-handler.util";
import AuthService from "./auth.service";
import { ResponseUtil } from "../../shared/utils/response.util";
import HttpStatus from "../../shared/constants/http-status";
import { logger } from "../../shared/logger/logger";
import ms, { type StringValue } from "ms";
import { env } from "../../config/env";
import TokenService from "../../shared/utils/token";

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
}

export default AuthController;
