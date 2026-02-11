import type { Request, Response } from "express";
import { catchAsync } from "../../shared/utils/async-handler.util";
import userService from "./user.service";
import { ResponseUtil } from "../../shared/utils/response.util";
import HttpStatus from "../../shared/constants/http-status";

class UserController {
  public createDoctor = catchAsync(async (req: Request, res: Response) => {
    const service = new userService();
    const result = await service.createDoctor(req.body);
    return ResponseUtil.success(
      res,
      result,
      "Doctor created successfully",
      HttpStatus.CREATED,
    );
  });

  public createAdmin = catchAsync(async (req: Request, res: Response) => {
    const service = new userService();
    const result = await service.createAdmin(req.body);
    return ResponseUtil.success(
      res,
      result,
      "Admin created successfully",
      HttpStatus.CREATED,
    );
  });
}

export default UserController;
