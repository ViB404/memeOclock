import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  Emoji,
} from "discord.js";

import { EMOJIS } from "../constants/emojis";
import type { Meme, VoteButtonGeneration } from "../type";
import { getRandomColor } from "../utils/generate-color";
import type { WeeklyMeme } from "../meme/fetch_weekly_meme";

const VOTE_DURATION = 12 * 60 * 60 * 1000;

export const generateVoteButton = ({
  memeId,
  expiresAt,
  action,
  count,
}: VoteButtonGeneration) =>
  new ButtonBuilder()
    .setCustomId(`${action}:${memeId}:${expiresAt}`)
    .setLabel(String(count))
    .setEmoji(action === "like" ? EMOJIS.like : EMOJIS.dislike)
    .setStyle(action === "like" ? ButtonStyle.Success : ButtonStyle.Danger);

export const topggRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
  new ButtonBuilder()
    .setLabel("Vote on Top.gg")
    .setEmoji(EMOJIS.topgg)
    .setStyle(ButtonStyle.Link)
    .setURL("https://top.gg/bot/1501095370124693604/vote"),
);

export function generateMemeMessage(
  meme: Meme | WeeklyMeme,
  isNsfw = false, // For future use
  weekly = false,
) {
  const embed = new EmbedBuilder()
    .setColor(getRandomColor())
    .setAuthor({
      name: weekly ? `🏆 • r/${meme.subreddit}` : `r/${meme.subreddit}`,
    })
    .setTitle(meme.title.slice(0, 256))
    .setURL(meme.postLink)
    .setImage(meme.url)
    .setTimestamp();

  if (weekly && "likes" in meme) {
    const score = meme.likes - meme.dislikes;

    embed.setDescription(
      `${EMOJIS.like} **${meme.likes}** │ ${EMOJIS.dislike} **${meme.dislikes}** │ ⭐ **${score >= 0 ? "+" : ""}${score}**`,
    );

    embed.setFooter({
      text: "🏆 Most voted meme this week",
    });
  } else {
    embed.setFooter({
      text: "Vote below and support us on Top.gg ❤️",
    });
  }

  const components: ActionRowBuilder<ButtonBuilder>[] = [];

  if (!weekly) {
    const expiresAt = Date.now() + VOTE_DURATION;

    components.push(
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        generateVoteButton({
          memeId: meme.id,
          expiresAt,
          action: "like",
          count: 0,
        }),
        generateVoteButton({
          memeId: meme.id,
          expiresAt,
          action: "dislike",
          count: 0,
        }),
      ),
    );
  }

  components.push(topggRow);

  return {
    embeds: [embed],
    components,
  };
}
