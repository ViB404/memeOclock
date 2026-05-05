import { Client, EmbedBuilder } from "discord.js";
import cron from "node-cron";
import { fetchMeme } from "../meme/fetch";
import { db } from "../database/db";
import type { ColorResolvable } from "discord.js";

function getRandomColor(): ColorResolvable {
  return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
}

export function startMemeCron(client: Client) {
  cron.schedule("0 * * * *", async () => {
    try {
      const meme = await fetchMeme();

      const rows = db.query("SELECT channel_id FROM meme_channels").all() as {
        channel_id: string;
      }[];

      for (const row of rows) {
        const channel = client.channels.cache.get(row.channel_id);

        if (!channel?.isSendable()) continue;

        const embed = new EmbedBuilder()
          .setColor(getRandomColor())
          .setAuthor({
            name: `r/${meme.subreddit}`,
          })
          .setTitle(meme.title)
          .setURL(meme.postLink)
          .setImage(meme.url)
          .setFooter({
            text: `Vote us on top.gg to support us`,
          })
          .setTimestamp();

        await channel.send({
          embeds: [embed],
        });
      }
    } catch (err) {
      console.error("Cron meme error:", err);
    }
  });
}
