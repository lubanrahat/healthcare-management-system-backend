import type { Request, Response } from "express";
import HttpStatus from "../../shared/constants/http-status";
import { catchAsync } from "../../shared/utils/async-handler.util";
import { ResponseUtil } from "../../shared/utils/response.util";
import DoctorService from "./doctor.service";
import type { IQueryParams } from "../../shared/interfaces/query.interface";

class DoctorController {
  public getAllDoctors = catchAsync(async (req: Request, res: Response) => {
    const service = new DoctorService();
    const query = req.query;
    const result = await service.getAllDoctors(query as IQueryParams);
    return ResponseUtil.success(
      res,
      result,
      "Doctors fetched successfully",
      HttpStatus.OK,
    );
  });

  public getDoctorById = catchAsync(async (req: Request, res: Response) => {
    const service = new DoctorService();
    const result = await service.getDoctorById(req.params.id as string);
    return ResponseUtil.success(
      res,
      result,
      "Doctor fetched successfully",
      HttpStatus.OK,
    );
  });

  public updateDoctor = catchAsync(async (req: Request, res: Response) => {
    const service = new DoctorService();
    const result = await service.updateDoctor(
      req.params.id as string,
      req.body,
    );
    return ResponseUtil.success(
      res,
      result,
      "Doctor updated successfully",
      HttpStatus.OK,
    );
  });

  public deleteDoctor = catchAsync(async (req: Request, res: Response) => {
    const service = new DoctorService();
    const result = await service.deleteDoctor(req.params.id as string);
    return ResponseUtil.success(
      res,
      result,
      "Doctor deleted successfully",
      HttpStatus.OK,
    );
  });
}

export default DoctorController;
