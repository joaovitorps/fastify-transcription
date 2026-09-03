import { Client } from "pg";
import { runMigrations } from "./test-utils.ts";

const createTestDatabase = async () => {
  const connection = new Client({
    connectionString: "postgresql://root:root@localhost:5432/postgres",
  });
  await connection.connect();
  try {
    await connection.query(`CREATE DATABASE ai_social_media_test`);
  } catch (error) {
    // 42P04 = duplicate_database
    if ((error as { code?: string }).code !== "42P04") {
      console.error("Error creating test database:", error);

      throw error;
    }
  } finally {
    await runMigrations();
    await connection.end();
  }
};

await createTestDatabase();
