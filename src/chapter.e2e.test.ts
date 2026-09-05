import type { FastifyInstance } from "fastify";
import { nanoid } from "nanoid";
import assert from "node:assert/strict";
import { after, before, beforeEach, describe, it, mock } from "node:test";
import { createVideo } from "./utils/test/factories/video.ts";
import { closeDatabase, resetDatabase } from "./utils/test/test-utils.ts";

const validVideoId = "dQw4w9WgXcQ";
const validVideoUrl = `https://www.youtube.com/watch?v=${validVideoId}`;
const chapterContent =
  "00:00 Introduction\n00:30 First chapter\n01:00 Second chapter";

const transcriptSegments = [
  { text: "Hello everyone", offset: 0, duration: 5000 },
  { text: "welcome to the video", offset: 5000, duration: 5000 },
];

mock.module("youtube-transcript", {
  exports: {
    fetchTranscript: async () => transcriptSegments,
  },
});

mock.module("./ai/agents/chapter-agent.ts", {
  exports: {
    chapterAgent: {
      generate: async () => ({ text: chapterContent }),
    },
  },
});

const { buildApp } = await import("./app.ts");

describe("E2E /api/v1/video/:id/chapter", () => {
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

  describe("POST /api/v1/video/:id/chapter", () => {
    it("generates and stores the chapter, responding 201", async () => {
      const video = await createVideo(app, validVideoUrl);

      const response = await app.inject({
        method: "POST",
        url: `/api/v1/video/${video.id}/chapter`,
      });

      assert.equal(response.statusCode, 201);
      const body = response.json();
      assert.equal(body.chapter.videoId, video.id);
      assert.equal(body.chapter.content, chapterContent);
      assert.equal(typeof body.chapter.id, "string");
      assert.equal(body.chapter.id.length, 21);
      assert.equal(body.chapter.deletedAt, null);
    });

    it("responds 404 when the video does not exist", async () => {
      const response = await app.inject({
        method: "POST",
        url: `/api/v1/video/${nanoid()}/chapter`,
      });

      assert.equal(response.statusCode, 404);
      assert.equal(response.json().code, "NOT_FOUND");
    });

    it("responds 409 when a chapter already exists", async () => {
      const video = await createVideo(app, validVideoUrl);
      await app.inject({
        method: "POST",
        url: `/api/v1/video/${video.id}/chapter`,
      });

      const response = await app.inject({
        method: "POST",
        url: `/api/v1/video/${video.id}/chapter`,
      });

      assert.equal(response.statusCode, 409);
      assert.equal(response.json().code, "CONFLICT");
    });
  });

  describe("GET /api/v1/video/:id/chapter", () => {
    it("returns the stored chapter", async () => {
      const video = await createVideo(app, validVideoUrl);
      await app.inject({
        method: "POST",
        url: `/api/v1/video/${video.id}/chapter`,
      });

      const response = await app.inject({
        method: "GET",
        url: `/api/v1/video/${video.id}/chapter`,
      });

      assert.equal(response.statusCode, 200);
      assert.equal(response.json().chapter.content, chapterContent);
    });

    it("responds 404 when no chapter exists", async () => {
      const video = await createVideo(app, validVideoUrl);

      const response = await app.inject({
        method: "GET",
        url: `/api/v1/video/${video.id}/chapter`,
      });

      assert.equal(response.statusCode, 404);
      assert.equal(response.json().code, "NOT_FOUND");
    });

    it("responds 404 when the video does not exist", async () => {
      const response = await app.inject({
        method: "GET",
        url: `/api/v1/video/${nanoid()}/chapter`,
      });

      assert.equal(response.statusCode, 404);
      assert.equal(response.json().code, "NOT_FOUND");
    });
  });

  describe("DELETE /api/v1/video/:id/chapter", () => {
    it("soft-deletes the chapter, responding 204", async () => {
      const video = await createVideo(app, validVideoUrl);
      await app.inject({
        method: "POST",
        url: `/api/v1/video/${video.id}/chapter`,
      });

      const response = await app.inject({
        method: "DELETE",
        url: `/api/v1/video/${video.id}/chapter`,
      });

      assert.equal(response.statusCode, 204);

      const getResponse = await app.inject({
        method: "GET",
        url: `/api/v1/video/${video.id}/chapter`,
      });

      assert.equal(getResponse.statusCode, 404);
    });

    it("responds 404 when no active chapter exists", async () => {
      const video = await createVideo(app, validVideoUrl);

      const response = await app.inject({
        method: "DELETE",
        url: `/api/v1/video/${video.id}/chapter`,
      });

      assert.equal(response.statusCode, 404);
      assert.equal(response.json().code, "NOT_FOUND");
    });
  });
});