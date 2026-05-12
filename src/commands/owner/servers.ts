import { Command } from "@sapphire/framework";

import { EmbedBuilder, MessageFlags } from "discord.js";

import { DEV_GUILD_ID } from "../../config/owners";

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
        builder.setName("servers").setDescription("View all bot servers"),
      {
        guildIds: [DEV_GUILD_ID],
      },
    );
  }

  public override async chatInputRun(
    interaction: Command.ChatInputCommandInteraction,
  ) {
    const guilds = this.container.client.guilds.cache;

    const description = guilds
      .map((guild) => `- ${guild.name} (${guild.memberCount} users)`)
      .join("\n")
      .slice(0, 4000);

    const embed = new EmbedBuilder()
      .setTitle("🌍 Bot Servers")
      .setDescription(description || "No servers found.")
      .setColor("Blurple")
      .setTimestamp();

    return interaction.reply({
      embeds: [embed],
      flags: MessageFlags.Ephemeral,
    });
  }
}
