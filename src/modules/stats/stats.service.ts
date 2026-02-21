import { PaymentStatus, UserRole } from "../../generated/prisma/client/enums";
import { prisma } from "../../lib/prisma";
import HttpStatus from "../../shared/constants/http-status";
import AppError from "../../shared/errors/app-error";
import type { IRequestUser } from "../../shared/interfaces/requestUser.interface";

class StatsService {
  public getDashboardStatsData = async (user: IRequestUser) => {
    const getSuperAdminStatsData = async () => {
      const appointmentCount = await prisma.appointment.count();
      const doctorCount = await prisma.doctor.count();
      const patientCount = await prisma.patient.count();
      const superAdminCount = await prisma.admin.count({
        where: {
          user: {
            role: UserRole.SUPER_ADMIN,
          },
        },
      });
      const adminCount = await prisma.admin.count();
      const paymentCount = await prisma.payment.count();
      const userCount = await prisma.user.count();

      const totalRevenue = await prisma.payment.aggregate({
        _sum: { amount: true },
        where: {
          status: PaymentStatus.PAID,
        },
      });

      const pieChartData = await getPieChartData();
      const barChartData = await getBarChartData();

      return {
        appointmentCount,
        doctorCount,
        patientCount,
        superAdminCount,
        adminCount,
        paymentCount,
        userCount,
        totalRevenue: totalRevenue._sum.amount || 0,
        pieChartData,
        barChartData,
      };
    };

    const getAdminStatsData = async () => {
      const appointmentCount = await prisma.appointment.count();
      const doctorCount = await prisma.doctor.count();
      const patientCount = await prisma.patient.count();
      const paymentCount = await prisma.payment.count();
      const userCount = await prisma.user.count();
      const adminCount = await prisma.admin.count();

      const totalRevenue = await prisma.payment.aggregate({
        _sum: { amount: true },
        where: {
          status: PaymentStatus.PAID,
        },
      });

      const pieChartData = await getPieChartData();
      const barChartData = await getBarChartData();

      return {
        appointmentCount,
        doctorCount,
        patientCount,
        paymentCount,
        userCount,
        adminCount,
        totalRevenue: totalRevenue._sum.amount || 0,
        pieChartData,
        barChartData,
      };
    };

    const getDoctorStatsData = async (user: IRequestUser) => {
      const doctorData = await prisma.doctor.findUniqueOrThrow({
        where: {
          email: user.email,
        },
      });

      const reviewCount = await prisma.review.count({
        where: {
          doctorId: doctorData.id,
        },
      });

      const patientCount = await prisma.appointment.groupBy({
        by: ["patientId"],
        _count: {
          id: true,
        },
        where: {
          doctorId: doctorData.id,
        },
      });

      // const formattedPatientCount = patientCount.map(({_count, patientId}) => ({
      //     patientId,
      //     count: _count.id
      // }));

      const appointmentCount = await prisma.appointment.count({
        where: {
          doctorId: doctorData.id,
        },
      });

      const totalRevenue = await prisma.payment.aggregate({
        _sum: { amount: true },
        where: {
          appointment: {
            doctorId: doctorData.id,
          },
          status: PaymentStatus.PAID,
        },
      });

      const appointmentStatusDistribution = await prisma.appointment.groupBy({
        by: ["status"],
        _count: {
          id: true,
        },
        where: {
          doctorId: doctorData.id,
        },
      });

      const formattedAppointmentStatusDistribution =
        appointmentStatusDistribution.map(({ _count, status }) => ({
          status,
          count: _count.id,
        }));

      return {
        reviewCount,
        patientCount: patientCount.length,
        appointmentCount,
        totalRevenue: totalRevenue._sum.amount || 0,
        appointmentStatusDistribution: formattedAppointmentStatusDistribution,
      };
    };

    const getPatientStatsData = async (user: IRequestUser) => {
      const patientData = await prisma.patient.findUniqueOrThrow({
        where: {
          email: user.email,
        },
      });

      const appointmentCount = await prisma.appointment.count({
        where: {
          patientId: patientData.id,
        },
      });

      const reviewCount = await prisma.review.count({
        where: {
          patientId: patientData.id,
        },
      });

      const appointmentStatusDistribution = await prisma.appointment.groupBy({
        by: ["status"],
        _count: {
          id: true,
        },
        where: {
          patientId: patientData.id,
        },
      });

      const formattedAppointmentStatusDistribution =
        appointmentStatusDistribution.map(({ _count, status }) => ({
          status,
          count: _count.id,
        }));

      return {
        appointmentCount,
        reviewCount,
        appointmentStatusDistribution: formattedAppointmentStatusDistribution,
      };
    };

    const getPieChartData = async () => {
      const appointmentStatusDistribution = await prisma.appointment.groupBy({
        by: ["status"],
        _count: {
          id: true,
        },
      });

      const formattedAppointmentStatusDistribution =
        appointmentStatusDistribution.map(({ _count, status }) => ({
          status,
          count: _count.id,
        }));

      return formattedAppointmentStatusDistribution;
    };

    const getBarChartData = async () => {
      interface AppointmentCountByMonth {
        month: Date;
        count: bigint;
      }
      const appointmentCountByMonth: AppointmentCountByMonth[] =
        await prisma.$queryRaw`
        SELECT DATE_TRUNC('month', "createdAt") AS month,
        CAST(COUNT(*) AS INTEGER) AS count
        FROM "appointments"
        GROUP BY month
        ORDER BY month ASC;
    `;

      return appointmentCountByMonth;
    };

    let statsData;

    switch (user.role) {
      case UserRole.SUPER_ADMIN:
        statsData = getSuperAdminStatsData();
        break;
      case UserRole.ADMIN:
        statsData = getAdminStatsData();
        break;
      case UserRole.DOCTOR:
        statsData = getDoctorStatsData(user);
        break;
      case UserRole.PATIENT:
        statsData = getPatientStatsData(user);
        break;
      default:
        throw new AppError("User role not found", HttpStatus.NOT_FOUND);
    }

    return statsData;
  };
}
export default StatsService;
