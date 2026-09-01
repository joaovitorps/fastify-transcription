export type Video = {
  id: string;
  video_url: string;
  video_id: string;
  content: string;
  created_by: string;
  created_at: Date;
  updated_at: Date;
};

export type CreateVideoData = Omit<
  Video,
  "id" | "created_at" | "updated_at"
>;