import { SapphireClient } from "@sapphire/framework";
import { GatewayIntentBits } from "discord.js";
import chalk from "chalk";
import { sendMemeToAll, sendNSFWMemeToAll } from "./meme/sendMemeToAll";
import { startMemeCron } from "./schedule/cron-job";
import { DiscordJSAdapter } from "@dstats/discord.js";
import { Stats } from "@dstats/sdk";
import { sendWeeklyMeme, sendWeeklyNSFWMeme } from "./meme/sendWeeklyMeme";

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
export const GUILD_ID = process.env.GUILD_ID || "1281588218609012746";

const client = new SapphireClient({
  intents: [
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
  ],
  loadMessageCommandListeners: true,
});

new Stats({
  apiKey: process.env.DSTATS_API_KEY!,
  adapter: new DiscordJSAdapter(client),
});

client.on("clientReady", async () => {
  // Test send all memes
  // await sendMemeToAll(client);
  // await sendNSFWMemeToAll(client);
  // await sendWeeklyMeme(client);
  // await sendWeeklyNSFWMeme(client);
  startMemeCron(client);
  console.log(chalk.blue(`Client ready with ${client.user?.tag}`));
  console.log(chalk.green(`Client is ready at ${client.readyAt}`));
});

client.login(DISCORD_BOT_TOKEN);
