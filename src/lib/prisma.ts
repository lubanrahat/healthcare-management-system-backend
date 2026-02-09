import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client/client";
import { Pool } from "pg";
import { logger } from "../shared/logger/logger";

const connectionString = `${process.env.DATABASE_URL}`;

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

pool.on("connect", () => {
  logger.info("Database connected successfully");
});

pool.on("error", (err) => {
  logger.error("Database connection error", err);
});

export { prisma };
