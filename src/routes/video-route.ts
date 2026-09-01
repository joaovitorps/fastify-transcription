import type { FastifyPluginAsyncZod } from "@fastify/type-provider-zod";
import {
  createVideo,
  fetchVideoV1,
  fetchVideoV2,
  getVideoV1ById,
  getVideoV2ById,
} from "../models/video-model.ts";
import {
  createVideoSchema,
  getVideoSchema,
  listVideosSchema,
} from "../schemas/video-schemas.ts";
import {
  createVideoV2Schema,
  getVideoV2Schema,
  listVideosV2Schema,
} from "../schemas/video-v2-schemas.ts";
import { extractYouTubeId } from "../utils/youtube.ts";
import { ERROR_CODES } from "../schemas/error-schemas.ts";

const invalidYouTubeUrlError = {
  statusCode: 400,
  message: "The provided URL is not a valid YouTube URL",
  code: ERROR_CODES.validation,
};

const videoNotFoundError = {
  statusCode: 404,
  message: "Video not found",
  code: ERROR_CODES.notFound,
};

export const videoRoutes: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/api/v1/video/:id",
    {
      schema: getVideoSchema,
    },
    async (request, reply) => {
      const { id } = request.params;

      const video = await getVideoV1ById(id);
      if (!video) {
        return reply.code(404).send(videoNotFoundError);
      }

      return { video };
    },
  );

  app.get(
    "/api/v2/video/:id",
    {
      schema: getVideoV2Schema,
    },
    async (request, reply) => {
      const { id } = request.params;

      const video = await getVideoV2ById(id);
      if (!video) {
        return reply.code(404).send(videoNotFoundError);
      }

      return { video };
    },
  );

  app.get(
    "/api/v1/video",
    {
      schema: listVideosSchema,
    },
    async () => {
      const videos = await fetchVideoV1();

      return { videos };
    },
  );

  app.get(
    "/api/v2/video",
    {
      schema: listVideosV2Schema,
    },
    async () => {
      const videos = await fetchVideoV2();

      return { videos };
    },
  );

  app.post(
    "/api/v1/video",
    {
      schema: createVideoSchema,
    },
    async (request, reply) => {
      const { url } = request.body;
      const { id: userId } = request.user;

      const youtubeId = extractYouTubeId(url);
      if (!youtubeId) {
        return reply.code(400).send(invalidYouTubeUrlError);
      }

      const video = await createVideo({
        youtube_url: url,
        youtube_id: youtubeId,
        content: "Transcription will be generated here.",
        created_by: userId,
      });

      return reply.code(201).send(video);
    },
  );

  app.post(
    "/api/v2/video",
    {
      schema: createVideoV2Schema,
    },
    async (request, reply) => {
      const { url } = request.body;
      const { id: userId } = request.user;

      const videoId = extractYouTubeId(url);
      if (!videoId) {
        return reply.code(400).send(invalidYouTubeUrlError);
      }

      const video = await createVideo({
        youtube_url: url,
        youtube_id: videoId,
        content: "Transcription will be generated here.",
        created_by: userId,
      });

      return reply.code(201).send(video);
    },
  );
};
