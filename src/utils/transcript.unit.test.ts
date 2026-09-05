import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  formatTimestamp,
  formatTranscriptSegments,
  joinTranscriptSegments,
} from "../utils/transcript.ts";

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

describe("formatTimestamp", () => {
  it("formats zero as 00:00", () => {
    assert.equal(formatTimestamp(0), "00:00");
  });

  it("formats sub-second offsets as 00:00", () => {
    assert.equal(formatTimestamp(999), "00:00");
  });

  it("formats seconds with a leading zero", () => {
    assert.equal(formatTimestamp(1_000), "00:01");
  });

  it("formats minutes and seconds", () => {
    assert.equal(formatTimestamp(61_500), "01:01");
  });

  it("adds a leading zero to single-digit minutes", () => {
    assert.equal(formatTimestamp(600_000), "10:00");
  });

  it("includes hours when the offset is an hour or more", () => {
    assert.equal(formatTimestamp(3_600_000), "01:00:00");
  });

  it("formats hours, minutes and seconds together", () => {
    assert.equal(formatTimestamp(3_661_000), "01:01:01");
  });

  it("pads hours with a leading zero", () => {
    assert.equal(formatTimestamp(50_461_000), "14:01:01");
  });

  it("rounds sub-second offsets down", () => {
    assert.equal(formatTimestamp(59_999), "00:59");
    assert.equal(formatTimestamp(60_999), "01:00");
  });
});

describe("formatTranscriptSegments", () => {
  it("returns an empty string for no segments", () => {
    assert.equal(formatTranscriptSegments([]), "");
  });

  it("prefixes a single segment with its timestamp", () => {
    const content = formatTranscriptSegments([
      { text: "Hello everyone", offset: 0 },
    ]);

    assert.equal(content, "[00:00] Hello everyone");
  });

  it("joins segments with newlines", () => {
    const content = formatTranscriptSegments([
      { text: "Introduction", offset: 0 },
      { text: "First chapter", offset: 30_000 },
      { text: "Second chapter", offset: 60_000 },
    ]);

    assert.equal(content, "[00:00] Introduction\n[00:30] First chapter\n[01:00] Second chapter");
  });

  it("uses the hours format for segments past an hour", () => {
    const content = formatTranscriptSegments([
      { text: "Long video content", offset: 3_661_000 },
    ]);

    assert.equal(content, "[01:01:01] Long video content");
  });
});
