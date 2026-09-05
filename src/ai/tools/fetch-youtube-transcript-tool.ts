import { createTool } from "@mastra/core/tools";
import { fetchTranscript } from "youtube-transcript";
import { z } from "zod";

export const fetchYouTubeTranscriptTool = createTool({
  id: "fetch-youtube-transcript",
  description:
    "Fetch the transcript segments of a YouTube video given its video ID.",
  inputSchema: z.object({
    videoId: z
      .string()
      .describe("The YouTube video ID to fetch the transcript for."),
  }),
  outputSchema: z.array(
    z.object({
      text: z.string(),
      offset: z.number(),
      duration: z.number(),
    }),
  ),
  execute: async ({ videoId }) => {
    return await fetchTranscript(videoId);
  },
});
