import { getClient } from './db.js';
import { parseBody, verifyPassword, signToken, withErrorHandling, json } from './utils.js';

export default withErrorHandling(async (req, res) => {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    return res.end('Method not allowed');
  }
  const body = await parseBody(req);
  const { email, password } = body;
  const sql = getClient();
  const rows = await sql`SELECT * FROM users WHERE email = ${email} LIMIT 1`;
  const user = rows[0];
  if (!user) return res.end('Invalid credentials');
  const ok = await verifyPassword(password, user.password_hash);
  if (!ok) return res.end('Invalid credentials');
  const token = signToken({ id: user.id, email: user.email });
  const sessions = await sql`SELECT * FROM game_sessions WHERE user_id = ${user.id} ORDER BY finished_at DESC LIMIT 50`;
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
    sessions: sessions.map((s) => ({
      id: s.id,
      gameType: s.game_type,
      startedAt: s.started_at,
      finishedAt: s.finished_at,
      score: s.score,
      mistakes: s.mistakes,
      details: s.details,
    })),
  });
});
