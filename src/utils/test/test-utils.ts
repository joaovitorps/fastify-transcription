import { sql } from "drizzle-orm";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db } from "../../db/connection.ts";

export async function resetDatabase(): Promise<void> {
  await db.execute(sql`TRUNCATE TABLE video_transcription CASCADE;`);
  await db.execute(sql`TRUNCATE TABLE video_chapter CASCADE;`);
  await db.execute(sql`TRUNCATE TABLE video CASCADE;`);
}

export async function closeDatabase(): Promise<void> {
  await db.$client.end();
}

export async function runMigrations() {
  await migrate(db, {
    migrationsFolder: "./drizzle",
  });
  console.log("Migrations complete");
}