import { createTool } from "@mastra/core/tools";
import { fetchTranscript } from "youtube-transcript";
import { z } from "zod";

export function joinTranscriptSegments(
  segments: Array<{ text: string }>,
): string {
  return segments.map((segment) => segment.text).join(" ");
}

export const fetchYouTubeTranscriptToolId = "fetch-youtube-transcript";

export const fetchYouTubeTranscriptTool = createTool({
  id: fetchYouTubeTranscriptToolId,
  description:
    "Fetch the transcript of a YouTube video given its video ID, returning the joined transcript text.",
  inputSchema: z.object({
    videoId: z
      .string()
      .describe("The YouTube video ID to fetch the transcript for."),
  }),
  outputSchema: z.object({
    content: z
      .string()
      .describe("The full transcript text joined into a single paragraph."),
  }),
  execute: async ({ videoId }) => {
    const segments = await fetchTranscript(videoId);
    const content = joinTranscriptSegments(segments);

    return { content };
  },
});
