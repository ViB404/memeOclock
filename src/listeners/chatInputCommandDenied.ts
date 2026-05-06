import { Listener, UserError, Identifiers } from "@sapphire/framework";
import { EmbedBuilder } from "discord.js";

function formatPermissions(error: UserError): string {
  const context = error.context as {
    missing: string[];
  };

  return context.missing
    .map((p) => `- ${p.replace(/([A-Z])/g, " $1").trim()}`)
    .join("\n");
}

export class ChatInputCommandDeniedListener extends Listener {
  public constructor(
    context: Listener.LoaderContext,
    options: Listener.Options,
  ) {
    super(context, {
      ...options,
      event: "chatInputCommandDenied",
    });
  }

  public async run(error: UserError, { interaction }: any) {
    if (interaction.replied || interaction.deferred) {
      return;
    }

    if (error instanceof UserError) {
      if (error.identifier === Identifiers.PreconditionUserPermissions) {
        const embed = new EmbedBuilder()
          .setTitle("❌ Missing Permissions")
          .setDescription(
            `You are missing the following permissions:\n\n${formatPermissions(error)}`,
          )
          .setColor("Red");

        return interaction.reply({
          embeds: [embed],
          flags: ["Ephemeral"],
        });
      }

      if (error.identifier === Identifiers.PreconditionClientPermissions) {
        const embed = new EmbedBuilder()
          .setTitle("⚠️ Bot Missing Permissions")
          .setDescription(
            `I need the following permissions:\n\n${formatPermissions(error)}`,
          )
          .setColor("Orange");

        return interaction.reply({
          embeds: [embed],
          flags: ["Ephemeral"],
        });
      }
    }

    const embed = new EmbedBuilder()
      .setTitle("❌ Command Denied")
      .setDescription("You cannot use this command.")
      .setColor("Red");

    return interaction.reply({
      embeds: [embed],
      flags: ["Ephemeral"],
    });
  }
}
