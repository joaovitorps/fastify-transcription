import type { FastifyPluginAsyncZod } from "@fastify/type-provider-zod";
import {
  createTranscription,
  fetchTranscriptionV1,
  fetchTranscriptionV2,
  getTranscriptionV1ById,
  getTranscriptionV2ById,
} from "../models/transcription-model.ts";
import {
  createTranscriptionSchema,
  getTranscriptionSchema,
  listTranscriptionsSchema,
} from "../schemas/transcription-schemas.ts";
import {
  createTranscriptionV2Schema,
  getTranscriptionV2Schema,
  listTranscriptionsV2Schema,
} from "../schemas/transcription-v2-schemas.ts";
import { extractYouTubeId } from "../utils/youtube.ts";
import { ERROR_CODES } from "../schemas/error-schemas.ts";

const invalidYouTubeUrlError = {
  statusCode: 400,
  message: "The provided URL is not a valid YouTube URL",
  code: ERROR_CODES.validation,
};

const transcriptionNotFoundError = {
  statusCode: 404,
  message: "Transcription not found",
  code: ERROR_CODES.notFound,
};

export const transcriptionRoutes: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/api/v1/video/transcription/:id",
    {
      schema: getTranscriptionSchema,
    },
    async (request, reply) => {
      const { id } = request.params;

      const transcription = await getTranscriptionV1ById(id);
      if (!transcription) {
        return reply.code(404).send(transcriptionNotFoundError);
      }

      return { transcription };
    },
  );

  app.get(
    "/api/v2/video/transcription/:id",
    {
      schema: getTranscriptionV2Schema,
    },
    async (request, reply) => {
      const { id } = request.params;

      const transcription = await getTranscriptionV2ById(id);
      if (!transcription) {
        return reply.code(404).send(transcriptionNotFoundError);
      }

      return { transcription };
    },
  );

  app.get(
    "/api/v1/video/transcription",
    {
      schema: listTranscriptionsSchema,
    },
    async () => {
      const transcriptions = await fetchTranscriptionV1();

      return { transcriptions };
    },
  );

  app.get(
    "/api/v2/video/transcription",
    {
      schema: listTranscriptionsV2Schema,
    },
    async () => {
      const transcriptions = await fetchTranscriptionV2();

      return { transcriptions };
    },
  );

  app.post(
    "/api/v1/video/transcription",
    {
      schema: createTranscriptionSchema,
    },
    async (request, reply) => {
      const { url } = request.body;
      const { id: userId } = request.user;

      const youtubeId = extractYouTubeId(url);
      if (!youtubeId) {
        return reply.code(400).send(invalidYouTubeUrlError);
      }

      const transcription = await createTranscription({
        youtube_url: url,
        youtube_id: youtubeId,
        content: "Transcription will be generated here.",
        created_by: userId,
      });

      return reply.code(201).send(transcription);
    },
  );

  app.post(
    "/api/v2/video/transcription",
    {
      schema: createTranscriptionV2Schema,
    },
    async (request, reply) => {
      const { url } = request.body;
      const { id: userId } = request.user;

      const videoId = extractYouTubeId(url);
      if (!videoId) {
        return reply.code(400).send(invalidYouTubeUrlError);
      }

      const transcription = await createTranscription({
        youtube_url: url,
        youtube_id: videoId,
        content: "Transcription will be generated here.",
        created_by: userId,
      });

      return reply.code(201).send(transcription);
    },
  );
};
