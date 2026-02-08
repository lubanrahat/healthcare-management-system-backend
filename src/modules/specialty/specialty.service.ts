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

  public getSpecialty = async (id: string) => {
    const specialty = await prisma.specialty.findUnique({
      where: {
        id,
      },
    });
    return specialty;
  };
  
  public deleteSpecialty = async (id: string) => {
    const specialty = await prisma.specialty.delete({
      where: {
        id,
      },
    });
    return specialty;
  };

  public updateSpecialty = async (
    id: string,
    payload: CreateSpecialtyInput,
  ) => {
    const specialty = await prisma.specialty.update({
      where: {
        id,
      },
      data: payload,
    });
    return specialty;
  };
}

export default SpecialtyService;
