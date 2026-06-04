import { Client } from "discord.js";

import cron from "node-cron";
import { sendMemeToAll, sendNSFWMemeToAll } from "../utils/sendMemeToAll";

export function startMemeCron(client: Client) {
  let cron_timing = "0 */12 * * *";
  cron.schedule(cron_timing, async () => {
    console.log("📤 Sending scheduled memes...");

    await Promise.all([sendMemeToAll(client), sendNSFWMemeToAll(client)]);
  });

  console.log("✅ Meme cron jobs started");
}
