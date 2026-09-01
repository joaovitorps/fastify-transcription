import { desc, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "../db/connection.ts";
import { video } from "../db/schema.ts";
import {
  type CreateVideoDataV1,
  type Video,
  type VideoV1,
  type VideoV2,
} from "../types/video.ts";

export async function fetchVideoV1(): Promise<VideoV1[]> {
  return db
    .select({
      id: video.id,
      youtube_url: video.youtube_url,
      youtube_id: video.youtube_id,
      content: video.content,
      created_by: video.created_by,
      created_at: video.created_at,
      updated_at: video.updated_at,
    })
    .from(video)
    .orderBy(desc(video.created_at));
}

export async function fetchVideoV2(): Promise<VideoV2[]> {
  return db
    .select({
      id: video.id,
      video_url: video.video_url,
      video_id: video.video_id,
      content: video.content,
      created_by: video.created_by,
      created_at: video.created_at,
      updated_at: video.updated_at,
    })
    .from(video)
    .orderBy(desc(video.created_at));
}

export async function getVideoV1ById(
  id: string,
): Promise<VideoV1 | null> {
  const [row] = await db
    .select({
      id: video.id,
      youtube_url: video.youtube_url,
      youtube_id: video.youtube_id,
      content: video.content,
      created_by: video.created_by,
      created_at: video.created_at,
      updated_at: video.updated_at,
    })
    .from(video)
    .where(eq(video.id, id));

  return row ?? null;
}

export async function getVideoV2ById(
  id: string,
): Promise<VideoV2 | null> {
  const [row] = await db
    .select({
      id: video.id,
      video_url: video.video_url,
      video_id: video.video_id,
      content: video.content,
      created_by: video.created_by,
      created_at: video.created_at,
      updated_at: video.updated_at,
    })
    .from(video)
    .where(eq(video.id, id));

  return row ?? null;
}

export async function createVideo(
  data: CreateVideoDataV1,
): Promise<Video> {
  const [row] = await db
    .insert(video)
    .values({
      id: nanoid(),
      youtube_url: data.youtube_url,
      youtube_id: data.youtube_id,
      video_url: data.youtube_url,
      video_id: data.youtube_id,
      content: data.content,
      created_by: data.created_by,
    })
    .returning();

  return row;
}
