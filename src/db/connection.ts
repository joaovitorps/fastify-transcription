import { configDotenv } from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";

const envFile =
  process.env.NODE_ENV === "test"
    ? ".env.local.e2e"
    : [".env.development.local", ".env.local", ".env"];

configDotenv({ path: envFile });

export const db = drizzle({
  connection: {
    connectionString: process.env.DATABASE_URL!,
  },
});
