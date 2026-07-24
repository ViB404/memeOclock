import { Command } from "@sapphire/framework";
import { db } from "../database/db";
import { GUILD_ID } from "..";

import { EmbedBuilder, ChannelType, MessageFlags } from "discord.js";

import { EMOJIS } from "../constants/emojis";
import { getNextMemeTime } from "../utils/getNextMemeTime";

export class SetupNSFWMemeCommand extends Command {
  public constructor(context: Command.LoaderContext, options: Command.Options) {
    super(context, {
      ...options,
      requiredUserPermissions: ["Administrator"],
    });
  }

  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand(
      (builder) =>
        builder
          .setName("setup-nsfw-meme")
          .setDescription("Setup or remove automatic NSFW memes")
          .addBooleanOption((option) =>
            option
              .setName("remove")
              .setDescription("Remove NSFW meme setup")
              .setRequired(false),
          ),
      {
        // ...(process.env.PROD ? { guildIds: [GUILD_ID] } : {}),
      },
    );
  }

  public override async chatInputRun(
    interaction: Command.ChatInputCommandInteraction,
  ) {
    await interaction.deferReply({
      flags: MessageFlags.Ephemeral,
    });

    if (!interaction.inGuild()) {
      return interaction.editReply({
        content: `${EMOJIS.error} Guild only command.`,
      });
    }

    const guildId = interaction.guildId;
    const channelId = interaction.channelId;

    const remove = interaction.options.getBoolean("remove") ?? false;

    // REMOVE SETUP
    if (remove) {
      db.run(
        `
        DELETE FROM nsfw_channels
        WHERE guild_id = ?
        `,
        [guildId],
      );

      const removedEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.success} NSFW Meme Setup Removed`)
        .setDescription(
          "Automatic NSFW memes have been disabled for this server.",
        )
        .setColor("Green")
        .setTimestamp();

      return interaction.editReply({
        embeds: [removedEmbed],
      });
    }

    const channel = interaction.channel;

    if (!channel || channel.type !== ChannelType.GuildText) {
      return interaction.editReply({
        content: `${EMOJIS.error} Invalid channel.`,
      });
    }

    if (!channel.nsfw) {
      return interaction.editReply({
        content: `${EMOJIS.error} This channel must be marked as NSFW.`,
      });
    }

    // SETUP
    db.run(
      `
      INSERT INTO nsfw_channels (
        guild_id,
        channel_id,
        enabled
      )
      VALUES (?, ?, 1)
      ON CONFLICT(guild_id)
      DO UPDATE SET
        channel_id = excluded.channel_id,
        enabled = 1
      `,
      [guildId, channelId],
    );

    const timing = getNextMemeTime();

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.success} NSFW Meme Channel Configured`)
      .setDescription(
        `
Automatic NSFW memes enabled for <#${channelId}>
- Next meme arrives <t:${timing}:R> • <t:${timing}:f>
        `,
      )
      .addFields({
        name: `${EMOJIS.nsfw} NSFW`,
        value: "Enabled",
        inline: true,
      })
      .setColor("Green")
      .setTimestamp();

    const webhookUrl = process.env.DISCORD_INFO_WEBHOOK;
    if (!webhookUrl) return;

    const webhookEmbed = new EmbedBuilder()
      .setTitle(
        `✅ NSFW Meme Channel Configured ${interaction.guild?.name ?? "Unknown"}`,
      )
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
