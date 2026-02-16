import HttpStatus from "../../shared/constants/http-status";
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
    // Implementation for retrieving all schedules
  });

  public getScheduleById = catchAsync(async (req, res) => {
    // Implementation for retrieving a schedule by its ID
  });

  public updateSchedule = catchAsync(async (req, res) => {
    // Implementation for updating a schedule by its ID
  });

  public deleteSchedule = catchAsync(async (req, res) => {
    // Implementation for deleting a schedule by its ID
  });
}


export default ScheduleController;