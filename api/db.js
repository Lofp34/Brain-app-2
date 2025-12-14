import { neon } from '@neondatabase/serverless';

let cachedClient;

export const getClient = () => {
  if (cachedClient) return cachedClient;
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL missing');
  }
  cachedClient = neon(process.env.DATABASE_URL);
  return cachedClient;
};

export const ensureSchema = async () => {
  const sql = getClient();
  await sql`CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    settings JSONB DEFAULT '{"theme":"dark","sound":true,"mathDuration":1,"mathDifficulty":"easy","memoryCardCount":8}',
    stats JSONB DEFAULT '{"totalSessions":0,"totalTimeMinutes":0,"streak":0}'
  );`;

  await sql`CREATE TABLE IF NOT EXISTS game_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    game_type TEXT NOT NULL,
    started_at TIMESTAMPTZ NOT NULL,
    finished_at TIMESTAMPTZ NOT NULL,
    score INTEGER NOT NULL,
    mistakes INTEGER NOT NULL,
    details JSONB NOT NULL
  );`;
};
