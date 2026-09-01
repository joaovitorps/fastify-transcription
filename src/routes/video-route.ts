import type { FastifyPluginAsyncZod } from "@fastify/type-provider-zod";
import {
  createVideo,
  fetchVideo,
  getVideoById,
} from "../models/video-model.ts";
import {
  createVideoSchema,
  getVideoSchema,
  listVideosSchema,
} from "../schemas/video-schemas.ts";
import { ERROR_CODES } from "../schemas/error-schemas.ts";
import { extractVideoId } from "../utils/video.ts";

const invalidVideoUrlError = {
  statusCode: 400,
  message: "The provided URL is not a valid video URL",
  code: ERROR_CODES.validation,
};

const videoNotFoundError = {
  statusCode: 404,
  message: "Video not found",
  code: ERROR_CODES.notFound,
};

export const videoRoutes: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/api/v2/video/:id",
    {
      schema: getVideoSchema,
    },
    async (request, reply) => {
      const { id } = request.params;

      const video = await getVideoById(id);
      if (!video) {
        return reply.code(404).send(videoNotFoundError);
      }

      return { video };
    },
  );

  app.get(
    "/api/v2/video",
    {
      schema: listVideosSchema,
    },
    async () => {
      const videos = await fetchVideo();

      return { videos };
    },
  );

  app.post(
    "/api/v2/video",
    {
      schema: createVideoSchema,
    },
    async (request, reply) => {
      const { url } = request.body;
      const { id: userId } = request.user;

      const videoId = extractVideoId(url);
      if (!videoId) {
        return reply.code(400).send(invalidVideoUrlError);
      }

      const video = await createVideo({
        video_url: url,
        video_id: videoId,
        content: "Transcription will be generated here.",
        created_by: userId,
      });

      return reply.code(201).send(video);
    },
  );
};