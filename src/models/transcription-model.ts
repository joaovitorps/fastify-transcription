import { and, eq, isNull } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "../db/connection.ts";
import { videoTranscription } from "../db/schema.ts";
import {
  type CreateTranscriptionData,
  type Transcription,
} from "../types/transcription.ts";

export async function getActiveTranscription(
  videoId: string,
): Promise<Transcription | null> {
  const [row] = await db
    .select()
    .from(videoTranscription)
    .where(
      and(
        eq(videoTranscription.videoId, videoId),
        isNull(videoTranscription.deletedAt),
      ),
    );

  return row ?? null;
}

export async function createTranscription(
  data: CreateTranscriptionData,
): Promise<Transcription> {
  const [row] = await db
    .insert(videoTranscription)
    .values({
      id: nanoid(),
      videoId: data.videoId,
      content: data.content,
    })
    .returning();

  return row;
}

export async function softDeleteTranscription(
  videoId: string,
): Promise<void> {
  await db
    .update(videoTranscription)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(
      and(
        eq(videoTranscription.videoId, videoId),
        isNull(videoTranscription.deletedAt),
      ),
    );
}
