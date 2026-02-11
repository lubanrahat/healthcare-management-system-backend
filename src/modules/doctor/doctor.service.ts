import { UserStatus } from "../../generated/prisma/client/enums";
import { prisma } from "../../lib/prisma";
import HttpStatus from "../../shared/constants/http-status";
import AppError from "../../shared/errors/app-error";
import type { IUpdateDoctorPayload } from "./doctor.interface";

class DoctorService {
  public getAllDoctors = async () => {
    const doctors = await prisma.doctor.findMany({
      where: {
        isDeleted: false,
      },
      include: {
        user: true,
        specialties: {
          include: {
            specialty: true,
          },
        },
      },
    });
    return doctors;
  };

  public getDoctorById = async (id: string) => {
    const doctor = await prisma.doctor.findUnique({
      where: {
        id,
        isDeleted: false,
      },
      include: {
        user: true,
        specialties: {
          include: {
            specialty: true,
          },
        },
        appointments: {
          include: {
            patient: true,
            schedule: true,
            prescription: true,
          },
        },
        doctorSchedules: {
          include: {
            schedule: true,
          },
        },
        reviews: true,
      },
    });
    return doctor;
  };

  public updateDoctor = async (id: string, payload: IUpdateDoctorPayload) => {
    const isDoctorExist = await prisma.doctor.findUnique({
      where: {
        id,
      },
    });

    if (!isDoctorExist) {
      throw new AppError("Doctor not found", HttpStatus.NOT_FOUND);
    }

    const { doctor: doctorData, specialties } = payload;

    if (specialties && specialties.length > 0) {
      const specialtyIds = specialties.map((s) => s.specialtyId);
      const output = await prisma.specialty.findMany({
        where: {
          id: {
            in: specialtyIds,
          },
        },
      });

      if (output.length !== specialtyIds.length) {
        throw new AppError("Some specialties not found", HttpStatus.NOT_FOUND);
      }
    }

    await prisma.$transaction(async (tx) => {
      if (doctorData) {
        await tx.doctor.update({
          where: {
            id,
          },
          data: {
            ...doctorData,
          },
        });
      }

      if (specialties && specialties.length > 0) {
        for (const specialty of specialties) {
          const { specialtyId, shouldDelete } = specialty;
          if (shouldDelete) {
            await tx.doctorSpecialty.delete({
              where: {
                doctorId_specialtyId: {
                  doctorId: id,
                  specialtyId,
                },
              },
            });
          } else {
            await tx.doctorSpecialty.upsert({
              where: {
                doctorId_specialtyId: {
                  doctorId: id,
                  specialtyId,
                },
              },
              create: {
                doctorId: id,
                specialtyId,
              },
              update: {},
            });
          }
        }
      }
    });

    const doctor = await this.getDoctorById(id);

    return doctor;
  };

  public deleteDoctor = async (id: string) => {
    const isDoctorExist = await prisma.doctor.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!isDoctorExist) {
      throw new AppError("Doctor not found", HttpStatus.NOT_FOUND);
    }

    await prisma.$transaction(async (tx) => {
      await tx.doctor.update({
        where: { id },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
        },
      });

      await tx.user.update({
        where: { id: isDoctorExist.userId },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
          status: UserStatus.DELETED,
        },
      });

      await tx.session.deleteMany({
        where: { userId: isDoctorExist.userId },
      });

      await tx.doctorSpecialty.deleteMany({
        where: { doctorId: id },
      });
    });

    return { message: "Doctor deleted successfully" };
  };
}

export default DoctorService;
