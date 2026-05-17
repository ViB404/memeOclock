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
