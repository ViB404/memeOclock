import {
  GuildAuditLogsLimits,
  isMessageInstance,
} from "@sapphire/discord.js-utilities";
import { Command } from "@sapphire/framework";
import { MessageFlags } from "discord.js";
import { GUILD_ID } from "..";

export class PingCommand extends Command {
  public constructor(context: Command.LoaderContext, options: Command.Options) {
    super(context, { ...options });
  }

  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand(
      (builder) =>
        builder
          .setName("ping")
          .setDescription("Ping bot to see if it is alive"),
      {
        // ...(process.env.PROD ? { guildIds: [GUILD_ID] } : {}),
        idHints: ["1501103001245450290"],
      },
    );
  }

  public override async chatInputRun(
    interaction: Command.ChatInputCommandInteraction,
  ) {
    const callbackResponse = await interaction.reply({
      content: `Ping?`,
      withResponse: true,
      flags: MessageFlags.Ephemeral,
    });
    const msg = callbackResponse.resource?.message;

    if (msg && isMessageInstance(msg)) {
      const diff = msg.createdTimestamp - interaction.createdTimestamp;
      const ping = Math.round(this.container.client.ws.ping);
      return interaction.editReply(
        `Pong 🏓! (Round trip took: ${diff}ms. Heartbeat: ${ping}ms.)`,
      );
    }

    return interaction.editReply("Failed to retrieve ping :(");
  }
}
