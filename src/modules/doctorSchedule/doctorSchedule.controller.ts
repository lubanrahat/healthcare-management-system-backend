import HttpStatus from "../../shared/constants/http-status";
import type { IQueryParams } from "../../shared/interfaces/query.interface";
import { catchAsync } from "../../shared/utils/async-handler.util";
import { ResponseUtil } from "../../shared/utils/response.util";
import DoctorScheduleService from "./doctorSchedule.service";
import type { Request, Response } from "express";

class DoctorScheduleController {
  private service = new DoctorScheduleService();
  public createMyDoctorSchedule = catchAsync(
    async (req: Request, res: Response) => {
      const payload = req.body;
      const doctorSchedule = await this.service.createMyDoctorSchedule(
        req.user,
        payload,
      );

      ResponseUtil.success(res, {
        data: doctorSchedule,
        message: "Doctor schedule created successfully",
        HttpStatus: HttpStatus.CREATED,
      });
    },
  );
  public getMyDoctorSchedules = catchAsync(
    async (req: Request, res: Response) => {
      const query = req.query;
      const doctorSchedules = await this.service.getMyDoctorSchedules(
        req.user,
        query as IQueryParams,
      );

      ResponseUtil.success(res, {
        data: doctorSchedules.data,
        meta: doctorSchedules.meta,
        message: "Doctor schedules retrieved successfully",
        HttpStatus: HttpStatus.OK,
      });
    },
  );
  public getAllDoctorSchedules = catchAsync(
    async (req: Request, res: Response) => {
      const query = req.query;
      const doctorSchedules = await this.service.getAllDoctorSchedules(
        query as IQueryParams,
      );

      ResponseUtil.success(res, {
        data: doctorSchedules.data,
        meta: doctorSchedules.meta,
        message: "Doctor schedules retrieved successfully",
        HttpStatus: HttpStatus.OK,
      });
    },
  );
  public getDoctorScheduleById = catchAsync(
    async (req: Request, res: Response) => {
      const doctorId = req.params.doctorId;
      const scheduleId = req.params.scheduleId;
      const doctorSchedule = await this.service.getDoctorScheduleById(
        doctorId as string,
        scheduleId as string,
      );

      ResponseUtil.success(res, {
        data: doctorSchedule,
        message: "Doctor schedule retrieved successfully",
        HttpStatus: HttpStatus.OK,
      });
    },
  );
  public updateMyDoctorSchedule = catchAsync(
    async (req: Request, res: Response) => {
      const payload = req.body;
      const doctorSchedule = await this.service.updateMyDoctorSchedule(
        req.user,
        payload,
      );

      ResponseUtil.success(res, {
        data: doctorSchedule,
        message: "Doctor schedule updated successfully",
        HttpStatus: HttpStatus.OK,
      });
    },
  );
  public deleteMyDoctorSchedule = catchAsync(
    async (req: Request, res: Response) => {
      const id = req.params.id;
      await this.service.deleteMyDoctorSchedule(id as string, req.user);

      ResponseUtil.success(res, {
        data: null,
        message: "Doctor schedule deleted successfully",
        HttpStatus: HttpStatus.NO_CONTENT,
      });
    },
  );
}

export default DoctorScheduleController;
