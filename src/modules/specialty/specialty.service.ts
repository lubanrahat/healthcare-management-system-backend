import { prisma } from "../../lib/prisma";
import type { CreateSpecialtyInput } from "./specialty.validation";

class SpecialtyService {
  public createSpecialty = async (payload: CreateSpecialtyInput) => {
    const specialty = await prisma.specialty.create({
      data: payload,
    });

    return specialty;
  };
  public getAllSpecialties = async () => {
    const specialties = await prisma.specialty.findMany();
    return specialties;
  };
}

export default SpecialtyService;
