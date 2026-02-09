/*
  Warnings:

  - You are about to drop the column `appoitmentFees` on the `doctor` table. All the data in the column will be lost.
  - You are about to drop the column `currentWorkplace` on the `doctor` table. All the data in the column will be lost.
  - You are about to drop the column `expertise` on the `doctor` table. All the data in the column will be lost.
  - You are about to drop the `doctor_specialty` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `specialty` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `appointmentFee` to the `doctor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `currentWorkingPlace` to the `doctor` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "doctor_specialty" DROP CONSTRAINT "doctor_specialty_doctorId_fkey";

-- DropForeignKey
ALTER TABLE "doctor_specialty" DROP CONSTRAINT "doctor_specialty_specialtyId_fkey";

-- AlterTable
ALTER TABLE "doctor" DROP COLUMN "appoitmentFees",
DROP COLUMN "currentWorkplace",
DROP COLUMN "expertise",
ADD COLUMN     "appointmentFee" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "currentWorkingPlace" TEXT NOT NULL,
ADD COLUMN     "experience" INTEGER NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE "doctor_specialty";

-- DropTable
DROP TABLE "specialty";

-- CreateTable
CREATE TABLE "specialties" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "icon" VARCHAR(255),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "specialties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "doctor_specialties" (
    "id" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "specialtyId" TEXT NOT NULL,

    CONSTRAINT "doctor_specialties_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "specialties_title_key" ON "specialties"("title");

-- CreateIndex
CREATE INDEX "idx_specialty_isDeleted" ON "specialties"("isDeleted");

-- CreateIndex
CREATE INDEX "idx_specialty_title" ON "specialties"("title");

-- CreateIndex
CREATE INDEX "idx_doctor_specialty_doctorId" ON "doctor_specialties"("doctorId");

-- CreateIndex
CREATE INDEX "idx_doctor_specialty_specialtyId" ON "doctor_specialties"("specialtyId");

-- CreateIndex
CREATE UNIQUE INDEX "doctor_specialties_doctorId_specialtyId_key" ON "doctor_specialties"("doctorId", "specialtyId");

-- AddForeignKey
ALTER TABLE "doctor_specialties" ADD CONSTRAINT "doctor_specialties_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "doctor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doctor_specialties" ADD CONSTRAINT "doctor_specialties_specialtyId_fkey" FOREIGN KEY ("specialtyId") REFERENCES "specialties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "Doctor_email_idx" RENAME TO "idx_doctor_email";

-- RenameIndex
ALTER INDEX "Doctor_isDeleted_idx" RENAME TO "idx_doctor_isDeleted";

-- RenameIndex
ALTER INDEX "Patient_email_idx" RENAME TO "idx_patient_email";

-- RenameIndex
ALTER INDEX "Patient_isDeleted_idx" RENAME TO "idx_patient_isDeleted";
