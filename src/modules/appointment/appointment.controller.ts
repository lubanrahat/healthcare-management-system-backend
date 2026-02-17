import { catchAsync } from "../../shared/utils/async-handler.util";
import type { Request, Response } from "express";
import { ResponseUtil } from "../../shared/utils/response.util";
import AppointmentService from "./appointment.service";
import HttpStatus from "../../shared/constants/http-status";

class AppointmentController {
  public bookAppointment = catchAsync(async (req: Request, res: Response) => {
    const service = new AppointmentService();
    const result = await service.bookAppointment(req.body, req.user);
    return ResponseUtil.success(
      res,
      result,
      "Appointment booked successfully",
      HttpStatus.CREATED,
    );
  });
  public getMyAppointments = catchAsync(async (req: Request, res: Response) => {
    const service = new AppointmentService();
    const result = await service.getMyAppointments(req.user);
    return ResponseUtil.success(
      res,
      result,
      "Appointments fetched successfully",
      HttpStatus.OK,
    );
  });
  public changeAppointmentStatus = catchAsync(
    async (req: Request, res: Response) => {
      const service = new AppointmentService();
      const appointmentId = req.params.id;
      const payload = req.body;
      const user = req.user;
      const result = await service.changeAppointmentStatus(
        appointmentId as string,
        payload.status,
        user,
      );
      return ResponseUtil.success(
        res,
        result,
        "Appointment status updated successfully",
        HttpStatus.OK,
      );
    },
  );
  public getMySingleAppointment = catchAsync(
    async (req: Request, res: Response) => {
      const service = new AppointmentService();
      const appointmentId = req.params.id;
      const user = req.user;
      const result = await service.getMySingleAppointment(
        appointmentId as string,
        user,
      );
      return ResponseUtil.success(
        res,
        result,
        "Appointment fetched successfully",
        HttpStatus.OK,
      );
    },
  );
  public getAllAppointments = catchAsync(
    async (req: Request, res: Response) => {
      const service = new AppointmentService();
      const result = await service.getAllAppointments();
      return ResponseUtil.success(
        res,
        result,
        "All appointments fetched successfully",
        HttpStatus.OK,
      );
    },
  );
  public bookAppointmentWithPayLater = catchAsync(
    async (req: Request, res: Response) => {
      const service = new AppointmentService();
      const result = await service.bookAppointmentWithPayLater(
        req.body,
        req.user,
      );
      return ResponseUtil.success(
        res,
        result,
        "Appointment booked successfully with pay later option",
        HttpStatus.CREATED,
      );
    },
  );
  public initiatePayment = catchAsync(async (req: Request, res: Response) => {
    const service = new AppointmentService();
    const appointmentId = req.params.id;
    const user = req.user;
    const result = await service.initiatePayment(
      appointmentId as string,
      user,
    );
    return ResponseUtil.success(
      res,
      result,
      "Payment initiated successfully",
      HttpStatus.OK,
    );
  });
  
  
  
}

export default AppointmentController;
