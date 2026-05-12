import { Precondition } from "@sapphire/framework";

import type { ChatInputCommandInteraction } from "discord.js";

import { OWNERS } from "../config/owners";

export class OwnerOnlyPrecondition extends Precondition {
  public override chatInputRun(interaction: ChatInputCommandInteraction) {
    return OWNERS.includes(interaction.user.id)
      ? this.ok()
      : this.error({
          message: "❌ This command is owner only.",
        });
  }
}
