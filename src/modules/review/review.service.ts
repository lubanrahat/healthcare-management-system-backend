import { PaymentStatus, UserRole } from "../../generated/prisma/client/enums";
import { prisma } from "../../lib/prisma";
import HttpStatus from "../../shared/constants/http-status";
import AppError from "../../shared/errors/app-error";
import type { IRequestUser } from "../../shared/interfaces/requestUser.interface";
import type {
  ICreateReviewPayload,
  IUpdateReviewPayload,
} from "./review.interface";

class ReviewService {
  public giveReview = async (
    user: IRequestUser,
    payload: ICreateReviewPayload,
  ) => {
    const patientData = await prisma.patient.findUniqueOrThrow({
      where: {
        email: user.email,
      },
    });

    const appointmentData = await prisma.appointment.findUniqueOrThrow({
      where: {
        id: payload.appointmentId,
      },
    });

    if (appointmentData.paymentStatus !== PaymentStatus.PAID) {
      throw new AppError(
        "You can only review after payment is done",
        HttpStatus.BAD_REQUEST,
      );
    }

    if (appointmentData.patientId !== patientData.id) {
      throw new AppError(
        "You can only review for your own appointment",
        HttpStatus.BAD_REQUEST,
      );
    }

    const isReviewed = await prisma.review.findFirst({
      where: {
        appointmentId: payload.appointmentId,
      },
    });

    if (isReviewed) {
      throw new AppError(
        "You have already reviewed for this appointment. You can update your review instead.",
        HttpStatus.BAD_REQUEST,
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const review = await tx.review.create({
        data: {
          ...payload,
          patientId: appointmentData.patientId,
          doctorId: appointmentData.doctorId,
        },
      });

      const averageRating = await tx.review.aggregate({
        where: {
          doctorId: appointmentData.doctorId,
        },
        _avg: {
          rating: true,
        },
      });

      await tx.doctor.update({
        where: {
          id: appointmentData.doctorId,
        },
        data: {
          averageRating: averageRating._avg.rating as number,
        },
      });

      return review;
    });

    return result;
  };
  public getAllReviews = async () => {
    const reviews = await prisma.review.findMany({
      include: {
        doctor: true,
        patient: true,
        appointment: true,
      },
    });

    return reviews;
  };
  public myReviews = async (user: IRequestUser) => {
    const isUserExist = await prisma.user.findUnique({
      where: {
        email: user?.email,
      },
    });
    if (!isUserExist) {
      throw new AppError(
        "Only patients can view their reviews",
        HttpStatus.BAD_REQUEST,
      );
    }

    if (isUserExist.role === UserRole.DOCTOR) {
      const doctorData = await prisma.doctor.findUniqueOrThrow({
        where: {
          email: user?.email,
        },
      });
      return await prisma.review.findMany({
        where: {
          doctorId: doctorData.id,
        },
        include: {
          patient: true,
          appointment: true,
        },
      });
    }

    if (isUserExist.role === UserRole.PATIENT) {
      const patientData = await prisma.patient.findUniqueOrThrow({
        where: {
          email: user?.email,
        },
      });
      return await prisma.review.findMany({
        where: {
          patientId: patientData.id,
        },
        include: {
          doctor: true,
          appointment: true,
        },
      });
    }
  };
  public updateReview = async (
    user: IRequestUser,
    reviewId: string,
    payload: IUpdateReviewPayload,
  ) => {
    const patientData = await prisma.patient.findUniqueOrThrow({
      where: {
        email: user?.email,
      },
    });
    const reviewData = await prisma.review.findUniqueOrThrow({
      where: {
        id: reviewId,
      },
    });
    if (!(patientData.id === reviewData.patientId)) {
      throw new AppError("This is not your review!", HttpStatus.BAD_REQUEST);
    }
    const result = await prisma.$transaction(async (tx) => {
      const updatedReview = await tx.review.update({
        where: {
          id: reviewId,
        },
        data: {
          ...payload,
        },
      });

      const averageRating = await tx.review.aggregate({
        where: {
          doctorId: reviewData.doctorId,
        },
        _avg: {
          rating: true,
        },
      });

      await tx.doctor.update({
        where: {
          id: updatedReview.doctorId,
        },
        data: {
          averageRating: averageRating._avg.rating as number,
        },
      });

      return updatedReview;
    });

    return result;
  };
  public deleteReview = async (user: IRequestUser, reviewId: string) => {
    const patientData = await prisma.patient.findUniqueOrThrow({
      where: {
        email: user?.email,
      },
    });
    const reviewData = await prisma.review.findUniqueOrThrow({
      where: {
        id: reviewId,
      },
    });
    if (!(patientData.id === reviewData.patientId)) {
      throw new AppError("This is not your review!", HttpStatus.BAD_REQUEST);
    }

    const result = await prisma.$transaction(async (tx) => {
      const deletedReview = await tx.review.delete({
        where: {
          id: reviewId,
        },
      });

      const averageRating = await tx.review.aggregate({
        where: {
          doctorId: deletedReview.doctorId,
        },
        _avg: {
          rating: true,
        },
      });

      await tx.doctor.update({
        where: {
          id: deletedReview.doctorId,
        },
        data: {
          averageRating: averageRating._avg.rating as number,
        },
      });
      return deletedReview;
    });

    return result;
  };
}

export default ReviewService;
