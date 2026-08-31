ALTER TABLE "transcription" ADD COLUMN "video_url" text;--> statement-breakpoint
ALTER TABLE "transcription" ADD COLUMN "video_id" varchar(255);--> statement-breakpoint
UPDATE "transcription" SET "video_url" = "youtube_url", "video_id" = "youtube_id";