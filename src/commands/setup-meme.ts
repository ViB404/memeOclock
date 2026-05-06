import { Command } from "@sapphire/framework";
import { db } from "../database/db";
import { GUILD_ID } from "..";
import { EmbedBuilder } from "discord.js";
import { EMOJIS } from "../constants/emojis";
import { sendMeme } from "../schedule/cron-job";
import { fetchMeme, type Meme } from "../meme/fetch";

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
    await interaction.deferReply({ flags: ["Ephemeral"] });

    if (!interaction.inGuild()) {
      return interaction.editReply("This command can only be used in a guild.");
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

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.success} Meme Channel Configured`)
      .setDescription(
        `This channel has been set as the meme channel for this server.`,
      )
      .setColor("Green")
      .addFields({
        name: "Channel",
        value: `<#${channelId}>`,
        inline: true,
      })
      .setTimestamp();

    setTimeout(async () => {
      let meme: Meme = await fetchMeme();
      await sendMeme(interaction.client, channelId, meme);
    }, 1000);

    return interaction.editReply({
      embeds: [embed],
    });
  }
}
