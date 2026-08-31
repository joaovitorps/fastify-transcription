export type Transcription = {
  id: string;
  youtube_url: string;
  youtube_id: string;
  content: string;
  created_by: string;
  created_at: Date;
  updated_at: Date;
};

export type CreateTranscriptionData = {
  id: string;
  youtube_url: string;
  youtube_id: string;
  content: string;
  created_by: string;
};
