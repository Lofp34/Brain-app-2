import { getClient } from './db.js';
import { getUserFromRequest, withErrorHandling, json } from './utils.js';

export default withErrorHandling(async (req, res) => {
  if (req.method !== 'GET') {
    res.statusCode = 405;
    return res.end('Method not allowed');
  }
  const user = await getUserFromRequest(req);
  const sql = getClient();
  const sessions = await sql`SELECT * FROM game_sessions WHERE user_id = ${user.id} ORDER BY finished_at DESC LIMIT 50`;
  json(res, 200, {
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
