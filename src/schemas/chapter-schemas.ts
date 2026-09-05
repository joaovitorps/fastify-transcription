import { z } from "zod";
import { errorSchema } from "./error-schemas.ts";

export const chapterParamsSchema = z.object({
  id: z.nanoid(),
});

export const chapterSchema = z.object({
  id: z.string(),
  videoId: z.string(),
  content: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
});

export const getChapterResponseSchema = z.object({
  chapter: chapterSchema,
});

export const createChapterResponseSchema = z.object({
  chapter: chapterSchema,
});

export const getChapterSchema = {
  tags: ["chapter"],
  summary: "Get a video chapter",
  description: "Returns the active chapter for a video.",
  params: chapterParamsSchema,
  response: {
    200: getChapterResponseSchema,
    400: errorSchema,
    404: errorSchema,
    500: errorSchema,
  },
};

export const createChapterSchema = {
  tags: ["chapter"],
  summary: "Create a video chapter",
  description:
    "Fetches the YouTube transcript for a video and stores it. Returns 409 if a chapter already exists.",
  params: chapterParamsSchema,
  response: {
    201: createChapterResponseSchema,
    400: errorSchema,
    404: errorSchema,
    409: errorSchema,
    500: errorSchema,
  },
};

export const deleteChapterSchema = {
  tags: ["chapter"],
  summary: "Delete a video chapter",
  description: "Soft-deletes the chapter for a video.",
  params: chapterParamsSchema,
  response: {
    204: z.undefined(),
    400: errorSchema,
    404: errorSchema,
    500: errorSchema,
  },
};
