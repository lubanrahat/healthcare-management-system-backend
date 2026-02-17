import { uuidv7 } from "zod";
import { prisma } from "../../lib/prisma";
import type { IRequestUser } from "../../shared/interfaces/requestUser.interface";
import type { IBookAppointmentPayload } from "./appointment.interface";
import { env } from "../../config/env";
import {
  AppointmentStatus,
  PaymentStatus,
  UserRole,
} from "../../generated/prisma/client/browser";
import { AppError } from "../../shared/errors/app-error";
import { HttpStatus } from "../../shared/constants/http-status";
import { stripe } from "../../config/stripe.config";

class AppointmentService {
  public async bookAppointment(
    payload: IBookAppointmentPayload,
    user: IRequestUser,
  ) {
    const patientData = await prisma.patient.findUniqueOrThrow({
      where: {
        email: user.email,
      },
    });

    const doctorData = await prisma.doctor.findUniqueOrThrow({
      where: {
        id: payload.doctorId,
        isDeleted: false,
      },
    });

    const scheduleData = await prisma.schedule.findUniqueOrThrow({
      where: {
        id: payload.scheduleId,
      },
    });

    const doctorSchedule = await prisma.doctorSchedules.findUniqueOrThrow({
      where: {
        doctorId_scheduleId: {
          doctorId: doctorData.id,
          scheduleId: scheduleData.id,
        },
      },
    });

    const videoCallingId = String(uuidv7());

    const result = await prisma.$transaction(async (tx) => {
      const appointmentData = await tx.appointment.create({
        data: {
          doctorId: payload.doctorId,
          patientId: patientData.id,
          scheduleId: doctorSchedule.scheduleId,
          videoCallingId,
        },
      });

      await tx.doctorSchedules.update({
        where: {
          doctorId_scheduleId: {
            doctorId: payload.doctorId,
            scheduleId: payload.scheduleId,
          },
        },
        data: {
          isBooked: true,
        },
      });

      //TODO : Payment Integration will be here

      const transactionId = String(uuidv7());

      const paymentData = await tx.payment.create({
        data: {
          appointmentId: appointmentData.id,
          amount: doctorData.appointmentFee,
          transactionId,
        },
      });

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        line_items: [
          {
            price_data: {
              currency: "bdt",
              product_data: {
                name: `Appointment with Dr. ${doctorData.name}`,
              },
              unit_amount: doctorData.appointmentFee * 100,
            },
            quantity: 1,
          },
        ],
        metadata: {
          appointmentId: appointmentData.id,
          paymentId: paymentData.id,
        },

        success_url: `${env.FRONTEND_URL}/dashboard/payment/payment-success`,

        // cancel_url: `${envVars.FRONTEND_URL}/dashboard/payment/payment-failed`,
        cancel_url: `${env.FRONTEND_URL}/dashboard/appointments`,
      });

      return {
        appointmentData,
        paymentData,
        paymentUrl: session.url,
      };
    });

    return {
      appointment: result.appointmentData,
      payment: result.paymentData,
      paymentUrl: result.paymentUrl,
    };
  }
  public async getMyAppointments(user: IRequestUser) {
    const patientData = await prisma.patient.findUnique({
      where: {
        email: user?.email,
      },
    });

    const doctorData = await prisma.doctor.findUnique({
      where: {
        email: user?.email,
      },
    });

    let appointments = [];

    if (patientData) {
      appointments = await prisma.appointment.findMany({
        where: {
          patientId: patientData.id,
        },
        include: {
          doctor: true,
          schedule: true,
        },
      });
    } else if (doctorData) {
      appointments = await prisma.appointment.findMany({
        where: {
          doctorId: doctorData.id,
        },
        include: {
          patient: true,
          schedule: true,
        },
      });
    } else {
      throw new Error("User not found");
    }

    return appointments;
  }
  public async changeAppointmentStatus(
    appointmentId: string,
    appointmentStatus: AppointmentStatus,
    user: IRequestUser,
  ) {
    const appointmentData = await prisma.appointment.findUniqueOrThrow({
      where: {
        id: appointmentId,
        // status: AppointmentStatus.SCHEDULED
      },
      include: {
        doctor: true,
      },
    });

    // if (!appointmentData) {
    //     throw new AppError(status.NOT_FOUND, "Appointment not found or already completed/cancelled");
    // }

    if (user?.role === UserRole.DOCTOR) {
      if (!(user?.email === appointmentData.doctor.email)) {
        throw new AppError(
          "Unauthorized to change appointment status",
          HttpStatus.UNAUTHORIZED,
        );
      }
    }

    return await prisma.appointment.update({
      where: {
        id: appointmentId,
      },
      data: {
        status: appointmentStatus,
      },
    });
  }
  public async getMySingleAppointment(
    appointmentId: string,
    user: IRequestUser,
  ) {
    const patientData = await prisma.patient.findUnique({
      where: {
        email: user?.email,
      },
    });

    const doctorData = await prisma.doctor.findUnique({
      where: {
        email: user?.email,
      },
    });

    let appointment;

    if (patientData) {
      appointment = await prisma.appointment.findFirst({
        where: {
          id: appointmentId,
          patientId: patientData.id,
        },
        include: {
          doctor: true,
          schedule: true,
        },
      });
    } else if (doctorData) {
      appointment = await prisma.appointment.findFirst({
        where: {
          id: appointmentId,
          doctorId: doctorData.id,
        },
        include: {
          patient: true,
          schedule: true,
        },
      });
    }

    if (!appointment) {
        throw new AppError("Appointment not found", HttpStatus.NOT_FOUND);
    }

    return appointment;
  }
  public async getAllAppointments() {
    return await prisma.appointment.findMany({
      include: {
        doctor: true,
        patient: true,
        schedule: true,
      },
    });
  }
  public async bookAppointmentWithPayLater(
    payload: IBookAppointmentPayload,
    user: IRequestUser,
  ) {
    const patientData = await prisma.patient.findUniqueOrThrow({
      where: {
        email: user.email,
      },
    });

    const doctorData = await prisma.doctor.findUniqueOrThrow({
      where: {
        id: payload.doctorId,
        isDeleted: false,
      },
    });

    const scheduleData = await prisma.schedule.findUniqueOrThrow({
      where: {
        id: payload.scheduleId,
      },
    });

    const doctorSchedule = await prisma.doctorSchedules.findUniqueOrThrow({
      where: {
        doctorId_scheduleId: {
          doctorId: doctorData.id,
          scheduleId: scheduleData.id,
        },
      },
    });

    const videoCallingId = String(uuidv7());

    const result = await prisma.$transaction(async (tx) => {
      const appointmentData = await tx.appointment.create({
        data: {
          doctorId: payload.doctorId,
          patientId: patientData.id,
          scheduleId: doctorSchedule.scheduleId,
          videoCallingId,
        },
      });

      await tx.doctorSchedules.update({
        where: {
          doctorId_scheduleId: {
            doctorId: payload.doctorId,
            scheduleId: payload.scheduleId,
          },
        },
        data: {
          isBooked: true,
        },
      });

      const transactionId = String(uuidv7());

      const paymentData = await tx.payment.create({
        data: {
          appointmentId: appointmentData.id,
          amount: doctorData.appointmentFee,
          transactionId,
        },
      });

      return {
        appointment: appointmentData,
        payment: paymentData,
      };
    });

    return result;
  }
  public async initiatePayment(appointmentId: string, user: IRequestUser) {
    const patientData = await prisma.patient.findUniqueOrThrow({
      where: {
        email: user.email,
      },
    });

    const appointmentData = await prisma.appointment.findUniqueOrThrow({
      where: {
        id: appointmentId,
        patientId: patientData.id,
      },
      include: {
        doctor: true,
        payment: true,
      },
    });

    if (!appointmentData) {
      throw new AppError("Appointment not found", HttpStatus.NOT_FOUND);
    }

    if (!appointmentData.payment) {
      throw new AppError(
        "Payment data not found for this appointment",
        HttpStatus.NOT_FOUND,
      );
    }

    if (appointmentData.payment?.status === PaymentStatus.PAID) {
      throw new AppError(
        "Payment already completed for this appointment",
        HttpStatus.BAD_REQUEST,
      );
    }

    if (appointmentData.status === AppointmentStatus.CANCELED) {
      throw new AppError("Appointment is canceled", HttpStatus.BAD_REQUEST);
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "bdt",
            product_data: {
              name: `Appointment with Dr. ${appointmentData.doctor.name}`,
            },
            unit_amount: appointmentData.doctor.appointmentFee * 100,
          },
          quantity: 1,
        },
      ],
      metadata: {
        appointmentId: appointmentData.id,
        paymentId: appointmentData.payment.id,
      },

      success_url: `${env.FRONTEND_URL}/dashboard/payment/payment-success?appointment_id=${appointmentData.id}&payment_id=${appointmentData.payment.id}`,

      // cancel_url: `${envVars.FRONTEND_URL}/dashboard/payment/payment-failed`,
      cancel_url: `${env.FRONTEND_URL}/dashboard/appointments?error=payment_cancelled`,
    });

    return {
      paymentUrl: session.url,
    };
  }
  public async cancelUnpaidAppointments() {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

    const unpaidAppointments = await prisma.appointment.findMany({
      where: {
        // status: AppointmentStatus.SCHEDULED,
        createdAt: {
          lte: thirtyMinutesAgo,
        },
        paymentStatus: PaymentStatus.UNPAID,
      },
    });

    const appointmentToCancel = unpaidAppointments.map(
      (appointment) => appointment.id,
    );

    await prisma.$transaction(async (tx) => {
      await tx.appointment.updateMany({
        where: {
          id: {
            in: appointmentToCancel,
          },
        },
        data: {
          status: AppointmentStatus.CANCELED,
        },
      });

      await tx.payment.deleteMany({
        where: {
          appointmentId: {
            in: appointmentToCancel,
          },
        },
      });

      for (const unpaidAppointment of unpaidAppointments) {
        await tx.doctorSchedules.update({
          where: {
            doctorId_scheduleId: {
              doctorId: unpaidAppointment.doctorId,
              scheduleId: unpaidAppointment.scheduleId,
            },
          },
          data: {
            isBooked: false,
          },
        });
      }
    });
  }
}

export default AppointmentService;
