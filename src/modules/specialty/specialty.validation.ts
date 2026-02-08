import { z } from "zod";

export const createSpecialtySchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z
    .string()
    .min(2, "Description must be at least 2 characters")
    .optional(),
  icon: z
    .string()
    .url("Icon must be a valid URL")
    .max(255, "Icon URL is too long")
    .optional(),
});

export type CreateSpecialtyInput = z.infer<typeof createSpecialtySchema>;
