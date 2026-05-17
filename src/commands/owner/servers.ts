import { Command } from "@sapphire/framework";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  EmbedBuilder,
  MessageFlags,
} from "discord.js";

import { DEV_GUILD_ID } from "../../config/owners";
import { db } from "../../database/db";
import { EMOJIS } from "../../constants/emojis";

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
          .setName("servers")
          .setDescription("View all bot servers with configs"),
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

    const guilds = this.container.client.guilds.cache;

    const memeRows = db
      .query(
        `
        SELECT guild_id, channel_id
        FROM meme_channels
      `,
      )
      .all() as {
      guild_id: string;
      channel_id: string;
    }[];

    const nsfwRows = db
      .query(
        `
        SELECT guild_id, channel_id
        FROM nsfw_channels
        WHERE enabled = 1
      `,
      )
      .all() as {
      guild_id: string;
      channel_id: string;
    }[];

    const pages: string[] = [];
    let currentPage = "";

    for (const guild of guilds.values()) {
      const memeSetup = memeRows.find((x) => x.guild_id === guild.id);

      const nsfwSetup = nsfwRows.find((x) => x.guild_id === guild.id);

      const owner = await guild.fetchOwner().catch(() => null);

      const block = [
        `## ${guild.name}`,
        `🆔 \`${guild.id}\``,
        `👑 Owner: ${
          owner ? `${owner.user.username} (${owner.id})` : "Unknown"
        }`,
        `👥 Members: ${guild.memberCount}`,
        `📚 Channels: ${guild.channels.cache.size}`,
        `😂 Meme Channel: ${
          memeSetup ? `<#${memeSetup.channel_id}>` : "Not setup"
        }`,
        `🔞 NSFW Channel: ${
          nsfwSetup ? `<#${nsfwSetup.channel_id}>` : "Not setup"
        }`,
      ].join("\n");

      if ((currentPage + block).length > 3500) {
        pages.push(currentPage);
        currentPage = "";
      }

      currentPage += `${block}\n\n`;
    }

    if (currentPage.length > 0) {
      pages.push(currentPage);
    }

    let page = 0;

    const getEmbed = () =>
      new EmbedBuilder()
        .setTitle(`🌍 Bot Servers (${guilds.size})`)
        .setDescription(pages[page] || "No servers found.")
        .setColor("Blurple")
        .setFooter({
          text: `Page ${page + 1}/${pages.length} • MemeOClock Analytics`,
        })
        .setTimestamp();

    const getButtons = () =>
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId("prev")
          .setLabel("Previous")
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(page === 0),

        new ButtonBuilder()
          .setCustomId("next")
          .setLabel("Next")
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(page === pages.length - 1),
      );

    const response = await interaction.editReply({
      embeds: [getEmbed()],
      components: pages.length > 1 ? [getButtons()] : [],
    });

    if (pages.length <= 1) return;

    const collector = response.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 5 * 60 * 1000,
    });

    collector.on("collect", async (i) => {
      if (i.user.id !== interaction.user.id) {
        return i.reply({
          content: `${EMOJIS.error} You cannot use this button.`,
          flags: MessageFlags.Ephemeral,
        });
      }

      if (i.customId === "prev") {
        page--;
      }

      if (i.customId === "next") {
        page++;
      }

      await i.update({
        embeds: [getEmbed()],
        components: [getButtons()],
      });
    });

    collector.on("end", async () => {
      await interaction
        .editReply({
          components: [],
        })
        .catch(() => null);
    });
  }
}
