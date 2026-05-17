import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  Client,
  DiscordAPIError,
  EmbedBuilder,
  type ColorResolvable,
} from "discord.js";

import cron from "node-cron";

import { db } from "../database/db";

import { fetchMeme, type Meme } from "../meme/fetch";
import { fetchNSFWMeme } from "../meme/fetch-nsfw";
import { EMOJIS } from "../constants/emojis";

function getRandomColor(): ColorResolvable {
  return `#${Math.floor(Math.random() * 16777215)
    .toString(16)
    .padStart(6, "0")}`;
}

export async function sendMeme(
  client: Client,
  channelId: string,
  meme: Meme,
  nsfw = false,
) {
  try {
    const channel = await client.channels.fetch(channelId);

    if (
      !channel ||
      !channel.isSendable() ||
      channel.type !== ChannelType.GuildText
    ) {
      return;
    }

    // NSFW safety check
    if (nsfw && !channel.nsfw) {
      await channel.send(
        `${EMOJIS.warning} ${channelId} is not an NSFW channel`,
      );
      console.warn(
        `⚠️ Tried sending NSFW meme to non-NSFW channel: ${channelId}`,
      );
      return;
    }

    const embed = new EmbedBuilder()
      .setColor(getRandomColor())
      .setAuthor({
        name: `r/${meme.subreddit}`,
      })
      .setTitle(meme.title.slice(0, 256))
      .setURL(meme.postLink)
      .setImage(meme.url)
      .setFooter({
        text: "Vote us on top.gg to support us",
      })
      .setTimestamp();

    const button = new ButtonBuilder()
      .setLabel("Top.gg")
      .setURL("https://top.gg/bot/1501095370124693604/vote")
      .setStyle(ButtonStyle.Link);

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button);

    await channel.send({
      embeds: [embed],
      components: [row],
    });

    await new Promise((r) => setTimeout(r, 500));
  } catch (err) {
    console.error("Channel send fail:", channelId, err);
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
        if (err instanceof DiscordAPIError && err.code === 50013) {
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

export function startMemeCron(client: Client) {
  let cron_timing = "0 */12 * * *";
  cron.schedule(cron_timing, async () => {
    console.log("📤 Sending scheduled memes...");

    await Promise.all([sendMemeToAll(client), sendNSFWMemeToAll(client)]);
  });

  console.log("✅ Meme cron jobs started");
}
