import { defineRelations } from "drizzle-orm";
import * as schema from "./schema.ts";

export const relations = defineRelations(schema, (r) => ({
  transcription: {
    video: r.one.video({
      from: r.videoTranscription.videoId,
      to: r.video.id,
    }),
  },
  video: {
    transcriptions: r.many.videoTranscription(),
  },
}));
