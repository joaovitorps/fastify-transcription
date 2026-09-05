export type Chapter = {
  id: string;
  videoId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

export type CreateChapterData = Omit<
  Chapter,
  "id" | "createdAt" | "updatedAt" | "deletedAt"
>;
