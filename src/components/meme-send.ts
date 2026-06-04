import {
  EmbedBuilder,
  ButtonBuilder,
  ActionRowBuilder,
  ButtonStyle,
} from "discord.js";
import { getRandomColor } from "../utils/generate-color";
import type { Meme, VoteButtonGeneration } from "../type";
import { EMOJIS } from "../constants/emojis";
import { db } from "../database/db";

export const generateVoteButton = (data: VoteButtonGeneration) => {
  return new ButtonBuilder()
    .setCustomId(`${data.action}:${data.memeId}:${data.expiresAt}`)
    .setLabel(`${data.count}`)
    .setEmoji(data.action === "like" ? EMOJIS.like : EMOJIS.dislike)
    .setStyle(
      data.action === "like" ? ButtonStyle.Success : ButtonStyle.Danger,
    );
};

export const topggButton = new ButtonBuilder()
  .setLabel("Top.gg")
  .setURL("https://top.gg/bot/1501095370124693604/vote")
  .setStyle(ButtonStyle.Link)
  .setEmoji(EMOJIS.topgg);

export const topggRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
  topggButton,
);

export const generateMemeMessage = (meme: Meme, isNsfw: boolean) => {
  const expiresAt = Date.now() + 12 * 60 * 60 * 1000; // 12h

  const embed = new EmbedBuilder()
    .setColor(getRandomColor())
    .setAuthor({
      name: `r/${meme.subreddit}`,
    })
    .setTitle(meme.title.slice(0, 256))
    .setURL(meme.postLink)
    .setImage(meme.url)
    .setFooter({
      text: "Vote us on top.gg to support us",
    })
    .setTimestamp();

  const likeButton = generateVoteButton({
    memeId: meme.id,
    expiresAt,
    action: "like",
    count: 0,
  });

  const dislikeButton = generateVoteButton({
    memeId: meme.id,
    expiresAt,
    action: "dislike",
    count: 0,
  });

  const voteRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
    likeButton,
    dislikeButton,
  );

  return {
    embeds: [embed],
    components: [voteRow, topggRow],
  };
};
