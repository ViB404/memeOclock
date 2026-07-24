import { Database } from "bun:sqlite";

export const db = new Database("meme.db");

db.run(`
  CREATE TABLE IF NOT EXISTS meme_channels (
    guild_id TEXT PRIMARY KEY,
    channel_id TEXT NOT NULL
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS seen_memes (
    id TEXT PRIMARY KEY
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS nsfw_channels (
    guild_id TEXT PRIMARY KEY,
    channel_id TEXT NOT NULL,
    enabled INTEGER DEFAULT 1
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS votes (
    meme_id TEXT PRIMARY KEY,

    title TEXT NOT NULL,
    url TEXT NOT NULL,
    post_link TEXT NOT NULL,
    subreddit TEXT NOT NULL,

    is_nsfw INTEGER NOT NULL DEFAULT 0,
    likes INTEGER NOT NULL DEFAULT 0,
    dislikes INTEGER NOT NULL DEFAULT 0,
    voters TEXT NOT NULL DEFAULT '[]',

    created_at INTEGER NOT NULL DEFAULT (unixepoch())
  )
`);
