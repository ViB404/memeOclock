import { Listener } from "@sapphire/framework";
import { EmbedBuilder, type Guild } from "discord.js";

export class GuildCreateListener extends Listener {
  public constructor(
    context: Listener.LoaderContext,
    options: Listener.Options,
  ) {
    super(context, {
      ...options,
      event: "guildCreate",
    });
  }

  public run(guild: Guild) {
    const webhookUrl = process.env.DISCORD_INFO_WEBHOOK;

    if (!webhookUrl) return;

    const embed = new EmbedBuilder()
      .setTitle(`✅ Joined ${guild.name}`)
      .setDescription(`Guild ID: \`${guild.id}\``)
      .addFields(
        {
          name: "👑 Owner ID",
          value: guild.ownerId,
          inline: true,
        },
        {
          name: "📚 Channels",
          value: guild.channels.cache.size.toString(),
          inline: true,
        },
        {
          name: "👥 Members",
          value: guild.memberCount.toString(),
          inline: true,
        },
        {
          name: "📅 Joined At",
          value: guild.joinedAt?.toISOString() ?? "Unknown",
        },
      )
      .setColor("Green")
      .setTimestamp();

    fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        embeds: [embed.toJSON()],
      }),
    })
      .then(() => console.log(`✅ Sent join webhook for ${guild.name}`))
      .catch((error) =>
        console.error(`❌ Failed webhook for ${guild.name}:`, error),
      );
  }
}
