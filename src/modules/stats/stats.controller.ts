import type { Request, Response } from "express";
import { catchAsync } from "../../shared/utils/async-handler.util";
import { ResponseUtil } from "../../shared/utils/response.util";
import HttpStatus from "../../shared/constants/http-status";
import StatsService from "./stats.service";

class StatsController {
  public getDashboardStatsData = catchAsync(async (req: Request, res: Response) => {
    const service = new StatsService();
     const user = req.user;
    const result = await service.getDashboardStatsData(user);
    return ResponseUtil.success(
      res,
      result,
      "Dashboard stats data fetched successfully",
      HttpStatus.OK,
    );
  })
}
export default StatsController;