import type { UserRole } from "../../generated/prisma/client/enums";

export interface IRequestUser{
    userId : string;
    role : UserRole;
    email : string;
}