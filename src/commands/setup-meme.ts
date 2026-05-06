import { Command } from "@sapphire/framework";
import { db } from "../database/db";
import { GUILD_ID } from "..";

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

    return interaction.editReply("Meme channel set successfully!");
  }
}
