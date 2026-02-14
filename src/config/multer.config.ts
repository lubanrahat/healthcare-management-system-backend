import { CloudinaryStorage } from "multer-storage-cloudinary";
import { cloudinaryUpload } from "./cloudinary.config";
import multer from "multer";
import type { Request } from "express";

const storage = new CloudinaryStorage({
  cloudinary: cloudinaryUpload,
  params: async (req: Request, file: Express.Multer.File) => {
    const originalName = file.originalname.split(".").slice(0, -1).join(".");
    const extension = file.originalname.split(".").pop()?.toLowerCase() || "";
    const fileNameWithoutExtension = originalName
      .split(".")
      .slice(0, -1)
      .join(".")
      .toLowerCase()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_]/g, "");
    const uniqueName =
      Math.random().toString(36).substring(2, 8) +
      "_" +
      Date.now() +
      "_" +
      fileNameWithoutExtension;
    const folder = extension === "pdf" ? "documents" : "images";
    return {
      folder: `healthcare/${folder}`,
      public_id: uniqueName,
      resource_type: "auto",
    };
  },
});

export const multerUploder = multer({ storage: storage });
