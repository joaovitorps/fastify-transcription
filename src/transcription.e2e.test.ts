import type { FastifyInstance } from "fastify";
import { nanoid } from "nanoid";
import assert from "node:assert/strict";
import { after, before, beforeEach, describe, it, mock } from "node:test";
import { createVideo } from "./utils/test/factories/video.ts";
import { closeDatabase, resetDatabase } from "./utils/test/test-utils.ts";

const validVideoId = "dQw4w9WgXcQ";
const validVideoUrl = `https://www.youtube.com/watch?v=${validVideoId}`;
const transcriptContent = "Hello everyone welcome to the video";

mock.module("./ai/agents/transcription-agent.ts", {
  exports: {
    transcriptionAgent: {
      generate: async () => ({
        toolResults: [
          {
            payload: {
              toolName: "fetchYouTubeTranscriptTool",
              result: { content: transcriptContent },
            },
          },
        ],
      }),
    },
  },
});

const { buildApp } = await import("./app.ts");

describe("E2E /api/v1/video/:id/transcription", () => {
  let app: FastifyInstance;

  before(async () => {
    app = buildApp({ logger: false });
  });

  beforeEach(async () => {
    await resetDatabase();
  });

  after(async () => {
    await app.close();
    await closeDatabase();
  });

  describe("POST /api/v1/video/:id/transcription", () => {
    it("fetches and stores the transcription, responding 201", async () => {
      const video = await createVideo(app, validVideoUrl);

      const response = await app.inject({
        method: "POST",
        url: `/api/v1/video/${video.id}/transcription`,
      });

      assert.equal(response.statusCode, 201);
      const body = response.json();
      assert.equal(body.transcription.videoId, video.id);
      assert.equal(body.transcription.content, transcriptContent);
      assert.equal(typeof body.transcription.id, "string");
      assert.equal(body.transcription.id.length, 21);
      assert.equal(body.transcription.deletedAt, null);
    });

    it("responds 404 when the video does not exist", async () => {
      const response = await app.inject({
        method: "POST",
        url: `/api/v1/video/${nanoid()}/transcription`,
      });

      assert.equal(response.statusCode, 404);
      assert.equal(response.json().code, "NOT_FOUND");
    });

    it("responds 409 when a transcription already exists", async () => {
      const video = await createVideo(app, validVideoUrl);
      await app.inject({
        method: "POST",
        url: `/api/v1/video/${video.id}/transcription`,
      });

      const response = await app.inject({
        method: "POST",
        url: `/api/v1/video/${video.id}/transcription`,
      });

      assert.equal(response.statusCode, 409);
      assert.equal(response.json().code, "CONFLICT");
    });
  });

  describe("GET /api/v1/video/:id/transcription", () => {
    it("returns the stored transcription", async () => {
      const video = await createVideo(app, validVideoUrl);
      await app.inject({
        method: "POST",
        url: `/api/v1/video/${video.id}/transcription`,
      });

      const response = await app.inject({
        method: "GET",
        url: `/api/v1/video/${video.id}/transcription`,
      });

      assert.equal(response.statusCode, 200);
      assert.equal(response.json().transcription.content, transcriptContent);
    });

    it("responds 404 when no transcription exists", async () => {
      const video = await createVideo(app, validVideoUrl);

      const response = await app.inject({
        method: "GET",
        url: `/api/v1/video/${video.id}/transcription`,
      });

      assert.equal(response.statusCode, 404);
      assert.equal(response.json().code, "NOT_FOUND");
    });

    it("responds 404 when the video does not exist", async () => {
      const response = await app.inject({
        method: "GET",
        url: `/api/v1/video/${nanoid()}/transcription`,
      });

      assert.equal(response.statusCode, 404);
      assert.equal(response.json().code, "NOT_FOUND");
    });
  });

  describe("DELETE /api/v1/video/:id/transcription", () => {
    it("soft-deletes the transcription, responding 204", async () => {
      const video = await createVideo(app, validVideoUrl);
      await app.inject({
        method: "POST",
        url: `/api/v1/video/${video.id}/transcription`,
      });

      const response = await app.inject({
        method: "DELETE",
        url: `/api/v1/video/${video.id}/transcription`,
      });

      assert.equal(response.statusCode, 204);

      const getResponse = await app.inject({
        method: "GET",
        url: `/api/v1/video/${video.id}/transcription`,
      });

      assert.equal(getResponse.statusCode, 404);
    });

    it("responds 404 when no active transcription exists", async () => {
      const video = await createVideo(app, validVideoUrl);

      const response = await app.inject({
        method: "DELETE",
        url: `/api/v1/video/${video.id}/transcription`,
      });

      assert.equal(response.statusCode, 404);
      assert.equal(response.json().code, "NOT_FOUND");
    });
  });
});
