import axios from "axios";
import { db } from "../database/db";
import type { Meme, MemeApiResponse, RedditMeme } from "../type";

export function hasSeen(id: string): boolean {
  return !!db.query("SELECT id FROM seen_memes WHERE id = ?").get(id);
}

export function markSeen(id: string) {
  db.run("INSERT OR IGNORE INTO seen_memes (id) VALUES (?)", [id]);
}

const SUBS = [
  "dankmemes",
  "HistoryMemes",
  "ProgrammerHumor",
  "2meirl4meirl",
  "cleanmemes",
  "TooMeIrlForMeIrl",
  "terriblefacebookmemes",
  "MinecraftMemes",
];

const NSFW_SUBS = ["DirtyMemes", "sexmemes", "AdultMeme"];

async function fetchFromSubreddits(
  subreddits: string[],
  amount: number,
  filter: (meme: RedditMeme) => boolean,
): Promise<Meme> {
  let fallback: RedditMeme | null = null;

  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const sub = subreddits[Math.floor(Math.random() * subreddits.length)];

      const { data } = await axios.get<MemeApiResponse>(
        `https://meme-api.com/gimme/${sub}/${amount}`,
        {
          timeout: 10000,
          headers: {
            "User-Agent": "MemeOClock/1.0",
          },
        },
      );

      const valid = data.memes.filter(filter);

      if (!valid.length) continue;

      fallback ??= valid[0]!;

      for (const meme of valid) {
        const id = meme.postLink.split("/").pop();

        if (!id || hasSeen(id)) continue;

        markSeen(id);

        return {
          id,
          title: meme.title,
          url: meme.url,
          postLink: meme.postLink,
          subreddit: meme.subreddit,
        };
      }
    } catch {
      continue;
    }
  }

  if (fallback) {
    return {
      id: fallback.postLink.split("/").pop() ?? fallback.postLink,
      title: fallback.title,
      url: fallback.url,
      postLink: fallback.postLink,
      subreddit: fallback.subreddit,
    };
  }

  throw new Error("No meme found");
}

export function fetchMeme(): Promise<Meme> {
  return fetchFromSubreddits(
    SUBS,
    20,
    (meme) =>
      !meme.nsfw &&
      /\.(jpg|jpeg|png)(\?.*)?$/i.test(meme.url) &&
      meme.ups > 100,
  );
}

export function fetchNSFWMeme(): Promise<Meme> {
  return fetchFromSubreddits(
    NSFW_SUBS,
    10,
    (meme) =>
      Boolean(meme.url) &&
      !meme.spoiler &&
      /\.(jpg|jpeg|png|gif)(\?.*)?$/i.test(meme.url),
  );
}
