import axios from "axios";
import { db } from "../database/db";

type Meme = {
  id: string;
  title: string;
  url: string;
  postLink: string;
  subreddit: string;
};

export function hasSeen(id: string): boolean {
  const row = db.query("SELECT id FROM seen_memes WHERE id = ?").get(id);

  return !!row;
}

export function markSeen(id: string) {
  db.run("INSERT OR IGNORE INTO seen_memes (id) VALUES (?)", [id]);
}

const SUBS = [
  "memes",
  "dankmemes",
  "wholesomememes",
  "funny",
  "me_irl",
  "AdviceAnimals",
  "MemeEconomy",
  "HistoryMemes",
  "ProgrammerHumor",
];

export async function fetchMeme(): Promise<Meme> {
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const sub = SUBS[Math.floor(Math.random() * SUBS.length)];

      const res = await axios.get(
        `https://www.reddit.com/r/${sub}/hot.json?limit=30`,
        {
          headers: {
            "User-Agent": "memeOclock/1.0",
          },
        },
      );

      const posts = res.data?.data?.children ?? [];

      const valid = posts.filter(
        (p: any) =>
          p?.data &&
          !p.data.over_18 &&
          p.data.post_hint === "image" &&
          p.data.ups > 100,
      );

      if (!valid.length) continue;

      for (const post of valid) {
        const id = post.data.id;

        if (!id || hasSeen(id)) continue;

        markSeen(id);

        return {
          id,
          title: post.data.title,
          url: post.data.url,
          postLink: `https://www.reddit.com${post.data.permalink}`,
          subreddit: post.data.subreddit,
        };
      }
    } catch (err) {
      console.error("Reddit fetch failed, retrying...", err);
      continue;
    }
  }

  throw new Error("No new meme found 😭");
}
