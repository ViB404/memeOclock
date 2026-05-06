import { Client, EmbedBuilder } from "discord.js";
import cron from "node-cron";
import { fetchMeme, type Meme } from "../meme/fetch";
import { db } from "../database/db";
import type { ColorResolvable } from "discord.js";
import { EMOJIS } from "../constants/emojis";

function getRandomColor(): ColorResolvable {
  return `#${Math.floor(Math.random() * 16777215)
    .toString(16)
    .padStart(6, "0")}`;
}

export async function sendMeme(client: Client, channelId: string, meme: Meme) {
  try {
    const channel = await client.channels.fetch(channelId);

    if (!channel?.isSendable()) return;

    const embed = new EmbedBuilder()
      .setColor(getRandomColor())
      .setAuthor({ name: `r/${meme.subreddit}` })
      .setTitle(meme.title.slice(0, 256))
      .setURL(meme.postLink)
      .setImage(meme.url)
      .setFooter({
        text: `Vote us on top.gg to support us`,
      })
      .setTimestamp();

    await channel.send({ embeds: [embed] });

    await new Promise((r) => setTimeout(r, 500));
  } catch (err) {
    console.error("Channel send fail:", channelId, err);
  }
}

export async function sendMemeToAll(client: Client) {
  try {
    const meme: Meme = await fetchMeme();

    const rows = db.query("SELECT channel_id FROM meme_channels").all() as {
      channel_id: string;
    }[];

    for (const row of rows) {
      try {
        await sendMeme(client, row.channel_id, meme);
      } catch (err) {
        console.error("Channel send fail:", row.channel_id, err);
      }
    }
  } catch (err) {
    console.error("Cron meme error:", err);
  }
}

export function startMemeCron(client: Client) {
  cron.schedule("0 */12 * * *", async () => {
    await sendMemeToAll(client);
  });
}
