import axios from "axios";
import { db } from "../database/db";

export type Meme = {
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

export const DARK_SUBS = [
  "dankmemes",
  "shitposting",
  "discordVideos",
  "HolUp",
  "cursedcomments",
  "blursedimages",
  "deepfriedmemes",
  "surrealmemes",
  "ComedyNecrophilia",
  "Unexpected",
];

export async function fetchNSFWMeme(): Promise<Meme> {
  let fallback: any = null;

  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const sub = DARK_SUBS[Math.floor(Math.random() * DARK_SUBS.length)];

      const res = await axios.get(`https://meme-api.com/gimme/${sub}/20`);

      const memes = res.data?.memes ?? [];

      const valid = memes.filter(
        (m: any) =>
          m.nsfw &&
          m.url &&
          !m.spoiler &&
          (m.url.endsWith(".jpg") ||
            m.url.endsWith(".png") ||
            m.url.endsWith(".jpeg") ||
            m.url.endsWith(".gif")) &&
          m.ups > 50,
      );

      if (!valid.length) continue;

      if (!fallback) fallback = valid[0];

      for (const meme of valid) {
        const id = meme.postLink;

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
      console.error("NSFW Meme API failed, retrying...", err);
      continue;
    }
  }

  if (fallback) {
    console.warn("⚠️ Sending repeated NSFW meme (fallback)");

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
