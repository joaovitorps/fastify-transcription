import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { joinTranscriptSegments } from "./fetch-youtube-transcript-tool.ts";

describe("joinTranscriptSegments", () => {
  it("joins multiple segments into a single paragraph separated by spaces", () => {
    const content = joinTranscriptSegments([
      { text: "Hello everyone" },
      { text: "welcome to the video" },
      { text: "today we'll learn" },
    ]);

    assert.equal(content, "Hello everyone welcome to the video today we'll learn");
  });

  it("returns an empty string for no segments", () => {
    assert.equal(joinTranscriptSegments([]), "");
  });

  it("returns the single text for one segment", () => {
    assert.equal(joinTranscriptSegments([{ text: "just one line" }]), "just one line");
  });
});
