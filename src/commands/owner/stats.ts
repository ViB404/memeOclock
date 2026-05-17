import { Command } from "@sapphire/framework";

import { EmbedBuilder, MessageFlags } from "discord.js";

import ms from "ms";

import { DEV_GUILD_ID } from "../../config/owners";

import { db } from "../../database/db";

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
        builder.setName("stats").setDescription("View advanced bot statistics"),
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

    const client = this.container.client;

    // Discord stats
    const guilds = client.guilds.cache.size;

    const users = client.guilds.cache.reduce(
      (acc, guild) => acc + guild.memberCount,
      0,
    );

    const uptime = ms(client.uptime ?? 0);

    const ping = Math.round(client.ws.ping);

    // Database stats
    const memeChannels = db
      .query(
        `
      SELECT COUNT(*) as count
      FROM meme_channels
    `,
      )
      .get() as {
      count: number;
    };

    const nsfwChannels = db
      .query(
        `
      SELECT COUNT(*) as count
      FROM nsfw_channels
      WHERE enabled = 1
    `,
      )
      .get() as {
      count: number;
    };

    const seenMemes = db
      .query(
        `
      SELECT COUNT(*) as count
      FROM seen_memes
    `,
      )
      .get() as {
      count: number;
    };

    // Memory usage
    const memoryUsage = process.memoryUsage();

    const ramUsed = (memoryUsage.heapUsed / 1024 / 1024).toFixed(2);

    const ramTotal = (memoryUsage.heapTotal / 1024 / 1024).toFixed(2);

    // Shard-ish fake analytics
    const avgUsersPerGuild = Math.floor(users / Math.max(guilds, 1));

    // Health status
    const health =
      ping < 150 ? "🟢 Excellent" : ping < 300 ? "🟡 Decent" : "🔴 Dying";

    const embed = new EmbedBuilder()
      .setTitle("📊 MemeOClock Statistics")
      .setColor("Blurple")
      .addFields(
        {
          name: "🌍 Servers",
          value: guilds.toLocaleString(),
          inline: true,
        },
        {
          name: "👥 Users",
          value: users.toLocaleString(),
          inline: true,
        },
        {
          name: "📈 Avg Users/Guild",
          value: avgUsersPerGuild.toString(),
          inline: true,
        },

        {
          name: "😂 Meme Channels",
          value: memeChannels.count.toString(),
          inline: true,
        },
        {
          name: "🔞 NSFW Channels",
          value: nsfwChannels.count.toString(),
          inline: true,
        },
        {
          name: "🧠 Seen Memes",
          value: seenMemes.count.toLocaleString(),
          inline: true,
        },

        {
          name: "🏓 Ping",
          value: `${ping}ms`,
          inline: true,
        },
        {
          name: "💾 RAM Usage",
          value: `${ramUsed}MB / ${ramTotal}MB`,
          inline: true,
        },
        {
          name: "⚡ Health",
          value: health,
          inline: true,
        },

        {
          name: "⏳ Uptime",
          value: uptime,
        },
      )
      .setFooter({
        text: `MemeOClock Owner Panel`,
      })
      .setTimestamp();

    return interaction.editReply({
      embeds: [embed],
    });
  }
}
