import type { Request, Response } from "express";
import HttpStatus from "../../shared/constants/http-status";
import { catchAsync } from "../../shared/utils/async-handler.util";
import { ResponseUtil } from "../../shared/utils/response.util";
import SpecialtyService from "./specialty.service";

class SpecialtyController {
  public createSpecialty = catchAsync(async (req: Request, res: Response) => {
    const service = new SpecialtyService();
    const result = await service.createSpecialty(req.body);
    return ResponseUtil.success(
      res,
      result,
      "Specialty created successfully",
      HttpStatus.CREATED,
    );
  });
}

export default SpecialtyController;
