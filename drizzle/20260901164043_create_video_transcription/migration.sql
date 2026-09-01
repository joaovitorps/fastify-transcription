CREATE TABLE "video_transcription" (
	"id" varchar(21) PRIMARY KEY,
	"video_id" varchar(21) NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "video" DROP COLUMN "content";--> statement-breakpoint
ALTER TABLE "video_transcription" ADD CONSTRAINT "video_transcription_video_id_video_id_fkey" FOREIGN KEY ("video_id") REFERENCES "video"("id");