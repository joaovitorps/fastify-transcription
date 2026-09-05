import { and, eq, isNull } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "../db/connection.ts";
import { videoChapter } from "../db/schema.ts";
import type { Chapter, CreateChapterData } from "../types/chapter.ts";

export async function getActiveChapter(
  videoId: string,
): Promise<Chapter | null> {
  const [row] = await db
    .select()
    .from(videoChapter)
    .where(
      and(eq(videoChapter.videoId, videoId), isNull(videoChapter.deletedAt)),
    );

  return row ?? null;
}

export async function createChapter(data: CreateChapterData): Promise<Chapter> {
  const [row] = await db
    .insert(videoChapter)
    .values({
      id: nanoid(),
      videoId: data.videoId,
      content: data.content,
    })
    .returning();

  return row;
}

export async function softDeleteChapter(videoId: string): Promise<void> {
  await db
    .update(videoChapter)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(
      and(eq(videoChapter.videoId, videoId), isNull(videoChapter.deletedAt)),
    );
}
