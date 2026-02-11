import type { Gender } from "../../generated/prisma/client/enums";

export interface IUpdateDoctorPayload {
  name?: string;
  profilePhoto?: string;
  contactNumber?: string;
  address?: string;
  experience?: number;
}

export interface IUpdateDoctorSpecialtyPayload {
  specialtyId: string;
  shouldDelete?: boolean;
}
export interface IUpdateDoctorPayload {
  doctor?: {
    name?: string;
    profilePhoto?: string;
    contactNumber?: string;
    address?: string;
    experience?: number;
    registrationNumber?: string;
    gender?: Gender;
    appointmentFee?: number;
    qualification?: string;
    currentWorkingPlace?: string;
    designation?: string;
  };
  specialties?: IUpdateDoctorSpecialtyPayload[];
}
