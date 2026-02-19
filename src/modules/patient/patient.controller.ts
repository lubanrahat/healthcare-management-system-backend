import type { Request, Response } from "express";
import { catchAsync } from "../../shared/utils/async-handler.util";
import type { IRequestUser } from "../../shared/interfaces/requestUser.interface";
import PatientService from "./patient.service";
import { ResponseUtil } from "../../shared/utils/response.util";
import HttpStatus from "../../shared/constants/http-status";

class PationtController {
  public updateMyProfile = catchAsync(async (req: Request, res: Response) => {
    const user = req.user as IRequestUser;
    const payload = req.body;
    const service = new PatientService();
    const result = await service.updateMyProfile(user, payload);
    return ResponseUtil.success(
      res,
      result,
      "Profile updated successfully",
      HttpStatus.OK,
    );
  });
}

export default PationtController;
