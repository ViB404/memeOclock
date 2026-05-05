import { SapphireClient } from "@sapphire/framework";
import { GatewayIntentBits } from "discord.js";
import chalk from "chalk";
import { startMemeCron } from "./schedule/cron-job";

let DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
export const GUILD_ID = process.env.GUILD_ID || "1281588218609012746";

const client = new SapphireClient({
  intents: [
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
  ],
  loadMessageCommandListeners: true,
});

client.on("clientReady", () => {
  startMemeCron(client);
  console.log(chalk.blue(`Client ready with ${client.user?.tag}`));
  console.log(chalk.green(`Client is ready at ${client.readyAt}`));
});

client.login(DISCORD_BOT_TOKEN);
