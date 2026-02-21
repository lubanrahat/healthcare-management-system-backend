import { uploadFileToCloudinary } from "../../config/cloudinary.config";
import { UserRole } from "../../generated/prisma/client/enums";
import { prisma } from "../../lib/prisma";
import HttpStatus from "../../shared/constants/http-status";
import AppError from "../../shared/errors/app-error";
import type { IRequestUser } from "../../shared/interfaces/requestUser.interface";
import { prescriptionMailgenContent, sendEmail } from "../../shared/utils/mail";
import type { ICreatePrescriptionPayload } from "./prescription.interface";
import { generatePrescriptionPDF } from "./prescription.utils";

class PrescriptionService {
  public givePrescription = async (
    user: IRequestUser,
    payload: ICreatePrescriptionPayload,
  ) => {
    const doctorData = await prisma.doctor.findUniqueOrThrow({
      where: {
        email: user?.email,
      },
    });

    const appointmentData = await prisma.appointment.findUniqueOrThrow({
      where: {
        id: payload.appointmentId,
      },
      include: {
        patient: true,
        doctor: {
          include: {
            specialties: true,
          },
        },
        schedule: {
          include: {
            doctorSchedules: true,
          },
        },
      },
    });

    if (appointmentData.doctorId !== doctorData.id) {
      throw new AppError(
        "You can only give prescription for your own appointments",
        HttpStatus.UNAUTHORIZED,
      );
    }

    const isAlreadyPrescribed = await prisma.prescription.findFirst({
      where: {
        appointmentId: payload.appointmentId,
      },
    });

    if (isAlreadyPrescribed) {
      throw new AppError(
        "You have already given prescription for this appointment. You can update the prescription instead.",
        HttpStatus.BAD_REQUEST,
      );
    }

    const followUpDate = new Date(payload.followUpDate);

    const result = await prisma.$transaction(
      async (tx) => {
        const result = await tx.prescription.create({
          data: {
            ...payload,
            followUpDate,
            doctorId: appointmentData.doctorId,
            patientId: appointmentData.patientId,
          },
        });

        const pdfBuffer = await generatePrescriptionPDF({
          doctorName: doctorData.name,
          patientName: appointmentData.patient.name,
          appointmentDate: appointmentData.schedule.startDateTime,
          instructions: payload.instructions,
          followUpDate,
          doctorEmail: doctorData.email,
          patientEmail: appointmentData.patient.email,
          prescriptionId: result.id,
          createdAt: new Date(),
        });

        const fileName = `Prescription-${Date.now()}.pdf`;
        const uploadedFile = await uploadFileToCloudinary(pdfBuffer, fileName);
        const pdfUrl = uploadedFile.secure_url;

        const updatedPrescription = await tx.prescription.update({
          where: {
            id: result.id,
          },
          data: {
            pdfUrl,
          },
        });

        try {
          const patient = appointmentData.patient;
          const doctor = appointmentData.doctor;
          const specializationData = await prisma.doctorSpecialty.findMany({
            where: {
              doctorId: doctor.id,
            },
            include: {
              specialty: true,
            },
          });

          await sendEmail({
            email: patient.email,
            subject: `New Prescription from Dr. ${doctor.name}`,
            mailgenContent: prescriptionMailgenContent({
              patientName: patient.name,
              doctorName: doctor.name,
              specialization: specializationData
                .map((s) => s.specialty.title)
                .join(", "),
              appointmentDate: new Date(
                appointmentData.schedule.startDateTime,
              ).toLocaleString(),
              followUpDate: followUpDate.toLocaleDateString(),
              issuedDate: new Date().toLocaleDateString(),
              prescriptionId: result.id,
            }),
            attachments: [
              {
                filename: fileName,
                content: pdfBuffer,
                contentType: "application/pdf",
              },
            ],
          });
        } catch (error) {
          console.log(
            "Failed To send email notification for prescription",
            error,
          );
        }

        return updatedPrescription;
      },
      {
        maxWait: 15000,
        timeout: 20000,
      },
    );

    return result;
  };
  public myPrescriptions = async (user: IRequestUser) => {
    const isUserExists = await prisma.user.findUnique({
      where: {
        email: user?.email,
      },
    });

    if (!isUserExists) {
      throw new AppError("User not found", HttpStatus.NOT_FOUND);
    }

    if (isUserExists.role === UserRole.DOCTOR) {
      const prescriptions = await prisma.prescription.findMany({
        where: {
          doctor: {
            email: user?.email,
          },
        },
        include: {
          patient: true,
          doctor: true,
          appointment: true,
        },
      });
      return prescriptions;
    }

    if (isUserExists.role === UserRole.PATIENT) {
      const prescriptions = await prisma.prescription.findMany({
        where: {
          patient: {
            email: user?.email,
          },
        },
        include: {
          patient: true,
          doctor: true,
          appointment: true,
        },
      });
      return prescriptions;
    }
  };
  public getAllPrescriptions = async () => {
    const result = await prisma.prescription.findMany({
      include: {
        patient: true,
        doctor: true,
        appointment: true,
      },
    });

    return result;
  };
}

export default PrescriptionService;
