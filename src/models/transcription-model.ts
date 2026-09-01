import { desc, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "../db/connection.ts";
import { transcription } from "../db/schema.ts";
import {
  type CreateTranscriptionDataV1,
  type Transcription,
  type TranscriptionV1,
  type TranscriptionV2,
} from "../types/transcription.ts";

export async function fetchTranscriptionV1(): Promise<TranscriptionV1[]> {
  return db
    .select({
      id: transcription.id,
      youtube_url: transcription.youtube_url,
      youtube_id: transcription.youtube_id,
      content: transcription.content,
      created_by: transcription.created_by,
      created_at: transcription.created_at,
      updated_at: transcription.updated_at,
    })
    .from(transcription)
    .orderBy(desc(transcription.created_at));
}

export async function fetchTranscriptionV2(): Promise<TranscriptionV2[]> {
  return db
    .select({
      id: transcription.id,
      video_url: transcription.video_url,
      video_id: transcription.video_id,
      content: transcription.content,
      created_by: transcription.created_by,
      created_at: transcription.created_at,
      updated_at: transcription.updated_at,
    })
    .from(transcription)
    .orderBy(desc(transcription.created_at));
}

export async function getTranscriptionV1ById(
  id: string,
): Promise<TranscriptionV1 | null> {
  const [row] = await db
    .select({
      id: transcription.id,
      youtube_url: transcription.youtube_url,
      youtube_id: transcription.youtube_id,
      content: transcription.content,
      created_by: transcription.created_by,
      created_at: transcription.created_at,
      updated_at: transcription.updated_at,
    })
    .from(transcription)
    .where(eq(transcription.id, id));

  return row ?? null;
}

export async function getTranscriptionV2ById(
  id: string,
): Promise<TranscriptionV2 | null> {
  const [row] = await db
    .select({
      id: transcription.id,
      video_url: transcription.video_url,
      video_id: transcription.video_id,
      content: transcription.content,
      created_by: transcription.created_by,
      created_at: transcription.created_at,
      updated_at: transcription.updated_at,
    })
    .from(transcription)
    .where(eq(transcription.id, id));

  return row ?? null;
}

export async function createTranscription(
  data: CreateTranscriptionDataV1,
): Promise<Transcription> {
  const [row] = await db
    .insert(transcription)
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
