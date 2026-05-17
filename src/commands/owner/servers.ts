import { Command } from "@sapphire/framework";

import { EmbedBuilder, MessageFlags } from "discord.js";

import { DEV_GUILD_ID } from "../../config/owners";

import { db } from "../../database/db";

export class ServersCommand extends Command {
  public constructor(context: Command.LoaderContext, options: Command.Options) {
    super(context, {
      ...options,
      preconditions: ["OwnerOnly"],
    });
  }

  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand(
      (builder) =>
        builder
          .setName("servers")
          .setDescription("View all bot servers with configs"),
      {
        guildIds: [DEV_GUILD_ID],
      },
    );
  }

  public override async chatInputRun(
    interaction: Command.ChatInputCommandInteraction,
  ) {
    await interaction.deferReply({
      flags: MessageFlags.Ephemeral,
    });

    const guilds = this.container.client.guilds.cache;

    const memeRows = db
      .query(
        `
      SELECT guild_id, channel_id
      FROM meme_channels
    `,
      )
      .all() as {
      guild_id: string;
      channel_id: string;
    }[];

    const nsfwRows = db
      .query(
        `
      SELECT guild_id, channel_id
      FROM nsfw_channels
      WHERE enabled = 1
    `,
      )
      .all() as {
      guild_id: string;
      channel_id: string;
    }[];

    const description: string[] = [];

    for (const guild of guilds.values()) {
      const memeSetup = memeRows.find((x) => x.guild_id === guild.id);

      const nsfwSetup = nsfwRows.find((x) => x.guild_id === guild.id);

      const owner = await guild.fetchOwner().catch(() => null);

      description.push(
        [
          `## ${guild.name}`,
          `🆔 \`${guild.id}\``,
          `👑 Owner: ${
            owner ? `${owner.user.username} (${owner.id})` : "Unknown"
          }`,
          `👥 Members: ${guild.memberCount}`,
          `📚 Channels: ${guild.channels.cache.size}`,
          `😂 Meme Channel: ${
            memeSetup ? `<#${memeSetup.channel_id}>` : "Not setup"
          }`,
          `🔞 NSFW Channel: ${
            nsfwSetup ? `<#${nsfwSetup.channel_id}>` : "Not setup"
          }`,
        ].join("\n"),
      );
    }

    const embed = new EmbedBuilder()
      .setTitle(`🌍 Bot Servers (${guilds.size})`)
      .setDescription(
        description.join("\n\n").slice(0, 4000) || "No servers found.",
      )
      .setColor("Blurple")
      .setFooter({
        text: `MemeOClock Analytics`,
      })
      .setTimestamp();

    return interaction.editReply({
      embeds: [embed],
    });
  }
}
