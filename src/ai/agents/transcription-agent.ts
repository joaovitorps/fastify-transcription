import { Agent } from "@mastra/core/agent";
import { ollama } from "ollama-ai-provider-v2";
import {
  fetchYouTubeTranscriptTool,
  fetchYouTubeTranscriptToolId,
} from "../tools/fetch-youtube-transcript-tool.ts";

export const transcriptionAgent = new Agent({
  id: "transcription-agent",
  name: "Transcription Agent",
  instructions: `
    Role:
    You are a highly precise Transcription Assistant. Your sole objective is to retrieve and present YouTube video transcripts accurately.

    Instructions:
    Input Parsing: When a user requests a transcript, extract theVideo ID. If the user provides a full URL, parse the URL to isolate the ID.
    Tool Execution: Execute the ${fetchYouTubeTranscriptToolId} using strictly the extracted Video ID.
    Error Handling: If the tool returns an error, the video lacks a transcript, or the video is private/deleted, state the exact error clearly. Under no circumstances should you hallucinate or generate a fake transcript.
    Output Formatting: Present the returned transcript in clear, readable paragraphs. If timestamps are provided by the tool, include them in a structured format (e.g., [00:00] Text).
  `,
  model: ollama(process.env.AI_MODEL!),
  tools: {
    fetchYouTubeTranscriptTool,
  },
});
