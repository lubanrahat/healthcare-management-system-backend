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

  public getAllSpecialties = catchAsync(async (req: Request, res: Response) => {
    const service = new SpecialtyService();
    const result = await service.getAllSpecialties();
    return ResponseUtil.success(
      res,
      result,
      "Specialties fetched successfully",
      HttpStatus.OK,
    );
  });

  public getSpecialty = catchAsync(async (req: Request, res: Response) => {
    const service = new SpecialtyService();
    const result = await service.getSpecialty(req.params.id as string);
    return ResponseUtil.success(
      res,
      result,
      "Specialty fetched successfully",
      HttpStatus.OK,
    );
  });

  public deleteSpecialty = catchAsync(async (req: Request, res: Response) => {
    const service = new SpecialtyService();
    const result = await service.deleteSpecialty(req.params.id as string);
    return ResponseUtil.success(
      res,
      result,
      "Specialty deleted successfully",
      HttpStatus.OK,
    );
  });

  public updateSpecialty = catchAsync(async (req: Request, res: Response) => {
    const service = new SpecialtyService();
    const result = await service.updateSpecialty(
      req.params.id as string,
      req.body,
    );
    return ResponseUtil.success(
      res,
      result,
      "Specialty updated successfully",
      HttpStatus.OK,
    );
  });
}

export default SpecialtyController;
