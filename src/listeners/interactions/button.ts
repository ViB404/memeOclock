import { Listener } from "@sapphire/framework";
import {
  ActionRowBuilder,
  MessageFlags,
  type ButtonBuilder,
  type ButtonInteraction,
} from "discord.js";

import { db } from "../../database/db";
import { generateVoteButton, topggRow } from "../../components/meme-send";
import type { VoteType } from "../../type";
import { parseVoteButtonData } from "../../utils/voteButtonParse";
import { EMOJIS } from "../../constants/emojis";

async function getVoteCount(
  memeId: string,
): Promise<{ likes: number; dislikes: number }> {
  const vote = db
    .prepare(
      `
      SELECT likes, dislikes
      FROM votes
      WHERE meme_id = ?
    `,
    )
    .get(memeId) as {
    likes: number;
    dislikes: number;
  };

  return {
    likes: vote.likes,
    dislikes: vote.dislikes,
  };
}

async function registerVote(action: VoteType, memeId: string, userId: string) {
  const vote = db
    .prepare(
      `
      SELECT *
      FROM votes
      WHERE meme_id = ?
    `,
    )
    .get(memeId) as {
    meme_id: string;
    likes: number;
    dislikes: number;
    voters: string;
  };

  const voters: string[] = JSON.parse(vote.voters);

  if (voters.includes(userId)) {
    return {
      success: false as const,
      reason: "already_voted",
    };
  }

  voters.push(userId);

  db.prepare(
    `
      UPDATE votes
      SET
        likes = likes + ?,
        dislikes = dislikes + ?,
        voters = ?
      WHERE meme_id = ?
    `,
  ).run(
    action === "like" ? 1 : 0,
    action === "dislike" ? 1 : 0,
    JSON.stringify(voters),
    memeId,
  );

  const updatedVote = db
    .prepare(
      `
      SELECT likes, dislikes
      FROM votes
      WHERE meme_id = ?
    `,
    )
    .get(memeId) as {
    likes: number;
    dislikes: number;
  };

  return {
    success: true as const,
    likes: updatedVote.likes,
    dislikes: updatedVote.dislikes,
  };
}

export class ButtonListener extends Listener {
  public constructor(
    context: Listener.LoaderContext,
    options: Listener.Options,
  ) {
    super(context, {
      ...options,
      event: "interactionCreate",
    });
  }

  public override async run(interaction: ButtonInteraction) {
    if (!interaction.isButton()) return;

    const { action, memeId, expiresAt } = parseVoteButtonData(
      interaction.customId,
    );

    if (action !== "like" && action !== "dislike") {
      return;
    }

    if (Date.now() > Number(expiresAt)) {
      const { likes, dislikes } = await getVoteCount(memeId);

      const disabledVoteRow =
        new ActionRowBuilder<ButtonBuilder>().addComponents(
          generateVoteButton({
            action: "like",
            memeId,
            expiresAt,
            count: likes,
          }).setDisabled(true),

          generateVoteButton({
            action: "dislike",
            memeId,
            expiresAt,
            count: dislikes,
          }).setDisabled(true),
        );

      await interaction.update({
        components: [disabledVoteRow, topggRow],
      });

      await interaction.followUp({
        content: `${EMOJIS.warning} Voting period has ended.`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const result = await registerVote(action, memeId, interaction.user.id);

    if (!result.success) {
      return interaction.reply({
        content: `${EMOJIS.warning} You have already voted on this meme.`,
        flags: MessageFlags.Ephemeral,
      });
    }

    const updatedVoteRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
      generateVoteButton({
        action: "like",
        memeId,
        expiresAt,
        count: result.likes,
      }),

      generateVoteButton({
        action: "dislike",
        memeId,
        expiresAt,
        count: result.dislikes,
      }),
    );

    await interaction.update({
      components: [updatedVoteRow, topggRow],
    });
  }
}
