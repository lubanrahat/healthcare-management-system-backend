import HttpStatus from "../../shared/constants/http-status";
import type { IQueryParams } from "../../shared/interfaces/query.interface";
import { catchAsync } from "../../shared/utils/async-handler.util";
import { ResponseUtil } from "../../shared/utils/response.util";
import ScheduleService from "./schedule.service";

class ScheduleController {
  private service = new ScheduleService();
  public createSchedule = catchAsync(async (req, res) => {
    const payload = req.body;
    const schedule = await this.service.createSchedule(payload);

    ResponseUtil.success(res, {
      data: schedule,
      message: "Schedule created successfully",
      HttpStatus: HttpStatus.CREATED,
    });
  });

  public getAllSchedules = catchAsync(async (req, res) => {
    const query = req.query;
    const schedules = await this.service.getAllSchedules(query as IQueryParams);

    ResponseUtil.success(res, {
      data: schedules.data,
      meta: schedules.meta,
      message: "Schedules retrieved successfully",
      HttpStatus: HttpStatus.OK,
    });
  });

  public getScheduleById = catchAsync(async (req, res) => {
    const id = req.params.id;
    const schedule = await this.service.getScheduleById(id as string);

    ResponseUtil.success(res, {
      data: schedule,
      message: "Schedule retrieved successfully",
      HttpStatus: HttpStatus.OK,
    });
  });

  public updateSchedule = catchAsync(async (req, res) => {
    const id = req.params.id;
    const payload = req.body;
    const updatedSchedule = await this.service.updateSchedule(
      id as string,
      payload,
    );

    ResponseUtil.success(res, {
      data: updatedSchedule,
      message: "Schedule updated successfully",
      HttpStatus: HttpStatus.OK,
    });
  });

  public deleteSchedule = catchAsync(async (req, res) => {
    const id = req.params.id;
    await this.service.deleteSchedule(id as string);

    ResponseUtil.success(res, {
      data: null,
      message: "Schedule deleted successfully",
      HttpStatus: HttpStatus.NO_CONTENT,
    });
  });
}

export default ScheduleController;
