import { desc } from 'drizzle-orm';
import { db } from '../db/connection.ts';
import { transcription } from '../db/schema.ts';
import { type CreateTranscriptionData, type Transcription } from '../types/transcription.ts';

export async function createTranscription(
  data: CreateTranscriptionData,
): Promise<Transcription> {
  const [row] = await db
    .insert(transcription)
    .values({
      id: data.id,
      youtube_url: data.youtube_url,
      youtube_id: data.youtube_id,
      content: data.content,
      created_by: data.created_by,
    })
    .returning();

  return row;
}

export async function fetchTranscription(): Promise<Transcription[]> {
  return db
    .select()
    .from(transcription)
    .orderBy(desc(transcription.created_at));
}
