import type { FastifyPluginAsyncZod } from '@fastify/type-provider-zod';
import { nanoid } from 'nanoid';
import {
    createTranscriptionSchema,
} from '../schemas/transcription-schemas.ts';
import { extractYouTubeId } from '../utils/youtube.ts';

type Transcription = {
  id: string;
  youtubeUrl: string;
  youtubeId: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  content: string;
};

const transcriptions: Transcription[] = [];

export const transcriptionRoutes: FastifyPluginAsyncZod = async (app) => {
  const now = () => new Date().toISOString();

  app.post('/api/v1/video/transcription', {
    schema: createTranscriptionSchema,
  }, async (request, reply) => {
    const { url } = request.body;
    const {id: userId} = request.user;

    const youtubeId = extractYouTubeId(url);
    if (!youtubeId) {
      return reply.code(400).send({
        message: 'The provided URL is not a valid YouTube URL',
      });
    }

    const transcription: Transcription = {
      id: nanoid(),
      youtubeUrl: url,
      youtubeId,
      createdAt: now(),
      createdBy: userId,
      updatedAt: now(),
      content: 'Transcription will be generated here.',
    };

    transcriptions.push(transcription);

    return reply.code(201).send(transcription);
  });
};
