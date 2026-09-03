import dotenv from "dotenv";
import { defineConfig } from "drizzle-kit";

const envFile =
  process.env.NODE_ENV === "test"
    ? ".env.local.e2e"
    : [".env.development.local", ".env.local", ".env"];
dotenv.config({ path: envFile });

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
