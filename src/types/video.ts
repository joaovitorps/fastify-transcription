export type Video = {
  id: string;
  videoUrl: string;
  videoId: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateVideoData = Omit<Video, "id" | "createdAt" | "updatedAt">;
