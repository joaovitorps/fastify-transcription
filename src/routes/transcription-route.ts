import type { FastifyPluginAsyncZod } from "@fastify/type-provider-zod";
import { transcriptionAgent } from "../ai/agents/transcription-agent.ts";
import {
  createTranscription,
  getActiveTranscription,
  softDeleteTranscription,
} from "../models/transcription-model.ts";
import { getVideoById } from "../models/video-model.ts";
import { ERROR_CODES } from "../schemas/error-schemas.ts";
import {
  createTranscriptionSchema,
  deleteTranscriptionSchema,
  getTranscriptionSchema,
} from "../schemas/transcription-schemas.ts";

const videoNotFoundError = {
  statusCode: 404,
  message: "Video not found",
  code: ERROR_CODES.notFound,
};

const transcriptionNotFoundError = {
  statusCode: 404,
  message: "Transcription not found",
  code: ERROR_CODES.notFound,
};

const transcriptionAlreadyExistsError = {
  statusCode: 409,
  message: "A transcription already exists for this video",
  code: ERROR_CODES.conflict,
};

function extractTranscriptContent(generation: {
  toolResults: Array<{ payload?: { toolName: string; result: unknown } }>;
}): string | null {
  const toolResult = generation.toolResults.find(
    (result) => result.payload?.toolName === "fetchYouTubeTranscriptTool",
  );

  const content = toolResult?.payload?.result as
    | { content: string }
    | undefined;

  return content?.content ?? null;
}

export const transcriptionRoutes: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/api/v1/video/:id/transcription",
    {
      schema: getTranscriptionSchema,
    },
    async (request, reply) => {
      const { id } = request.params;

      const video = await getVideoById(id);
      if (!video) {
        return reply.code(404).send(videoNotFoundError);
      }

      const transcription = await getActiveTranscription(video.id);
      if (!transcription) {
        return reply.code(404).send(transcriptionNotFoundError);
      }

      return { transcription };
    },
  );

  app.post(
    "/api/v1/video/:id/transcription",
    {
      schema: createTranscriptionSchema,
    },
    async (request, reply) => {
      const { id } = request.params;

      const video = await getVideoById(id);
      if (!video) {
        return reply.code(404).send(videoNotFoundError);
      }

      const existing = await getActiveTranscription(video.id);
      if (existing) {
        return reply.code(409).send(transcriptionAlreadyExistsError);
      }

      const generation = await transcriptionAgent.generate(
        `Fetch the transcript for the YouTube video with the ID "${video.videoId}".`,
      );

      const content = extractTranscriptContent(generation);
      if (!content) {
        throw new Error(
          "Failed to extract transcript content from the agent's generation.",
        );
      }

      const transcription = await createTranscription({
        videoId: video.id,
        content,
      });

      return reply.code(201).send({ transcription });
    },
  );

  app.delete(
    "/api/v1/video/:id/transcription",
    {
      schema: deleteTranscriptionSchema,
    },
    async (request, reply) => {
      const { id } = request.params;

      const video = await getVideoById(id);
      if (!video) {
        return reply.code(404).send(videoNotFoundError);
      }

      const transcription = await getActiveTranscription(video.id);
      if (!transcription) {
        return reply.code(404).send(transcriptionNotFoundError);
      }

      await softDeleteTranscription(video.id);

      return reply.code(204).send();
    },
  );
};
