import { Client } from "discord.js";
import cron from "node-cron";

import { sendMemeToAll, sendNSFWMemeToAll } from "../meme/sendMemeToAll";
import { sendWeeklyMeme, sendWeeklyNSFWMeme } from "../meme/sendWeeklyMeme";

export function startMemeCron(client: Client) {
  cron.schedule("0 */12 * * *", async () => {
    await Promise.all([
      sendMemeToAll(client),
      sendNSFWMemeToAll(client),
    ]);
  });

  cron.schedule("0 9 * * 0", async () => {
    await Promise.all([
      sendWeeklyMeme(client),
      sendWeeklyNSFWMeme(client),
    ]);
  });
}
