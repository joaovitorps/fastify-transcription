import { Client } from "pg";
import { closeDatabase, runMigrations } from "./test-utils.ts";

export async function globalSetup() {
  console.log("Global setup executed");

  const connection = new Client({
    connectionString: "postgresql://root:root@localhost:5432/postgres",
  });
  await connection.connect();
  try {
    await connection.query(`CREATE DATABASE ai_social_media_test`);
  } catch (error) {
    // 42P04 = duplicate_database
    if (error.code !== "42P04") {
      console.error("Error creating test database:", error);

      throw error;
    }
  } finally {
    await runMigrations();
    await connection.end();
  }
}

export async function globalTeardown() {
  console.log("Global teardown executed");
  await closeDatabase();
}