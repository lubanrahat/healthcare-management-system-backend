import type { Request, Response } from "express";
import { catchAsync } from "../../shared/utils/async-handler.util";
import PrescriptionService from "./prescription.service";
import { ResponseUtil } from "../../shared/utils/response.util";
import HttpStatus from "../../shared/constants/http-status";
import type { IRequestUser } from "../../shared/interfaces/requestUser.interface";

class PrescriptionController {
  public givePrescription = catchAsync(async (req: Request, res: Response) => {
    const payload = req.body;
    const user = req.user;
    const service = new PrescriptionService();
    const result = await service.givePrescription(user, payload);
    return ResponseUtil.success(
      res,
      result,
      "Prescription given successfully",
      HttpStatus.CREATED,
    );
  });
  public myPrescriptions = catchAsync(async (req: Request, res: Response) => {
    const user = req.user as IRequestUser;
    const service = new PrescriptionService();
    const result = await service.myPrescriptions(user);
    return ResponseUtil.success(
      res,
      result,
      "Prescriptions fetched successfully",
      HttpStatus.OK,
    );
  });
  public getAllPrescriptions = catchAsync(
    async (req: Request, res: Response) => {
      const service = new PrescriptionService();
      const result = await service.getAllPrescriptions();
      return ResponseUtil.success(
        res,
        result,
        "Prescription fetched successfully",
        HttpStatus.OK,
      );
    },
  );
}

export default PrescriptionController;
