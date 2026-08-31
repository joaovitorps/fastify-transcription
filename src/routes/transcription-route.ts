import type { FastifyPluginAsyncZod } from "@fastify/type-provider-zod";
import {
  createTranscription,
  fetchTranscriptionV1,
  fetchTranscriptionV2,
} from "../models/transcription-model.ts";
import {
  createTranscriptionSchema,
  listTranscriptionsSchema,
} from "../schemas/transcription-schemas.ts";
import {
  createTranscriptionV2Schema,
  listTranscriptionsV2Schema,
} from "../schemas/transcription-v2-schemas.ts";
import { extractYouTubeId } from "../utils/youtube.ts";

export const transcriptionRoutes: FastifyPluginAsyncZod = async (app) => {
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
        return reply.code(400).send({
          message: "The provided URL is not a valid YouTube URL",
        });
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
        return reply.code(400).send({
          message: "The provided URL is not a valid YouTube URL",
        });
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
