import { Listener } from "@sapphire/framework";
import { ActivityType } from "discord.js";

const QUOTES = [
  "your 0 rizz",
  "you still single",
  "your search history",
  "4am doomscrolling",
  "your situationship",
  "average discord user",
  "touch grass loser",
  "crying in vc",
  "ratio + L",
  "brainrot max",
  "unread dms",
  "your glow up failed",
  "mom checking phone",
  "lonely king",
  "skill issue",
  "therapy needed",
  "pretending to be fine",
];

let interval: NodeJS.Timeout;

export class ReadyListener extends Listener {
  public constructor(
    context: Listener.LoaderContext,
    options: Listener.Options,
  ) {
    super(context, {
      ...options,
      once: true,
      event: "clientReady",
    });
  }

  public run() {
    if (interval) clearInterval(interval);

    const updatePresence = () => {
      const client = this.container.client;

      const guildCount = client.guilds.cache.size;

      const userCount = client.guilds.cache.reduce(
        (acc, guild) => acc + (guild.memberCount ?? 0),
        0,
      );

      const randomQuote =
        QUOTES[Math.floor(Math.random() * QUOTES.length)] ?? "memes";

      const activities = [
        {
          name: `${guildCount} servers`,
          type: ActivityType.Watching,
        },
        {
          name: `${userCount.toLocaleString()} users`,
          type: ActivityType.Watching,
        },
        {
          name: randomQuote,
          type: ActivityType.Watching,
        },
        {
          name: "/setup-meme",
          type: ActivityType.Playing,
        },
      ] as const;

      const randomActivity =
        activities[Math.floor(Math.random() * activities.length)]!;

      client.user?.setPresence({
        status: "online",
        activities: [randomActivity],
      });
    };

    updatePresence();

    interval = setInterval(updatePresence, 60_000);
  }
}
