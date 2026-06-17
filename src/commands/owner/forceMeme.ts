import { Command } from "@sapphire/framework";
import { MessageFlags } from "discord.js";

import { DEV_GUILD_ID } from "../../config/owners";
import { EMOJIS } from "../../constants/emojis";
import { sendMemeToAll, sendNSFWMemeToAll } from "../../utils/sendMemeToAll";

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
          .setName("forcememe")
          .setDescription("Force a meme to be posted in the meme channel")
          .addStringOption((option) =>
            option
              .setName("type")
              .setDescription("Meme type to force")
              .setRequired(true)
              .addChoices(
                { name: "meme", value: "meme" },
                { name: "nsfw", value: "nsfw" },
              ),
          ),
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

    const type = interaction.options.getString("type", true);

    switch (type) {
      case "meme":
        const sendMeme = await sendMemeToAll(this.container.client);
        await interaction.editReply({
          content: `${EMOJIS.success} Successfully sent meme to all servers`,
        });
        break;
      case "nsfw":
        const sendNsfw = await sendNSFWMemeToAll(this.container.client);
        await interaction.editReply({
          content: `${EMOJIS.success} Successfully sent NSFW meme to all servers`,
        });
        break;
    }
  }
}
