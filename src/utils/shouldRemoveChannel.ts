import { DiscordAPIError } from "discord.js";

export function shouldRemoveChannel(error: unknown): boolean {
  if (error instanceof Error) {
    switch (error.message) {
      case "MISSING_PERMISSIONS":
      case "INVALID_CHANNEL":
      case "BOT_NOT_IN_GUILD":
        return true;
    }
  }

  if (!(error instanceof DiscordAPIError)) {
    return false;
  }

  return [
    50001, // Missing Access
    50013, // Missing Permissions
    10003, // Unknown Channel
    10004, // Unknown Guild
  ].includes(Number(error.code));
}
