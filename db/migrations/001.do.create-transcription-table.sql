CREATE TABLE transcription (
  id VARCHAR(21) PRIMARY KEY,
  youtube_url TEXT NOT NULL,
  youtube_id VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  created_by VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
