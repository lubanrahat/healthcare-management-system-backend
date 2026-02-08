import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.string(),
});

function createEnv(env: NodeJS.ProcessEnv) {
  const validationResult = envSchema.safeParse(env);

  if (validationResult.success) {
    return validationResult.data;
  } else {
    throw new Error(validationResult.error.message);
  }
}

export const env = createEnv(process.env);
