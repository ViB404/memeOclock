import { db } from "../database/db";
import type { Meme } from "../type";

export interface WeeklyMeme extends Meme {
  likes: number;
  dislikes: number;
  isNsfw: boolean;
  createdAt: number;
}

export function getWeeklyTopMeme(
  isNsfw: boolean,
): WeeklyMeme | null {
  const oneWeekAgo = Math.floor(Date.now() / 1000) - 7 * 24 * 60 * 60;

  const meme = db
    .query<
      WeeklyMeme,
      [number, number]
    >(
      `
      SELECT
        meme_id AS id,
        title,
        url,
        post_link AS postLink,
        subreddit,
        likes,
        dislikes,
        is_nsfw AS isNsfw,
        created_at AS createdAt
      FROM votes
      WHERE
        created_at >= ?
        AND is_nsfw = ?
      ORDER BY
        (likes - dislikes) DESC,
        likes DESC
      LIMIT 1
      `,
    )
    .get(oneWeekAgo, isNsfw ? 1 : 0);

  return meme ?? null;
}
