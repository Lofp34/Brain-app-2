import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { ensureSchema, getClient } from './db.js';

const ITERATIONS = 310000;
const KEY_LEN = 32;
const DIGEST = 'sha256';

export const hashPassword = (password) =>
  new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString('hex');
    crypto.pbkdf2(password, salt, ITERATIONS, KEY_LEN, DIGEST, (err, derivedKey) => {
      if (err) return reject(err);
      resolve(`${salt}:${derivedKey.toString('hex')}`);
    });
  });

export const verifyPassword = (password, hash) =>
  new Promise((resolve, reject) => {
    const [salt, key] = hash.split(':');
    crypto.pbkdf2(password, salt, ITERATIONS, KEY_LEN, DIGEST, (err, derivedKey) => {
      if (err) return reject(err);
      resolve(crypto.timingSafeEqual(Buffer.from(key, 'hex'), derivedKey));
    });
  });

const getSecret = () => {
  if (process.env.AUTH_SECRET) return process.env.AUTH_SECRET;
  if (process.env.STACK_SECRET_SERVER_KEY) return process.env.STACK_SECRET_SERVER_KEY;
  if (process.env.DATABASE_URL) return crypto.createHash('sha256').update(process.env.DATABASE_URL).digest('hex');
  throw new Error('AUTH_SECRET missing');
};

export const signToken = (payload) => jwt.sign(payload, getSecret(), { expiresIn: '30d' });
export const verifyToken = (token) => jwt.verify(token, getSecret());

export const parseBody = async (req) => {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return JSON.parse(Buffer.concat(chunks).toString());
};

export const withErrorHandling = (handler) => async (req, res) => {
  try {
    await ensureSchema();
    await handler(req, res);
  } catch (err) {
    console.error(err);
    res.statusCode = err?.status || 500;
    res.end(err?.message || 'Unexpected error');
  }
};

export const getUserFromRequest = async (req) => {
  const auth = req.headers['authorization'];
  if (!auth) throw Object.assign(new Error('Unauthorized'), { status: 401 });
  const [, token] = auth.split(' ');
  const payload = verifyToken(token);
  const sql = getClient();
  const users = await sql`SELECT * FROM users WHERE id = ${payload.id} LIMIT 1`;
  if (!users.length) throw Object.assign(new Error('Unauthorized'), { status: 401 });
  return users[0];
};

export const json = (res, status, data) => {
  res.setHeader('Content-Type', 'application/json');
  res.statusCode = status;
  res.end(JSON.stringify(data));
};
