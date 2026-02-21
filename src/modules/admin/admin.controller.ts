import HttpStatus from "../../shared/constants/http-status";
import { catchAsync } from "../../shared/utils/async-handler.util";
import { ResponseUtil } from "../../shared/utils/response.util";
import AdminService from "./admin.service";
import type { Request, Response } from "express";

class AdminController {
  public getAllAdmins = catchAsync(async (req: Request, res: Response) => {
    const service = new AdminService();
    const result = await service.getAllAdmins();
    return ResponseUtil.success(
      res,
      result,
      "Admins fetched successfully",
      HttpStatus.OK,
    );
  });
  public getAdminById = catchAsync(async (req: Request, res: Response) => {
    const service = new AdminService();
    const result = await service.getAdminById(req.params.id as string);
    return ResponseUtil.success(
      res,
      result,
      "Admin fetched successfully",
      HttpStatus.OK,
    );
  });
  public updateAdmin = catchAsync(async (req: Request, res: Response) => {
    const service = new AdminService();
    const result = await service.updateAdmin(req.params.id as string, req.body);
    return ResponseUtil.success(
      res,
      result,
      "Admin updated successfully",
      HttpStatus.OK,
    );
  });
  public deleteAdmin = catchAsync(async (req: Request, res: Response) => {
    const service = new AdminService();
    const result = await service.deleteAdmin(
      req.params.id as string,
      req.user.userId,
    );
    return ResponseUtil.success(
      res,
      result,
      "Admin deleted successfully",
      HttpStatus.OK,
    );
  });
  public changeUserStatus = catchAsync(async (req: Request, res: Response) => {
    const service = new AdminService();
    const user = req.user;
    const payload = req.body;
    const result = await service.changeUserStatus(user, payload);
    return ResponseUtil.success(
      res,
      result,
      "User status changed successfully",
      HttpStatus.OK,
    );
  });
  public changeUserRole = catchAsync(async (req: Request, res: Response) => {
    const service = new AdminService();
    const user = req.user;
    const payload = req.body;
    const result = await service.changeUserRole(user, payload);
    return ResponseUtil.success(
      res,
      result,
      "User role changed successfully",
      HttpStatus.OK,
    );
  });
}

export default AdminController;
