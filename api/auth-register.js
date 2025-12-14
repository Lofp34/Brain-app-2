import { getClient } from './db.js';
import { hashPassword, signToken, parseBody, withErrorHandling, json } from './utils.js';
import { v4 as uuidv4 } from 'uuid';

export default withErrorHandling(async (req, res) => {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    return res.end('Method not allowed');
  }
  const sql = getClient();
  const body = await parseBody(req);
  const { email, password, name } = body;
  if (!email || !password || !name) {
    res.statusCode = 400;
    return res.end('Missing fields');
  }
  const existing = await sql`SELECT id FROM users WHERE email = ${email}`;
  if (existing.length) {
    res.statusCode = 400;
    return res.end('User already exists');
  }
  const password_hash = await hashPassword(password);
  const defaults = {
    settings: {
      theme: 'dark',
      sound: true,
      mathDuration: 1,
      mathDifficulty: 'easy',
      memoryCardCount: 8,
    },
    stats: { totalSessions: 0, totalTimeMinutes: 0, streak: 0 },
  };
  const rows = await sql`INSERT INTO users (email, password_hash, name, settings, stats) VALUES (${email}, ${password_hash}, ${name}, ${defaults.settings}, ${defaults.stats}) RETURNING *`;
  const user = rows[0];
  const token = signToken({ id: user.id, email: user.email });
  json(res, 200, {
    token,
    profile: {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.created_at,
      settings: user.settings,
      stats: user.stats,
    },
    sessions: [],
  });
});
