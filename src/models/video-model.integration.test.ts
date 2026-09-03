import assert from "node:assert/strict";
import { beforeEach, describe, it, mock } from "node:test";
import { nanoid } from "nanoid";
import { type CreateVideoData, type Video } from "../types/video.ts";

type InsertValues = Omit<Video, "createdAt" | "updatedAt">;

const state = {
  selectRows: [] as Video[],
  getByIdRows: [] as Video[],
  insertValues: [] as InsertValues[],
  orderByCalls: 0,
  whereCalls: 0,
};

mock.module("../db/connection.ts", {
  exports: {
    db: {
      select() {
        return {
          from() {
            return {
              orderBy() {
                state.orderByCalls += 1;
                return Promise.resolve(state.selectRows);
              },
              where() {
                state.whereCalls += 1;
                return Promise.resolve(state.getByIdRows);
              },
            };
          },
        };
      },
      insert() {
        return {
          values(values: InsertValues) {
            state.insertValues.push(values);
            return {
              returning() {
                return Promise.resolve([values]);
              },
            };
          },
        };
      },
    },
  },
});

const { createVideo, fetchVideo, getVideoById } = await import(
  "./video-model.ts"
);

const videoData: CreateVideoData = {
  videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  videoId: "dQw4w9WgXcQ",
  createdBy: "user-1",
};

function sampleVideo(): Video {
  return {
    id: nanoid(),
    ...videoData,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

describe("video-model (mocked database)", () => {
  beforeEach(() => {
    state.selectRows = [];
    state.getByIdRows = [];
    state.insertValues = [];
    state.orderByCalls = 0;
    state.whereCalls = 0;
  });

  describe("createVideo", () => {
    it("builds the insert payload and returns the row", async () => {
      const created = await createVideo(videoData);

      assert.equal(created.id.length, 21);
      assert.equal(created.videoUrl, videoData.videoUrl);
      assert.equal(created.videoId, videoData.videoId);
      assert.equal(created.createdBy, videoData.createdBy);

      assert.deepEqual(state.insertValues, [
        {
          id: created.id,
          videoUrl: videoData.videoUrl,
          videoId: videoData.videoId,
          createdBy: videoData.createdBy,
        },
      ]);
    });
  });

  describe("getVideoById", () => {
    it("returns null when no row matches", async () => {
      const id = nanoid();
      assert.equal(await getVideoById(id), null);

      assert.equal(state.whereCalls, 1);
    });

    it("returns the row when it exists", async () => {
      const video = sampleVideo();
      state.getByIdRows = [video];

      assert.equal(await getVideoById(video.id), video);
      assert.equal(state.whereCalls, 1);
    });
  });

  describe("fetchVideo", () => {
    it("returns an empty list when no rows exist", async () => {
      assert.deepEqual(await fetchVideo(), []);
      assert.equal(state.orderByCalls, 1);
    });

    it("returns the rows returned by the ordered query", async () => {
      const video = sampleVideo();
      state.selectRows = [video];

      assert.equal(await fetchVideo(), state.selectRows);
      assert.equal(state.orderByCalls, 1);
    });
  });
});