import { z } from "zod";

export const createTranscriptionV2BodySchema = z.object({
  url: z.url({ message: "The url must be a valid URL" }),
});

export const transcriptionV2Schema = z.object({
  id: z.string(),
  video_url: z.string(),
  video_id: z.string(),
  content: z.string(),
  created_by: z.string(),
  created_at: z.date(),
  updated_at: z.date(),
});

export const createTranscriptionV2ResponseSchema = transcriptionV2Schema;

export const listTranscriptionsV2ResponseSchema = z.object({
  transcriptions: z.array(transcriptionV2Schema),
});

export const validationErrorSchema = z.object({
  message: z.string(),
  issues: z.array(z.unknown()).optional(),
});

export const internalServerErrorSchema = z.object({
  message: z.string(),
  details: z.string(),
});

export const createTranscriptionV2Schema = {
  tags: ["transcription"],
  summary: "Create a video transcription V2",
  description:
    "Sends a video URL and registers a transcription for it. Returns the created transcription record.",
  body: createTranscriptionV2BodySchema,
  response: {
    201: createTranscriptionV2ResponseSchema,
    400: validationErrorSchema,
    500: internalServerErrorSchema,
  },
};

export const listTranscriptionsV2Schema = {
  tags: ["transcription"],
  summary: "List transcriptions V2",
  description: "Returns all the transcriptions registered in the application.",
  response: {
    200: listTranscriptionsV2ResponseSchema,
    500: internalServerErrorSchema,
  },
};
