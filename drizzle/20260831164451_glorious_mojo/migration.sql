CREATE TABLE "transcription" (
	"id" varchar(21) PRIMARY KEY,
	"youtube_url" text NOT NULL,
	"youtube_id" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"created_by" varchar(255) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
