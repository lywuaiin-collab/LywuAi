import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth';
import { verifyTurnstileToken } from '../lib/turnstile';
import { submissionInputSchema } from '@lywuai/shared';
import type { Env, HonoVariables } from '../types';

export const submissionRoutes = new Hono<{ Bindings: Env; Variables: HonoVariables }>();

// Public endpoint for submitting contact form on published website
submissionRoutes.post('/sites/:slug/submissions', async (c) => {
  try {
    const slug = c.req.param('slug');
    const body = await c.req.json();

    const parseResult = submissionInputSchema.safeParse(body);
    if (!parseResult.success) {
      return c.json({ error: parseResult.error.errors[0]?.message || 'Invalid form input' }, 400);
    }

    const { name, email, phone, message, turnstileToken } = parseResult.data;

    // Verify site exists
    const site = await c.env.DB.prepare('SELECT id FROM sites WHERE slug = ?')
      .bind(slug)
      .first<{ id: string }>();

    if (!site) {
      return c.json({ error: 'Site not found' }, 404);
    }

    // Verify Cloudflare Turnstile token
    const clientIp = c.req.header('CF-Connecting-IP') || '';
    const turnstileValid = await verifyTurnstileToken(turnstileToken || '', c.env.TURNSTILE_SECRET_KEY, clientIp);

    if (!turnstileValid && c.env.TURNSTILE_SECRET_KEY) {
      return c.json({ error: 'Security verification failed. Please try again.' }, 403);
    }

    // Store submission in D1
    const submissionId = crypto.randomUUID();
    await c.env.DB.prepare(
      `INSERT INTO submissions (id, site_id, name, email, phone, message, ip_hash, read, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 0, CURRENT_TIMESTAMP)`
    )
      .bind(submissionId, site.id, name, email, phone || null, message, clientIp.substring(0, 10))
      .run();

    return c.json({ success: true, message: 'Message sent successfully' }, 201);
  } catch (err: any) {
    return c.json({ error: err?.message || 'Submission failed' }, 500);
  }
});

// Protected: Site owner views submissions
submissionRoutes.get('/sites/:id/submissions', authMiddleware, async (c) => {
  try {
    const authUser = c.get('user');
    const siteId = c.req.param('id');

    // Verify site ownership
    const site = await c.env.DB.prepare('SELECT id FROM sites WHERE id = ? AND owner_id = ?')
      .bind(siteId, authUser.userId)
      .first<{ id: string }>();

    if (!site) {
      return c.json({ error: 'Site not found' }, 404);
    }

    const submissions = await c.env.DB.prepare(
      'SELECT id, name, email, phone, message, read, created_at FROM submissions WHERE site_id = ? ORDER BY created_at DESC LIMIT 100'
    )
      .bind(siteId)
      .all();

    return c.json({ submissions: submissions.results });
  } catch (err: any) {
    return c.json({ error: err?.message || 'Failed to fetch submissions' }, 500);
  }
});

// Mark submission as read
submissionRoutes.patch('/submissions/:id/read', authMiddleware, async (c) => {
  try {
    const submissionId = c.req.param('id');
    await c.env.DB.prepare('UPDATE submissions SET read = 1 WHERE id = ?').bind(submissionId).run();
    return c.json({ success: true });
  } catch (err: any) {
    return c.json({ error: err?.message || 'Update failed' }, 500);
  }
});
