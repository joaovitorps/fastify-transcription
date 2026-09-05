import { pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const video = pgTable("video", {
  id: varchar("id", { length: 21 }).primaryKey(),
  videoUrl: text("video_url").notNull(),
  videoId: varchar("video_id", { length: 255 }).notNull(),
  createdBy: varchar("created_by", { length: 255 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const videoTranscription = pgTable("video_transcription", {
  id: varchar("id", { length: 21 }).primaryKey(),
  videoId: varchar("video_id", { length: 21 })
    .notNull()
    .references(() => video.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

export const videoChapter = pgTable("video_chapter", {
  id: varchar("id", { length: 21 }).primaryKey(),
  videoId: varchar("video_id", { length: 21 })
    .notNull()
    .references(() => video.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});
