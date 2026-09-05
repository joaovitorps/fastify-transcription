import type { FastifyInstance } from "fastify";
import { nanoid } from "nanoid";
import assert from "node:assert/strict";
import { after, before, beforeEach, describe, it } from "node:test";
import { buildApp } from "./app.ts";
import { createVideo } from "./utils/test/factories/video.ts";
import { closeDatabase, resetDatabase } from "./utils/test/test-utils.ts";

const validVideoId = "dQw4w9WgXcQ";
const validVideoUrl = `https://www.youtube.com/watch?v=${validVideoId}`;

describe("E2E /api/v2/video", () => {
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

  describe("POST /api/v2/video", () => {
    it("creates a video and responds 201 with the video record", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/v2/video",
        payload: { url: validVideoUrl },
      });

      assert.equal(response.statusCode, 201);
      const body = response.json();
      assert.equal(body.videoUrl, validVideoUrl);
      assert.equal(body.videoId, validVideoId);
      assert.equal(body.createdBy, "123");
      assert.equal(typeof body.id, "string");
      assert.equal(body.id.length, 21);
      assert.ok(!Number.isNaN(Date.parse(body.createdAt)));
      assert.ok(!Number.isNaN(Date.parse(body.updatedAt)));
    });

    it("responds 400 for a valid URL that is not a video URL", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/v2/video",
        payload: { url: "https://example.com/not-a-video" },
      });

      assert.equal(response.statusCode, 400);
      assert.deepEqual(response.json(), {
        statusCode: 400,
        message: "The provided URL is not a valid video URL",
        code: "VALIDATION_ERROR",
      });
    });

    it("responds 400 with issue details for an invalid URL", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/v2/video",
        payload: { url: "not-a-url" },
      });

      assert.equal(response.statusCode, 400);
      const body = response.json();
      assert.equal(body.code, "VALIDATION_ERROR");
      assert.ok(Array.isArray(body.issues));
      assert.ok(body.issues.length > 0);
    });
  });

  describe("GET /api/v2/video", () => {
    it("returns an empty list when no videos exist", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/v2/video",
      });

      assert.equal(response.statusCode, 200);
      assert.deepEqual(response.json(), { videos: [] });
    });

    it("returns the videos ordered by creation (newest first)", async () => {
      const first = await createVideo(app, validVideoUrl);
      const second = await createVideo(app, validVideoUrl);

      const response = await app.inject({
        method: "GET",
        url: "/api/v2/video",
      });

      assert.equal(response.statusCode, 200);
      const body = response.json();
      assert.equal(body.videos.length, 2);
      assert.equal(body.videos[0].id, second.id);
      assert.equal(body.videos[1].id, first.id);
    });
  });

  describe("GET /api/v2/video/:id", () => {
    it("returns the video for an existing id", async () => {
      const created = await createVideo(app, validVideoUrl);

      const response = await app.inject({
        method: "GET",
        url: `/api/v2/video/${created.id}`,
      });

      assert.equal(response.statusCode, 200);
      assert.equal(response.json().video.id, created.id);
    });

    it("responds 404 for an unknown id", async () => {
      const response = await app.inject({
        method: "GET",
        url: `/api/v2/video/${nanoid()}`,
      });

      assert.equal(response.statusCode, 404);
      assert.deepEqual(response.json(), {
        statusCode: 404,
        message: "Video not found",
        code: "NOT_FOUND",
      });
    });

    it("responds 400 for a malformed id", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/v2/video/not-a-nanoid",
      });

      assert.equal(response.statusCode, 400);
      assert.equal(response.json().code, "VALIDATION_ERROR");
    });
  });
});
