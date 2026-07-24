export type Meme = {
  id: string;
  title: string;
  url: string;
  postLink: string;
  subreddit: string;
};

export type VoteType = "like" | "dislike";

export type VoteButtonData = {
  action: VoteType;
  memeId: string;
  expiresAt: number;
};

export type VoteButtonGeneration = {
  action: VoteType;
  count: number;
  memeId: string;
  expiresAt: number;
};

export interface MemeApiResponse {
  memes: RedditMeme[];
}

export interface RedditMeme {
  title: string;
  url: string;
  postLink: string;
  subreddit: string;
  nsfw: boolean;
  spoiler: boolean;
  ups: number;
}
