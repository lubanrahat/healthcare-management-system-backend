import type {
  DoctorSchedules,
  Prisma,
} from "../../generated/prisma/client/client";
import { prisma } from "../../lib/prisma";
import type { IQueryParams } from "../../shared/interfaces/query.interface";
import type { IRequestUser } from "../../shared/interfaces/requestUser.interface";
import { QueryBuilder } from "../../shared/utils/QueryBuilder";
import {
  doctorScheduleFilterableFields,
  doctorScheduleIncludeConfig,
  doctorScheduleSearchableFields,
} from "./doctorSchedule.constant";
import type {
  ICreateDoctorSchedulePayload,
  IUpdateDoctorSchedulePayload,
} from "./doctorSchedule.interface";

class DoctorScheduleService {
  public async createMyDoctorSchedule(
    user: IRequestUser,
    payload: ICreateDoctorSchedulePayload,
  ) {
    const doctorData = await prisma.doctor.findUniqueOrThrow({
      where: {
        email: user.email,
      },
    });

    const doctorScheduleData = payload.scheduleIds.map((scheduleId) => ({
      doctorId: doctorData.id,
      scheduleId,
    }));

    await prisma.doctorSchedules.createMany({
      data: doctorScheduleData,
    });

    const result = await prisma.doctorSchedules.findMany({
      where: {
        doctorId: doctorData.id,
        scheduleId: {
          in: payload.scheduleIds,
        },
      },
      include: {
        schedule: true,
      },
    });

    return result;
  }

  public async getMyDoctorSchedules(user: IRequestUser, query: IQueryParams) {
    const doctorData = await prisma.doctor.findUniqueOrThrow({
      where: {
        email: user.email,
      },
    });
    const queryBuilder = new QueryBuilder<
      DoctorSchedules,
      Prisma.DoctorSchedulesWhereInput,
      Prisma.DoctorSchedulesInclude
    >(
      prisma.doctorSchedules,
      {
        doctorId: doctorData.id,
        ...query,
      },
      {
        filterableFields: doctorScheduleFilterableFields,
        searchableFields: doctorScheduleSearchableFields,
      },
    );
    const doctorSchedules = await queryBuilder
      .search()
      .filter()
      .paginate()
      .include({
        schedule: true,
        doctor: {
          include: {
            user: true,
          },
        },
      })
      .sort()
      .fields()
      .dynamicInclude(doctorScheduleIncludeConfig)
      .execute();
    return doctorSchedules;
  }

  public async getAllDoctorSchedules(query: IQueryParams) {
    const queryBuilder = new QueryBuilder<
      DoctorSchedules,
      Prisma.DoctorSchedulesWhereInput,
      Prisma.DoctorSchedulesInclude
    >(prisma.doctorSchedules, query, {
      filterableFields: doctorScheduleFilterableFields,
      searchableFields: doctorScheduleSearchableFields,
    });

    const result = await queryBuilder
      .search()
      .filter()
      .paginate()
      .dynamicInclude(doctorScheduleIncludeConfig)
      .sort()
      .execute();

    return result;
  }

  public async getDoctorScheduleById(doctorId: string, scheduleId: string) {
    const doctorSchedule = await prisma.doctorSchedules.findUnique({
      where: {
        doctorId_scheduleId: {
          doctorId: doctorId,
          scheduleId: scheduleId,
        },
      },
      include: {
        schedule: true,
        doctor: true,
      },
    });
    return doctorSchedule;
  }

  public async updateMyDoctorSchedule(
    user: IRequestUser,
    payload: IUpdateDoctorSchedulePayload,
  ) {
    const doctorData = await prisma.doctor.findUniqueOrThrow({
      where: {
        email: user.email,
      },
    });

    const deleteIds = payload.scheduleIds
      .filter((schedule) => schedule.shouldDelete)
      .map((schedule) => schedule.id);

    const createIds = payload.scheduleIds
      .filter((schedule) => !schedule.shouldDelete)
      .map((schedule) => schedule.id);

    const result = await prisma.$transaction(async (tx) => {
      await tx.doctorSchedules.deleteMany({
        where: {
          isBooked: false,
          doctorId: doctorData.id,
          scheduleId: {
            in: deleteIds,
          },
        },
      });

      const doctorScheduleData = createIds.map((scheduleId) => ({
        doctorId: doctorData.id,
        scheduleId,
      }));

      const result = await tx.doctorSchedules.createMany({
        data: doctorScheduleData,
      });

      return result;
    });

    return result;
  }

  public async deleteMyDoctorSchedule(id: string, user: IRequestUser) {
    const doctorData = await prisma.doctor.findUniqueOrThrow({
      where: {
        email: user.email,
      },
    });

    await prisma.doctorSchedules.deleteMany({
      where: {
        isBooked: false,
        doctorId: doctorData.id,
        scheduleId: id,
      },
    });
  }
}
export default DoctorScheduleService;
