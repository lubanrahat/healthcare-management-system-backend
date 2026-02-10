import { prisma } from "../../lib/prisma";

class DoctorService {
  public getAllDoctors = async () => {
    const doctors = await prisma.doctor.findMany({
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
}

export default DoctorService;
