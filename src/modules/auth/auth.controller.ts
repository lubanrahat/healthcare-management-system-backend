import type { Request, Response } from "express";
import { catchAsync } from "../../shared/utils/async-handler.util";
import AuthService from "./auth.service";
import { ResponseUtil } from "../../shared/utils/response.util";
import HttpStatus from "../../shared/constants/http-status";
import { logger } from "../../shared/logger/logger";

class AuthController {
  public registerPatient = catchAsync(async (req: Request, res: Response) => {
    const service = new AuthService();
    const result = await service.registerPatient(req.body);
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
    logger.info(`User logged in successfully: ${result.user?.email}`);
    return ResponseUtil.success(res, result, "Login successful", HttpStatus.OK);
  });
}

export default AuthController;
