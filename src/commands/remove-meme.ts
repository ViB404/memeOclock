import { Command } from "@sapphire/framework";
import { db } from "../database/db";
import { EmbedBuilder } from "discord.js";
import { EMOJIS } from "../constants/emojis";
import { GUILD_ID } from "..";

export class RemoveMemeCommand extends Command {
  public constructor(context: Command.LoaderContext, options: Command.Options) {
    super(context, { requiredUserPermissions: ["Administrator"] });
  }

  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand(
      (builder) =>
        builder
          .setName("remove-meme")
          .setDescription("Remove the meme channel"),
      {
        // guildIds: [GUILD_ID],
        idHints: ["1503376615244169276"],
      },
    );
  }

  public override async chatInputRun(
    interaction: Command.ChatInputCommandInteraction,
  ) {
    await interaction.deferReply({ flags: ["Ephemeral"] });

    if (!interaction.inGuild()) {
      return interaction.editReply("This command can only be used in a guild.");
    }

    const guildId = interaction.guildId;

    const existing = db
      .query(
        `SELECT channel_id
         FROM meme_channels
         WHERE guild_id = ?`,
      )
      .get(guildId) as { channel_id: string } | undefined;

    if (!existing) {
      const noMemeChannelEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.warning} No Meme Channel Found`)
        .setDescription(
          "Use `/setup-meme` to set a meme channel for this guild.",
        )
        .setColor("Red");
      return interaction.editReply({ embeds: [noMemeChannelEmbed] });
    }

    db.run(
      `DELETE FROM meme_channels
       WHERE guild_id = ?`,
      [guildId],
    );

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.success} Meme Channel Removed`)
      .setDescription(`Channel has been removed for this server.`)
      .setColor("Green")
      .addFields({
        name: "Channel",
        value: `<#${existing.channel_id}>`,
        inline: true,
      })
      .setTimestamp();

    return interaction.editReply({
      embeds: [embed],
    });
  }
}
