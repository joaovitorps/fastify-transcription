import type { FastifyPluginAsyncZod } from "@fastify/type-provider-zod";
import { fetchTranscript } from "youtube-transcript";
import { chapterAgent } from "../ai/agents/chapter-agent.ts";
import { formatTranscriptSegments } from "../utils/transcript.ts";
import {
  createChapter,
  getActiveChapter,
  softDeleteChapter,
} from "../models/chapter-model.ts";
import { getVideoById } from "../models/video-model.ts";
import {
  createChapterSchema,
  deleteChapterSchema,
  getChapterSchema,
} from "../schemas/chapter-schemas.ts";
import { ERROR_CODES } from "../schemas/error-schemas.ts";

const videoNotFoundError = {
  statusCode: 404,
  message: "Video not found",
  code: ERROR_CODES.notFound,
};

const chapterNotFoundError = {
  statusCode: 404,
  message: "Chapter not found",
  code: ERROR_CODES.notFound,
};

const chapterAlreadyExistsError = {
  statusCode: 409,
  message: "A chapter already exists for this video",
  code: ERROR_CODES.conflict,
};

export const chapterRoutes: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/api/v1/video/:id/chapter",
    {
      schema: getChapterSchema,
    },
    async (request, reply) => {
      const { id } = request.params;

      const video = await getVideoById(id);
      if (!video) {
        return reply.code(404).send(videoNotFoundError);
      }

      const chapter = await getActiveChapter(video.id);
      if (!chapter) {
        return reply.code(404).send(chapterNotFoundError);
      }

      return { chapter };
    },
  );

  app.post(
    "/api/v1/video/:id/chapter",
    {
      schema: createChapterSchema,
    },
    async (request, reply) => {
      const { id } = request.params;

      const video = await getVideoById(id);
      if (!video) {
        return reply.code(404).send(videoNotFoundError);
      }

      const existing = await getActiveChapter(video.id);
      if (existing) {
        return reply.code(409).send(chapterAlreadyExistsError);
      }

      console.log("Generating chapters for video ID:", video.videoId);

      const segments = await fetchTranscript(video.videoId);
      const transcript = formatTranscriptSegments(segments);

      const generation = await chapterAgent.generate(
        `Here is the video transcript with timestamps:\n\n${transcript}`,
      );

      console.log("Agent generation result:", generation);

      const content = generation.text;
      if (!content) {
        throw new Error("Failed to generate chapters from the transcript.");
      }

      const chapter = await createChapter({
        videoId: video.id,
        content,
      });

      return reply.code(201).send({ chapter });
    },
  );

  app.delete(
    "/api/v1/video/:id/chapter",
    {
      schema: deleteChapterSchema,
    },
    async (request, reply) => {
      const { id } = request.params;

      const video = await getVideoById(id);
      if (!video) {
        return reply.code(404).send(videoNotFoundError);
      }

      const chapter = await getActiveChapter(video.id);
      if (!chapter) {
        return reply.code(404).send(chapterNotFoundError);
      }

      await softDeleteChapter(video.id);

      return reply.code(204).send();
    },
  );
};
