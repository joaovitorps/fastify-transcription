ALTER TABLE "transcription" RENAME TO "video";--> statement-breakpoint
ALTER TABLE "video" RENAME CONSTRAINT "transcription_pkey" TO "video_pkey";
