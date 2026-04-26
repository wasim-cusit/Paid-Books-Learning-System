import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().default("postgresql://postgres:postgres@localhost:5432/pbls"),
  JWT_ACCESS_SECRET: z.string().min(16).default("change-me-access-secret"),
  JWT_REFRESH_SECRET: z.string().min(16).default("change-me-refresh-secret"),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("30d")
});

export const env = schema.parse(process.env);
