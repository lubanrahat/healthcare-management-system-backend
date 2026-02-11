import { UserRole } from "../../generated/prisma/client/enums";
import type { Specialty } from "../../generated/prisma/client/client";
import type {
  ICreateAdminPayload,
  ICreateDoctorPayload,
} from "./user.interface";
import { prisma } from "../../lib/prisma";
import HttpStatus from "../../shared/constants/http-status";
import AppError from "../../shared/errors/app-error";
import { auth } from "../../lib/auth";
import { logger } from "../../shared/logger/logger";

class UserService {
  public createDoctor = async (payload: ICreateDoctorPayload) => {
    const specialties: Specialty[] = [];

    for (const specialtyId of payload.specialties) {
      const specialty = await prisma.specialty.findUnique({
        where: {
          id: specialtyId,
        },
      });
      if (!specialty) {
        throw new AppError("Specialty not found", HttpStatus.NOT_FOUND);
      }
      specialties.push(specialty);
    }

    const userExists = await prisma.user.findUnique({
      where: {
        email: payload.doctor.email,
      },
    });

    if (userExists) {
      throw new AppError(
        "User with this email already exists",
        HttpStatus.CONFLICT,
      );
    }

    const userData = await auth.api.signUpEmail({
      body: {
        email: payload.doctor.email,
        password: payload.password,
        role: UserRole.DOCTOR,
        name: payload.doctor.name,
        needPasswordChange: true,
      },
    });

    try {
      const result = await prisma.$transaction(async (tx) => {
        const doctorData = await tx.doctor.create({
          data: {
            userId: userData.user.id,
            ...payload.doctor,
          },
        });

        const doctorSpecialtyData = specialties.map((specialty) => {
          return {
            doctorId: doctorData.id,
            specialtyId: specialty.id,
          };
        });

        await tx.doctorSpecialty.createMany({
          data: doctorSpecialtyData,
        });

        const doctor = await tx.doctor.findUnique({
          where: {
            id: doctorData.id,
          },
          select: {
            id: true,
            userId: true,
            name: true,
            email: true,
            profilePhoto: true,
            contactNumber: true,
            address: true,
            registrationNumber: true,
            experience: true,
            gender: true,
            appointmentFee: true,
            qualification: true,
            currentWorkingPlace: true,
            designation: true,
            createdAt: true,
            updatedAt: true,
            user: {
              select: {
                id: true,
                email: true,
                name: true,
                role: true,
                status: true,
                emailVerified: true,
                image: true,
                isDeleted: true,
                deletedAt: true,
                createdAt: true,
                updatedAt: true,
              },
            },
            specialties: {
              select: {
                specialty: {
                  select: {
                    title: true,
                    id: true,
                  },
                },
              },
            },
          },
        });

        return doctor;
      });

      return result;
    } catch (error) {
      logger.error("Failed to create doctor", error);
      try {
        await prisma.user.delete({
          where: {
            id: userData.user.id,
          },
        });
      } catch (error) {
        logger.error("Failed to delete user", error);
      }
      throw new AppError(
        "Failed to create doctor",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  };

  public createAdmin = async (payload: ICreateAdminPayload) => {
    const userExists = await prisma.user.findUnique({
      where: {
        email: payload.admin.email,
      },
    });

    if (userExists) {
      throw new AppError(
        "User with this email already exists",
        HttpStatus.CONFLICT,
      );
    }

    const { admin, role, password } = payload;

    const userData = await auth.api.signUpEmail({
      body: {
        ...admin,
        password,
        role,
        needPasswordChange: true,
      },
    });

    try {
      const adminData = await prisma.admin.create({
        data: {
          userId: userData.user.id,
          ...admin,
        },
      });

      return adminData;
    } catch (error: any) {
      console.log("Error creating admin: ", error);
      await prisma.user.delete({
        where: {
          id: userData.user.id,
        },
      });
      throw error;
    }
  };
}

export default UserService;
