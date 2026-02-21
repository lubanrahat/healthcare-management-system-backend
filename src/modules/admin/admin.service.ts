import { UserRole, UserStatus } from "../../generated/prisma/client/enums";
import { prisma } from "../../lib/prisma";
import HttpStatus from "../../shared/constants/http-status";
import AppError from "../../shared/errors/app-error";
import type { IRequestUser } from "../../shared/interfaces/requestUser.interface";
import type {
  IChangeUserStatusPayload,
  IUpdateAdminPayload,
} from "./admin.interface";

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
  public changeUserStatus = async (
    user: IRequestUser,
    payload: IChangeUserStatusPayload,
  ) => {
    const isAdminExists = await prisma.admin.findUniqueOrThrow({
      where: {
        email: user.email,
      },
      include: {
        user: true,
      },
    });

    const { userId, userStatus } = payload;

    const userToChangeStatus = await prisma.user.findUniqueOrThrow({
      where: {
        id: userId,
      },
    });

    const selfStatusChange = isAdminExists.userId === userId;

    if (selfStatusChange) {
      throw new AppError(
        "You cannot change your own status",
        HttpStatus.BAD_REQUEST,
      );
    }

    if (
      isAdminExists.user.role === UserRole.ADMIN &&
      userToChangeStatus.role === UserRole.SUPER_ADMIN
    ) {
      throw new AppError(
        "You cannot change the status of super admin. Only super admin can change the status of another super admin",
        HttpStatus.BAD_REQUEST,
      );
    }

    if (
      isAdminExists.user.role === UserRole.ADMIN &&
      userToChangeStatus.role === UserRole.ADMIN
    ) {
      throw new AppError(
        "You cannot change the status of another admin. Only super admin can change the status of another admin",
        HttpStatus.BAD_REQUEST,
      );
    }

    if (userStatus === UserStatus.DELETED) {
      throw new AppError(
        "You cannot set user status to deleted. To delete a user, you have to use role specific delete api. For example, to delete an doctor user, you have to use delete doctor api which will set the user status to deleted and also set isDeleted to true and also delete the user session and account",
        HttpStatus.BAD_REQUEST,
      );
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        status: userStatus,
      },
    });

    return updatedUser;
  };
}

export default AdminService;
