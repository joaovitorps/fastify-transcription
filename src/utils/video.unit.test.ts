import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { extractVideoId } from "./video.ts";

describe("extractVideoId", () => {
  it("extracts the id from a standard watch URL", () => {
    assert.equal(
      extractVideoId("https://www.youtube.com/watch?v=dQw4w9WgXcQ"),
      "dQw4w9WgXcQ",
    );
  });

  it("extracts the id when other query params come first", () => {
    assert.equal(
      extractVideoId("https://www.youtube.com/watch?list=PL123&v=dQw4w9WgXcQ"),
      "dQw4w9WgXcQ",
    );
  });

  it("extracts the id from a youtu.be short URL", () => {
    assert.equal(
      extractVideoId("https://youtu.be/dQw4w9WgXcQ"),
      "dQw4w9WgXcQ",
    );
  });

  it("extracts the id from a shorts URL", () => {
    assert.equal(
      extractVideoId("https://www.youtube.com/shorts/dQw4w9WgXcQ"),
      "dQw4w9WgXcQ",
    );
  });

  it("extracts the id from an embed URL", () => {
    assert.equal(
      extractVideoId("https://www.youtube.com/embed/dQw4w9WgXcQ"),
      "dQw4w9WgXcQ",
    );
  });

  it("extracts the id from a legacy /v/ URL", () => {
    assert.equal(
      extractVideoId("https://www.youtube.com/v/dQw4w9WgXcQ"),
      "dQw4w9WgXcQ",
    );
  });

  it("returns null for a non-video URL", () => {
    assert.equal(extractVideoId("https://example.com/not-a-video"), null);
  });

  it("returns null for a playlist URL", () => {
    assert.equal(
      extractVideoId("https://www.youtube.com/playlist?list=PL123"),
      null,
    );
  });

  it("returns null for an unparseable string", () => {
    assert.equal(extractVideoId("not a url"), null);
  });
});