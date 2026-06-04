import { DiscordAPIError } from "discord.js";
import { db } from "../database/db";
import type { Meme } from "../type";
import { fetchMeme } from "../meme/fetch";
import type { Client } from "discord.js";
import { fetchNSFWMeme } from "../meme/fetch-nsfw";
import { sendMeme } from "./sendMeme";

export async function sendNSFWMemeToAll(client: Client) {
  try {
    const meme = await fetchNSFWMeme();

    const rows = db
      .query(
        `
      SELECT channel_id
      FROM nsfw_channels
      WHERE enabled = 1
    `,
      )
      .all() as {
      channel_id: string;
    }[];

    for (const row of rows) {
      try {
        await sendMeme(client, row.channel_id, meme, true);
      } catch (err) {
        console.error("NSFW meme send fail:", row.channel_id, err);
        if (
          err instanceof DiscordAPIError &&
          [50001, 50013, 10003].includes(Number(err.code))
        ) {
          db.run(
            `
            DELETE FROM nsfw_channels WHERE channel_id = ?
          `,
            [row.channel_id],
          );
        }
      }
    }
  } catch (err) {
    console.error("NSFW meme cron error:", err);
  }
}

export async function sendMemeToAll(client: Client) {
  try {
    const meme: Meme = await fetchMeme();

    const rows = db
      .query(
        `
      SELECT channel_id
      FROM meme_channels
    `,
      )
      .all() as {
      channel_id: string;
    }[];

    for (const row of rows) {
      try {
        await sendMeme(client, row.channel_id, meme, false);
      } catch (err) {
        console.error("Normal meme send fail:", row.channel_id, err);
        if (err instanceof DiscordAPIError && err.code === 50013) {
          db.run(
            `
            DELETE FROM meme_channels WHERE channel_id = ?
          `,
            [row.channel_id],
          );
        }
      }
    }
  } catch (err) {
    console.error("Normal meme cron error:", err);
  }
}
