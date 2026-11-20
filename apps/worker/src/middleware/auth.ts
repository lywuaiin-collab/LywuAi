import { createMiddleware } from 'hono/factory';
import { verifyJwt } from '../lib/crypto';
import type { Env, HonoVariables } from '../types';

export const authMiddleware = createMiddleware<{ Bindings: Env; Variables: HonoVariables }>(
  async (c, next) => {
    let token: string | undefined;

    // 1. Authorization Bearer header
    const authHeader = c.req.header('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7).trim();
    }

    // 2. Cookie header
    if (!token) {
      const cookieHeader = c.req.header('Cookie');
      if (cookieHeader) {
        const cookies = Object.fromEntries(
          cookieHeader.split(';').map((pair) => {
            const [k, v] = pair.trim().split('=');
            return [k, decodeURIComponent(v || '')];
          })
        );
        token = cookies['auth_token'];
      }
    }

    if (!token) {
      return c.json({ error: 'Unauthorized: Please sign in' }, 401);
    }

    const payload = await verifyJwt(token, c.env.SESSION_SECRET);
    if (!payload) {
      return c.json({ error: 'Unauthorized: Session expired or invalid' }, 401);
    }

    c.set('user', payload);
    await next();
  }
);
