import { ChannelType, type Client } from "discord.js";
import type { Meme } from "../type";
import { EMOJIS } from "../constants/emojis";
import { generateMemeMessage } from "../components/meme-send";

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
        `${EMOJIS.warning} <#${channelId}> \*\*is not an NSFW channel\*\*`,
      );
      console.warn(
        `⚠️ Tried sending NSFW meme to non-NSFW channel: ${channelId}`,
      );
      return;
    }

    const messageData = generateMemeMessage(meme, nsfw);

    await channel.send(messageData);

    await new Promise((r) => setTimeout(r, 500));
  } catch (err) {
    console.error("Channel send fail:", channelId, err);
  }
}
