import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  PORT: z.coerce.number().default(8080),
});

export type Env = z.infer<typeof envSchema>;

function createEnv(env: NodeJS.ProcessEnv): Env {
  const result = envSchema.safeParse(env);

  if (!result.success) {
    console.error("❌ Invalid environment variables:");
    console.error(result.error.format());
    process.exit(1); 
  }

  return result.data;
}

export const env = createEnv(process.env);
