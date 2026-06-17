export const getNextMemeTime = (): number => {
  const now = new Date();

  const nextMeme = new Date(now);

  if (now.getHours() < 12) {
    nextMeme.setHours(12, 0, 0, 0);
  } else {
    nextMeme.setDate(nextMeme.getDate() + 1);
    nextMeme.setHours(0, 0, 0, 0);
  }

  const unix = Math.floor(nextMeme.getTime() / 1000);

  return unix;
};
