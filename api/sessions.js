import { getClient } from './db.js';
import { getUserFromRequest, parseBody, withErrorHandling, json } from './utils.js';

export default withErrorHandling(async (req, res) => {
  const user = await getUserFromRequest(req);
  const sql = getClient();

  if (req.method === 'GET') {
    const sessions = await sql`SELECT * FROM game_sessions WHERE user_id = ${user.id} ORDER BY finished_at DESC LIMIT 50`;
    return json(res, 200, { sessions });
  }

  if (req.method === 'POST') {
    const body = await parseBody(req);
    const { gameType, startedAt, finishedAt, score, mistakes, details, id } = body;
    if (!gameType || !startedAt || !finishedAt) {
      res.statusCode = 400;
      return res.end('Missing fields');
    }
    const rows = await sql`INSERT INTO game_sessions (id, user_id, game_type, started_at, finished_at, score, mistakes, details) VALUES (${id}, ${user.id}, ${gameType}, ${startedAt}, ${finishedAt}, ${score}, ${mistakes}, ${details}) RETURNING *`;
    const session = rows[0];
    return json(res, 200, { session });
  }

  res.statusCode = 405;
  res.end('Method not allowed');
});
