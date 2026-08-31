import { z } from 'zod';

export const createTranscriptionSchema = {
  body: z.object({
    url: z
      .url({ message: 'The url must be a valid URL' }),
  }),
};
