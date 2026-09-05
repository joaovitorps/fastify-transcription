import { nanoid } from "nanoid";
import assert from "node:assert/strict";
import { beforeEach, describe, it, mock } from "node:test";
import { type Chapter, type CreateChapterData } from "../types/chapter.ts";

type InsertValues = Omit<Chapter, "createdAt" | "updatedAt" | "deletedAt">;

const state = {
  selectRows: [] as Chapter[],
  insertValues: [] as InsertValues[],
  updateSet: [] as Array<{ deletedAt: Date; updatedAt: Date }>,
  whereCalls: 0,
  updateCalls: 0,
};

mock.module("../db/connection.ts", {
  exports: {
    db: {
      select() {
        return {
          from() {
            return {
              where() {
                state.whereCalls += 1;
                return Promise.resolve(state.selectRows);
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
      update() {
        return {
          set(values: { deletedAt: Date; updatedAt: Date }) {
            state.updateSet.push(values);
            return {
              where() {
                state.updateCalls += 1;
                return Promise.resolve();
              },
            };
          },
        };
      },
    },
  },
});

const { createChapter, getActiveChapter, softDeleteChapter } =
  await import("./chapter-model.ts");

const videoId = nanoid();
const chapterData: CreateChapterData = {
  videoId,
  content: "00:00 Introduction \n 00:30 Chapter 1 \n 01:00 Chapter 2",
};

function sampleChapter(): Chapter {
  return {
    id: nanoid(),
    videoId,
    content: chapterData.content,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };
}

describe("chapter-model (mocked database)", () => {
  beforeEach(() => {
    state.selectRows = [];
    state.insertValues = [];
    state.updateSet = [];
    state.whereCalls = 0;
    state.updateCalls = 0;
  });

  describe("createChapter", () => {
    it("builds the insert payload and returns the row", async () => {
      const created = await createChapter(chapterData);

      assert.equal(created.id.length, 21);
      assert.equal(created.videoId, chapterData.videoId);
      assert.equal(created.content, chapterData.content);

      assert.deepEqual(state.insertValues, [
        {
          id: created.id,
          videoId: chapterData.videoId,
          content: chapterData.content,
        },
      ]);
    });
  });

  describe("getActiveChapter", () => {
    it("returns null when no active row matches", async () => {
      assert.equal(await getActiveChapter(videoId), null);
      assert.equal(state.whereCalls, 1);
    });

    it("returns the active chapter when it exists", async () => {
      const chapter = sampleChapter();
      state.selectRows = [chapter];

      assert.equal(await getActiveChapter(videoId), chapter);
      assert.equal(state.whereCalls, 1);
    });
  });

  describe("softDeleteChapter", () => {
    it("sets deletedAt and updatedAt on the matching row", async () => {
      await softDeleteChapter(videoId);

      assert.equal(state.updateCalls, 1);
      assert.equal(state.updateSet.length, 1);
      assert.equal(state.updateSet[0].updatedAt instanceof Date, true);
      assert.equal(state.updateSet[0].deletedAt instanceof Date, true);
    });
  });
});
