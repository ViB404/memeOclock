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
  "shitposting",
  "HolUp",
  "cursedcomments",
];

export async function fetchMeme(): Promise<Meme> {
  let fallback: any = null;

  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const sub = SUBS[Math.floor(Math.random() * SUBS.length)];

      const res = await axios.get(`https://meme-api.com/gimme/${sub}/20`);

      const memes = res.data?.memes ?? [];

      const valid = memes.filter(
        (m: any) =>
          !m.nsfw &&
          m.url &&
          (m.url.endsWith(".jpg") ||
            m.url.endsWith(".png") ||
            m.url.endsWith(".jpeg")) &&
          m.ups > 100,
      );

      if (!valid.length) continue;

      // save one fallback (in case all are seen)
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
    } catch (err) {
      console.error("Meme API failed, retrying...", err);
      continue;
    }
  }

  if (fallback) {
    console.warn("⚠️ Sending repeated meme (fallback)");

    return {
      id: fallback.postLink,
      title: fallback.title,
      url: fallback.url,
      postLink: fallback.postLink,
      subreddit: fallback.subreddit,
    };
  }

  throw new Error("No meme found at all");
}
