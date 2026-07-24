import { Command } from "@sapphire/framework";
import { db } from "../database/db";
import { GUILD_ID } from "..";
import { EmbedBuilder, MessageFlags } from "discord.js";
import { EMOJIS } from "../constants/emojis";
import { getNextMemeTime } from "../utils/getNextMemeTime";

export class SetupMemeCommand extends Command {
  public constructor(context: Command.LoaderContext, options: Command.Options) {
    super(context, { requiredUserPermissions: ["Administrator"] });
  }

  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand(
      (builder) =>
        builder
          .setName("setup-meme")
          .setDescription("Setup current channel as the meme channel"),
      {
        // ...(process.env.PROD ? { guildIds: [GUILD_ID] } : {}),
        idHints: ["1501103003745386516"],
      },
    );
  }

  public override async chatInputRun(
    interaction: Command.ChatInputCommandInteraction,
  ) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    if (!interaction.inGuild()) {
      return interaction.editReply(
        `${EMOJIS.error} This command can only be used in a guild.`,
      );
    }

    const guildId = interaction.guildId;
    const channelId = interaction.channelId;

    db.run(
      `INSERT INTO meme_channels (guild_id, channel_id)
       VALUES (?, ?)
       ON CONFLICT(guild_id) DO UPDATE SET
       channel_id = excluded.channel_id`,
      [guildId, channelId],
    );

    const timing = getNextMemeTime();

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.success} Meme Channel Configured`)
      .setDescription(
        `
This channel has been set as the meme channel for this server.
- Next meme arrives <t:${timing}:R> • <t:${timing}:f>`,
      )
      .setColor("Green")
      .addFields({
        name: "Channel",
        value: `<#${channelId}>`,
        inline: true,
      })
      .setTimestamp();

    const webhookUrl = process.env.DISCORD_INFO_WEBHOOK;

    if (!webhookUrl) return;

    const webhookEmbed = new EmbedBuilder()
      .setTitle(`✅ Meme Channel Set ${interaction.guild?.name ?? "Unknown"}`)
      .setDescription(`Guild ID: \`${interaction.guild?.id ?? "Unknown"}\``)
      .addFields(
        {
          name: "👑 Owner ID",
          value: interaction.guild?.ownerId ?? "Unknown",
          inline: true,
        },
        {
          name: "📚 Channels",
          value: interaction.guild?.channels.cache.size.toString() ?? "Unknown",
          inline: true,
        },
        {
          name: "👥 Members",
          value: interaction.guild?.memberCount.toString() ?? "Unknown",
          inline: true,
        },
        {
          name: "📅 Joined At",
          value: interaction.guild?.joinedAt?.toISOString() ?? "Unknown",
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
        embeds: [webhookEmbed.toJSON()],
      }),
    })
      .then(() =>
        console.log(
          `✅ Sent webhook for ${interaction.guild?.name ?? "Unknown"}`,
        ),
      )
      .catch((error) =>
        console.error(
          `❌ Failed webhook for ${interaction.guild?.name ?? "Unknown"}:`,
          error,
        ),
      );

    return interaction.editReply({
      embeds: [embed],
    });
  }
}
