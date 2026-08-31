import { pool } from '../db/connection.ts';
import { type CreateTranscriptionData, type Transcription } from '../types/transcription.ts';

export async function createTranscription(
  data: CreateTranscriptionData,
): Promise<Transcription> {
  const result = await pool.query<Transcription>(
    `INSERT INTO transcription (id, youtube_url, youtube_id, content, created_by)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [data.id, data.youtube_url, data.youtube_id, data.content, data.created_by],
  );

  return result.rows[0];
}

export async function fetchTranscription(): Promise<Transcription[]> {
  const result = await pool.query<Transcription>(
    `SELECT * FROM transcription ORDER BY created_at DESC`,
  );

  return result.rows;
}
