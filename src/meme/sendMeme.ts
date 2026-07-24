import { ChannelType, PermissionFlagsBits, type Client } from "discord.js";
import type { Meme } from "../type";
import { generateMemeMessage } from "../components/meme-send";

export async function sendMeme(
  client: Client,
  channelId: string,
  meme: Meme,
  nsfw = false,
  weekly = false,
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

  if (nsfw && !channel.nsfw) {
    return;
  }

  await channel.send(generateMemeMessage(meme, nsfw, weekly));

  await Bun.sleep(500);
}
