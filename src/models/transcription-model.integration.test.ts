import assert from "node:assert/strict";
import { beforeEach, describe, it, mock } from "node:test";
import { nanoid } from "nanoid";
import {
  type CreateTranscriptionData,
  type Transcription,
} from "../types/transcription.ts";

type InsertValues = Omit<Transcription, "createdAt" | "updatedAt" | "deletedAt">;

const state = {
  selectRows: [] as Transcription[],
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

const { createTranscription, getActiveTranscription, softDeleteTranscription } =
  await import("./transcription-model.ts");

const videoId = nanoid();
const transcriptionData: CreateTranscriptionData = {
  videoId,
  content: "Hello world welcome to the video",
};

function sampleTranscription(): Transcription {
  return {
    id: nanoid(),
    videoId,
    content: transcriptionData.content,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };
}

describe("transcription-model (mocked database)", () => {
  beforeEach(() => {
    state.selectRows = [];
    state.insertValues = [];
    state.updateSet = [];
    state.whereCalls = 0;
    state.updateCalls = 0;
  });

  describe("createTranscription", () => {
    it("builds the insert payload and returns the row", async () => {
      const created = await createTranscription(transcriptionData);

      assert.equal(created.id.length, 21);
      assert.equal(created.videoId, transcriptionData.videoId);
      assert.equal(created.content, transcriptionData.content);

      assert.deepEqual(state.insertValues, [
        {
          id: created.id,
          videoId: transcriptionData.videoId,
          content: transcriptionData.content,
        },
      ]);
    });
  });

  describe("getActiveTranscription", () => {
    it("returns null when no active row matches", async () => {
      assert.equal(await getActiveTranscription(videoId), null);
      assert.equal(state.whereCalls, 1);
    });

    it("returns the active transcription when it exists", async () => {
      const transcription = sampleTranscription();
      state.selectRows = [transcription];

      assert.equal(
        await getActiveTranscription(videoId),
        transcription,
      );
      assert.equal(state.whereCalls, 1);
    });
  });

  describe("softDeleteTranscription", () => {
    it("sets deletedAt and updatedAt on the matching row", async () => {
      await softDeleteTranscription(videoId);

      assert.equal(state.updateCalls, 1);
      assert.equal(state.updateSet.length, 1);
      assert.equal(state.updateSet[0].updatedAt instanceof Date, true);
      assert.equal(state.updateSet[0].deletedAt instanceof Date, true);
    });
  });
});
