import { Client, EmbedBuilder } from "discord.js";
import cron from "node-cron";
import { fetchMeme } from "../meme/fetch";
import { db } from "../database/db";
import type { ColorResolvable } from "discord.js";

function getRandomColor(): ColorResolvable {
  return `#${Math.floor(Math.random() * 16777215)
    .toString(16)
    .padStart(6, "0")}`;
}

export async function sendMemeToAll(client: Client) {
  try {
    const meme = await fetchMeme();

    const rows = db.query("SELECT channel_id FROM meme_channels").all() as {
      channel_id: string;
    }[];

    for (const row of rows) {
      try {
        const channel = await client.channels.fetch(row.channel_id);

        if (!channel?.isSendable()) continue;

        const embed = new EmbedBuilder()
          .setColor(getRandomColor())
          .setAuthor({ name: `r/${meme.subreddit}` })
          .setTitle(meme.title.slice(0, 256))
          .setURL(meme.postLink)
          .setImage(meme.url)
          .setFooter({
            text: "Vote us on top.gg to support us",
          })
          .setTimestamp();

        await channel.send({ embeds: [embed] });

        await new Promise((r) => setTimeout(r, 500));
      } catch (err) {
        console.error("Channel send fail:", row.channel_id, err);
      }
    }
  } catch (err) {
    console.error("Cron meme error:", err);
  }
}

export function startMemeCron(client: Client) {
  cron.schedule("0 * * * *", async () => {
    console.log("⏰ Meme cron triggered");
    await sendMemeToAll(client);
  });
}
