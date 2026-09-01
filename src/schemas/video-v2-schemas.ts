import { z } from "zod";
import { errorSchema } from "./error-schemas.ts";

export const createVideoV2BodySchema = z.object({
  url: z.url({ message: "The url must be a valid URL" }),
});

export const videoV2Schema = z.object({
  id: z.string(),
  video_url: z.string(),
  video_id: z.string(),
  content: z.string(),
  created_by: z.string(),
  created_at: z.date(),
  updated_at: z.date(),
});

export const createVideoV2ResponseSchema = videoV2Schema;

export const listVideosV2ResponseSchema = z.object({
  videos: z.array(videoV2Schema),
});

export const getVideoV2ParamsSchema = z.object({
  id: z.string(),
});

export const getVideoV2ResponseSchema = z.object({
  video: videoV2Schema,
});

export const createVideoV2Schema = {
  tags: ["video"],
  summary: "Create a video V2",
  description:
    "Sends a video URL and registers a video for it. Returns the created video record.",
  body: createVideoV2BodySchema,
  response: {
    201: createVideoV2ResponseSchema,
    400: errorSchema,
    409: errorSchema,
    500: errorSchema,
  },
};

export const listVideosV2Schema = {
  tags: ["video"],
  summary: "List videos V2",
  description: "Returns all the videos registered in the application.",
  response: {
    200: listVideosV2ResponseSchema,
    500: errorSchema,
  },
};

export const getVideoV2Schema = {
  tags: ["video"],
  summary: "Get a video V2",
  description: "Returns a single video by its ID.",
  params: getVideoV2ParamsSchema,
  response: {
    200: getVideoV2ResponseSchema,
    404: errorSchema,
    500: errorSchema,
  },
};
