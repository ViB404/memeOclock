import {
  ChannelType,
  PermissionFlagsBits,
  type Client,
} from "discord.js";
import type { Meme } from "../type";
import { EMOJIS } from "../constants/emojis";
import { generateMemeMessage } from "../components/meme-send";

export async function sendMeme(
  client: Client,
  channelId: string,
  meme: Meme,
  nsfw = false,
) {
  const channel = await client.channels.fetch(channelId);

  if (
    !channel ||
    channel.type !== ChannelType.GuildText ||
    !channel.isSendable()
  ) {
    throw new Error("INVALID_CHANNEL");
  }

  const me = channel.guild.members.me;

  if (!me) {
    throw new Error("BOT_NOT_IN_GUILD");
  }

  const permissions = channel.permissionsFor(me);

  if (
    !permissions?.has([
      PermissionFlagsBits.ViewChannel,
      PermissionFlagsBits.SendMessages,
      PermissionFlagsBits.EmbedLinks,
    ])
  ) {
    throw new Error("MISSING_PERMISSIONS");
  }

  // NSFW safety check
  if (nsfw && !channel.nsfw) {
    console.warn(
      `⚠️ Tried sending NSFW meme to non-NSFW channel: ${channelId}`,
    );

    return;
  }

  const messageData = generateMemeMessage(meme, nsfw);

  await channel.send(messageData);

  await new Promise((resolve) => setTimeout(resolve, 500));
}
