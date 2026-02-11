import { prisma } from "../../lib/prisma";

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
}

export default DoctorService;
