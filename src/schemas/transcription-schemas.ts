import { z } from "zod";
import { errorSchema } from "./error-schemas.ts";

export const transcriptionParamsSchema = z.object({
  id: z.nanoid(),
});

export const transcriptionSchema = z.object({
  id: z.string(),
  videoId: z.string(),
  content: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
});

export const getTranscriptionResponseSchema = z.object({
  transcription: transcriptionSchema,
});

export const createTranscriptionResponseSchema = z.object({
  transcription: transcriptionSchema,
});

export const getTranscriptionSchema = {
  tags: ["transcription"],
  summary: "Get a video transcription",
  description: "Returns the active transcription for a video.",
  params: transcriptionParamsSchema,
  response: {
    200: getTranscriptionResponseSchema,
    400: errorSchema,
    404: errorSchema,
    500: errorSchema,
  },
};

export const createTranscriptionSchema = {
  tags: ["transcription"],
  summary: "Create a video transcription",
  description:
    "Fetches the YouTube transcript for a video and stores it. Returns 409 if a transcription already exists.",
  params: transcriptionParamsSchema,
  response: {
    201: createTranscriptionResponseSchema,
    400: errorSchema,
    404: errorSchema,
    409: errorSchema,
    500: errorSchema,
  },
};

export const deleteTranscriptionSchema = {
  tags: ["transcription"],
  summary: "Delete a video transcription",
  description: "Soft-deletes the transcription for a video.",
  params: transcriptionParamsSchema,
  response: {
    204: z.undefined(),
    400: errorSchema,
    404: errorSchema,
    500: errorSchema,
  },
};
