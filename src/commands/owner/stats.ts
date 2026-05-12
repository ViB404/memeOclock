import { Command } from "@sapphire/framework";

import { EmbedBuilder, MessageFlags } from "discord.js";
import ms from "ms";
import { DEV_GUILD_ID } from "../../config/owners";

export default class StatsCommand extends Command {
  public constructor(context: Command.LoaderContext, options: Command.Options) {
    super(context, {
      ...options,
      preconditions: ["OwnerOnly"],
    });
  }

  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand(
      (builder) =>
        builder.setName("stats").setDescription("View bot statistics"),
      {
        guildIds: [DEV_GUILD_ID],
      },
    );
  }

  public override async chatInputRun(
    interaction: Command.ChatInputCommandInteraction,
  ) {
    const client = this.container.client;

    const guilds = client.guilds.cache.size;

    const users = client.guilds.cache.reduce(
      (acc, guild) => acc + guild.memberCount,
      0,
    );

    const uptime = ms(client.uptime ?? 0);

    const embed = new EmbedBuilder()
      .setTitle("📊 Bot Statistics")
      .setColor("Blurple")
      .addFields(
        {
          name: "🌍 Servers",
          value: guilds.toString(),
          inline: true,
        },
        {
          name: "👥 Users",
          value: users.toLocaleString(),
          inline: true,
        },
        {
          name: "🏓 Ping",
          value: `${Math.round(client.ws.ping)}ms`,
          inline: true,
        },
        {
          name: "⏳ Uptime",
          value: uptime,
        },
      )
      .setTimestamp();

    return interaction.reply({
      embeds: [embed],
      flags: [MessageFlags.Ephemeral],
    });
  }
}
