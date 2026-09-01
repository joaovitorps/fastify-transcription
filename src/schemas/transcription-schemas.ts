import { z } from 'zod';
import { errorSchema } from './error-schemas.ts';

export const createTranscriptionBodySchema = z.object({
  url: z
    .url({ message: 'The url must be a valid URL' }),
});

export const transcriptionSchema = z.object({
  id: z.string(),
  youtube_url: z.string(),
  youtube_id: z.string(),
  content: z.string(),
  created_by: z.string(),
  created_at: z.date(),
  updated_at: z.date(),
});

export const createTranscriptionResponseSchema = transcriptionSchema;

export const listTranscriptionsResponseSchema = z.object({
  transcriptions: z.array(transcriptionSchema),
});

export const createTranscriptionSchema = {
  tags: ['transcription'],
  summary: 'Create a video transcription',
  description:
    'Sends a YouTube URL and registers a transcription for it. Returns the created transcription record.',
  body: createTranscriptionBodySchema,
  response: {
    201: createTranscriptionResponseSchema,
    400: errorSchema,
    409: errorSchema,
    500: errorSchema,
  },
};

export const listTranscriptionsSchema = {
  tags: ['transcription'],
  summary: 'List transcriptions',
  description: 'Returns all the transcriptions registered in the application.',
  response: {
    200: listTranscriptionsResponseSchema,
    500: errorSchema,
  },
};
