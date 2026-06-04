import type { VoteButtonData, VoteType } from "../type";

export function parseVoteButtonData(customId: string): VoteButtonData {
  const [action, memeId, expiresAt] = customId.split(":");

  if (!memeId) throw new Error("Invalid customId");

  return {
    action: action as VoteType,
    memeId,
    expiresAt: Number(expiresAt),
  };
}
