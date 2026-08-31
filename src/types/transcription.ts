export type Transcription = {
  id: string;
  youtube_url: string;
  youtube_id: string;
  video_url: string;
  video_id: string;
  content: string;
  created_by: string;
  created_at: Date;
  updated_at: Date;
};

export type TranscriptionWithoutVideo<T> = Omit<T, "video_url" | "video_id">;
export type TranscriptionWithoutYoutube<T> = Omit<
  T,
  "youtube_url" | "youtube_id"
>;

export type TranscriptionV1 = TranscriptionWithoutVideo<Transcription>;

export type TranscriptionV2 = TranscriptionWithoutYoutube<Transcription>;

type CreateTranscriptionData = Omit<
  Transcription,
  "id" | "created_at" | "updated_at"
>;

export type CreateTranscriptionDataV1 =
  TranscriptionWithoutVideo<CreateTranscriptionData>;
