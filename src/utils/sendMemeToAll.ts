import { db } from "../database/db";
import type { Client } from "discord.js";
import type { Meme } from "../type";
import { fetchMeme } from "../meme/fetch";
import { fetchNSFWMeme } from "../meme/fetch-nsfw";
import { sendMeme } from "./sendMeme";
import { shouldRemoveChannel } from "./shouldRemoveChannel";

export const dbRowCreation = (meme: Meme, isNsfw: boolean) => {
  db.run("INSERT INTO votes (meme_id, is_nsfw) VALUES (?, ?)", [
    meme.id,
    isNsfw,
  ]);
};

async function sendToAll(
  client: Client,
  {
    table,
    isNsfw,
  }: {
    table: "meme_channels" | "nsfw_channels";
    isNsfw: boolean;
  },
) {
  try {
    const meme = isNsfw ? await fetchNSFWMeme() : await fetchMeme();

    const rows = db
      .query(
        `
        SELECT channel_id
        FROM ${table}
        ${isNsfw ? "WHERE enabled = 1" : ""}
      `,
      )
      .all() as { channel_id: string }[];

    dbRowCreation(meme, isNsfw);

    for (const { channel_id } of rows) {
      try {
        await sendMeme(client, channel_id, meme, isNsfw);
      } catch (err) {
        console.error(
          `${isNsfw ? "NSFW" : "Normal"} meme send failed:`,
          channel_id,
          err,
        );

        if (shouldRemoveChannel(err)) {
          db.run(`DELETE FROM ${table} WHERE channel_id = ?`, [channel_id]);
        }
      }
    }
  } catch (err) {
    console.error(`${isNsfw ? "NSFW" : "Normal"} meme cron error:`, err);
  }
}

export const sendMemeToAll = (client: Client) =>
  sendToAll(client, {
    table: "meme_channels",
    isNsfw: false,
  });

export const sendNSFWMemeToAll = (client: Client) =>
  sendToAll(client, {
    table: "nsfw_channels",
    isNsfw: true,
  });
