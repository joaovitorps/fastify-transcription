export type Transcription = {
  id: string;
  videoId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

export type CreateTranscriptionData = Omit<
  Transcription,
  "id" | "createdAt" | "updatedAt" | "deletedAt"
>;
