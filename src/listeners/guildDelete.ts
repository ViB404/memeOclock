import { Listener } from "@sapphire/framework";
import { EmbedBuilder, type Guild } from "discord.js";
import { db } from "../database/db";

export class GuildDeleteListener extends Listener {
  public constructor(
    context: Listener.LoaderContext,
    options: Listener.Options,
  ) {
    super(context, {
      ...options,
      event: "guildDelete",
    });
  }

  public run(guild: Guild) {
    const webhookUrl = process.env.DISCORD_INFO_WEBHOOK;

    if (!webhookUrl) return;

    db.run(`DELETE FROM guilds WHERE id = '${guild.id}'`);

    const embed = new EmbedBuilder()
      .setTitle(`❌ Left ${guild.name}`)
      .setDescription(`Guild ID: \`${guild.id}\``)
      .addFields(
        {
          name: "👑 Owner ID",
          value: guild.ownerId,
          inline: true,
        },
        {
          name: "👥 Members",
          value: guild.memberCount.toString(),
          inline: true,
        },
        {
          name: "📅 Left At",
          value: guild.joinedAt?.toISOString() ?? "Unknown",
        },
      )
      .setColor("Red")
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
      .then(() => console.log(`✅ Sent leave webhook for ${guild.name}`))
      .catch((error) =>
        console.error(`❌ Failed webhook for ${guild.name}:`, error),
      );
  }
}
