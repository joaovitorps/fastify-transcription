import type { FastifyPluginAsyncZod } from '@fastify/type-provider-zod';
import { nanoid } from 'nanoid';
import {
    createTranscription,
    fetchTranscription,
} from '../models/transcription-model.ts';
import {
    createTranscriptionSchema,
    listTranscriptionsSchema,
} from '../schemas/transcription-schemas.ts';
import { extractYouTubeId } from '../utils/youtube.ts';

export const transcriptionRoutes: FastifyPluginAsyncZod = async (app) => {
  app.get('/api/v1/video/transcription', {
    schema: listTranscriptionsSchema,
  }, async () => {
    const transcriptions = await fetchTranscription();

    return { transcriptions };
  });

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

    const transcription = await createTranscription({
      id: nanoid(),
      youtube_url: url,
      youtube_id: youtubeId,
      content: 'Transcription will be generated here.',
      created_by: userId,
    });

    return reply.code(201).send(transcription);
  });
};
