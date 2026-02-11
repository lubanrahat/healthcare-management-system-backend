import { UserStatus } from "../../generated/prisma/client/enums";
import { prisma } from "../../lib/prisma";
import HttpStatus from "../../shared/constants/http-status";
import AppError from "../../shared/errors/app-error";
import type { IUpdateAdminPayload } from "./admin.interface";

class AdminService {
  public getAllAdmins = async () => {
    const admins = await prisma.admin.findMany({
      include: {
        user: true,
      },
    });
    return admins;
  };

  public getAdminById = async (id: string) => {
    const admin = await prisma.admin.findUnique({
      where: {
        id,
      },
      include: {
        user: true,
      },
    });
    return admin;
  };

  public updateAdmin = async (id: string, payload: IUpdateAdminPayload) => {
    const isAdminExist = await prisma.admin.findUnique({
      where: {
        id,
      },
    });

    if (!isAdminExist) {
      throw new AppError("Admin not found", HttpStatus.NOT_FOUND);
    }

    const { admin } = payload;

    const updatedAdmin = await prisma.admin.update({
      where: {
        id,
      },
      data: {
        ...admin,
      },
    });

    return updatedAdmin;
  };

  public deleteAdmin = async (id: string, requestedByUserId: string) => {
    const isAdminExist = await prisma.admin.findUnique({
      where: {
        id,
      },
    });

    if (!isAdminExist) {
      throw new AppError("Admin not found", HttpStatus.NOT_FOUND);
    }

    if (isAdminExist.userId === requestedByUserId) {
      throw new AppError("Cannot delete yourself", HttpStatus.BAD_REQUEST);
    }

    const result = await prisma.$transaction(async (tx) => {
      await tx.admin.update({
        where: { id },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
        },
      });

      await tx.user.update({
        where: { id: isAdminExist.userId },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
          status: UserStatus.DELETED,
        },
      });

      await tx.session.deleteMany({
        where: { userId: isAdminExist.userId },
      });

      await tx.account.deleteMany({
        where: { userId: isAdminExist.userId },
      });

      const admin = await this.getAdminById(id);

      return admin;
    });

    return result;
  };
}

export default AdminService;
