import { pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core';

export const video = pgTable('video', {
  id: varchar('id', { length: 21 }).primaryKey(),
  youtube_url: text('youtube_url').notNull(),
  youtube_id: varchar('youtube_id', { length: 255 }).notNull(),
  video_url: text('video_url').notNull(),
  video_id: varchar('video_id', { length: 255 }).notNull(),
  content: text('content').notNull(),
  created_by: varchar('created_by', { length: 255 }).notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
