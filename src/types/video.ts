export type Video = {
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

export type VideoWithoutVideo<T> = Omit<T, "video_url" | "video_id">;
export type VideoWithoutYoutube<T> = Omit<
  T,
  "youtube_url" | "youtube_id"
>;

export type VideoV1 = VideoWithoutVideo<Video>;

export type VideoV2 = VideoWithoutYoutube<Video>;

type CreateVideoData = Omit<
  Video,
  "id" | "created_at" | "updated_at"
>;

export type CreateVideoDataV1 =
  VideoWithoutVideo<CreateVideoData>;
