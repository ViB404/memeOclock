import { db } from "../database/db";
import type { Client } from "discord.js";

import { sendMeme } from "./sendMeme";
import { shouldRemoveChannel } from "../utils/shouldRemoveChannel";
import { getWeeklyTopMeme } from "./fetch_weekly_meme";

async function sendWeekly(
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
    const meme = getWeeklyTopMeme(isNsfw);

    if (!meme) return;

    const rows = db
      .query(
        `
          SELECT channel_id
          FROM ${table}
          ${isNsfw ? "WHERE enabled = 1" : ""}
        `,
      )
      .all() as { channel_id: string }[];

    await Promise.all(
      rows.map(async ({ channel_id }) => {
        try {
          await sendMeme(client, channel_id, meme, isNsfw, true);
        } catch (err) {
          console.error(
            `Weekly ${isNsfw ? "NSFW" : "normal"} meme send failed:`,
            channel_id,
            err,
          );

          if (shouldRemoveChannel(err)) {
            db.run(`DELETE FROM ${table} WHERE channel_id = ?`, [channel_id]);
          }
        }
      }),
    );
  } catch (err) {
    console.error(`Weekly ${isNsfw ? "NSFW" : "normal"} meme cron error:`, err);
  }
}

export const sendWeeklyMeme = (client: Client) =>
  sendWeekly(client, {
    table: "meme_channels",
    isNsfw: false,
  });

export const sendWeeklyNSFWMeme = (client: Client) =>
  sendWeekly(client, {
    table: "nsfw_channels",
    isNsfw: true,
  });
