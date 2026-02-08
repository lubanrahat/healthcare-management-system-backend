import type { Request, Response } from "express";
import { catchAsync } from "../../shared/utils/async-handler.util";
import { ResponseUtil } from "../../shared/utils/response.util";
import HttpStatus from "../../shared/constants/http-status";

class HealthController {
  public handleHealthCheck = catchAsync(async (req: Request, res: Response) => {
    ResponseUtil.success(
      res,
      {
        health: "OK",
        version: "1.0.0",
      },
      "Health check successful",
      HttpStatus.OK,
    );
  });
}

export default HealthController;