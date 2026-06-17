import axios from "axios";
import { db } from "../database/db";
import type { Meme } from "../type";

export function hasSeen(id: string): boolean {
  const row = db.query("SELECT id FROM seen_memes WHERE id = ?").get(id);
  return !!row;
}

export function markSeen(id: string) {
  db.run("INSERT OR IGNORE INTO seen_memes (id) VALUES (?)", [id]);
}

export const NSFW_SUBS = ["DirtyMemes", "sexmemes", "AdultMeme"];

export async function fetchNSFWMeme(): Promise<Meme> {
  let fallback: any = null;

  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const sub = NSFW_SUBS[Math.floor(Math.random() * NSFW_SUBS.length)];

      const res = await axios.get(`https://meme-api.com/gimme/${sub}/10`, {
        timeout: 10000,
        headers: {
          "User-Agent": "MemeOClock/1.0",
        },
      });

      const memes = res.data?.memes ?? [];

      const valid = memes.filter(
        (m: any) =>
          m.url && !m.spoiler && /\.(jpg|jpeg|png|gif)(\?.*)?$/i.test(m.url),
      );

      console.log(`[NSFW] ${sub} -> ${valid.length}/${memes.length} valid`);

      if (!valid.length) continue;

      if (!fallback) fallback = valid[0];

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
    } catch (err: any) {
      console.error(
        "[NSFW] API failed:",
        err?.response?.status,
        err?.response?.data || err.message,
      );
    }
  }

  if (fallback) {
    console.warn("⚠️ Sending repeated NSFW meme");

    return {
      id: fallback.postLink,
      title: fallback.title,
      url: fallback.url,
      postLink: fallback.postLink,
      subreddit: fallback.subreddit,
    };
  }

  throw new Error("No NSFW meme found");
}
