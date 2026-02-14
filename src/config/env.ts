import { z } from "zod";
import { logger } from "../shared/logger/logger";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  PORT: z.coerce.number().default(8080),
  DATABASE_URL: z.string(),
  ACCESS_TOKEN_SECRET: z.string(),
  REFRESH_TOKEN_SECRET: z.string(),
  ACCESS_TOKEN_EXPIRATION: z.string(),
  REFRESH_TOKEN_EXPIRATION: z.string(),
  BETTER_AUTH_SESSION_TOKEN_UPDATE_AGE: z.string(),
  BETTER_AUTH_SESSION_TOKEN_EXPIRATION: z.string(),
  MAILTRAP_HOST: z.string(),
  MAILTRAP_PORT: z.coerce.number(),
  MAILTRAP_USER: z.string(),
  MAILTRAP_PASS: z.string(),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  BETTER_AUTH_URL: z.string(),
  BETTER_AUTH_SECRET: z.string(),
  FRONTEND_URL: z.string().url(),
  CLOUDINARY_CLOUD_NAME: z.string(),
  CLOUDINARY_API_KEY: z.string(),
  CLOUDINARY_API_SECRET: z.string(),
});

export type Env = z.infer<typeof envSchema>;

function createEnv(env: NodeJS.ProcessEnv): Env {
  const result = envSchema.safeParse(env);

  if (!result.success) {
    logger.error("Environment variable validation failed", {
      errors: result.error.format(),
    });
    process.exit(1);
  }

  return result.data;
}

export const env = createEnv(process.env);
