import { z } from "zod";
import { errorSchema } from "./error-schemas.ts";

export const createVideoBodySchema = z.object({
  url: z.url({ message: "The url must be a valid URL" }),
});

export const videoSchema = z.object({
  id: z.string(),
  videoUrl: z.string(),
  videoId: z.string(),
  createdBy: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const createVideoResponseSchema = videoSchema;

export const listVideosResponseSchema = z.object({
  videos: z.array(videoSchema),
});

export const getVideoParamsSchema = z.object({
  id: z.nanoid(),
});

export const getVideoResponseSchema = z.object({
  video: videoSchema,
});

export const createVideoSchema = {
  tags: ["video"],
  summary: "Create a video",
  description:
    "Sends a video URL and registers a video for it. Returns the created video record.",
  body: createVideoBodySchema,
  response: {
    201: createVideoResponseSchema,
    400: errorSchema,
    409: errorSchema,
    500: errorSchema,
  },
};

export const listVideosSchema = {
  tags: ["video"],
  summary: "List videos",
  description: "Returns all the videos registered in the application.",
  response: {
    200: listVideosResponseSchema,
    500: errorSchema,
  },
};

export const getVideoSchema = {
  tags: ["video"],
  summary: "Get a video",
  description: "Returns a single video by its ID.",
  params: getVideoParamsSchema,
  response: {
    200: getVideoResponseSchema,
    404: errorSchema,
    500: errorSchema,
  },
};
