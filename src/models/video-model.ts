import { desc, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "../db/connection.ts";
import { video } from "../db/schema.ts";
import {
  type CreateVideoData,
  type Video,
} from "../types/video.ts";

export async function fetchVideo(): Promise<Video[]> {
  return db
    .select()
    .from(video)
    .orderBy(desc(video.created_at));
}

export async function getVideoById(
  id: string,
): Promise<Video | null> {
  const [row] = await db
    .select()
    .from(video)
    .where(eq(video.id, id));

  return row ?? null;
}

export async function createVideo(
  data: CreateVideoData,
): Promise<Video> {
  const [row] = await db
    .insert(video)
    .values({
      id: nanoid(),
      video_url: data.video_url,
      video_id: data.video_id,
      content: data.content,
      created_by: data.created_by,
    })
    .returning();

  return row;
}