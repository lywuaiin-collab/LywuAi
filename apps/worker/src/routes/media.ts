import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth';
import { validateImageMagicBytes } from '../lib/magic-bytes';
import { getUserPlanInfo } from '../lib/subscription';
import type { Env, HonoVariables } from '../types';

export const mediaRoutes = new Hono<{ Bindings: Env; Variables: HonoVariables }>();

// Upload custom image for site (enforces tiered quotas)
mediaRoutes.post('/sites/:id/media', authMiddleware, async (c) => {
  try {
    const authUser = c.get('user');
    const siteId = c.req.param('id');

    // 1. Verify site ownership
    const site = await c.env.DB.prepare('SELECT id FROM sites WHERE id = ? AND owner_id = ?')
      .bind(siteId, authUser.userId)
      .first<{ id: string }>();

    if (!site) {
      return c.json({ error: 'Site not found or access denied' }, 404);
    }

    // 2. Fetch user plan & trial
    const planInfo = await getUserPlanInfo(c.env.DB, authUser.userId);
    if (!planInfo.isPro && planInfo.trial.expired) {
      return c.json(
        { error: 'Your 15-day free trial has expired. Upgrade to Pro or Business to continue uploading media.' },
        403
      );
    }

    // Tier limits:
    // Free: max 3 images, 1 MB total, 200 KB/image
    // Pro: max 25 images, 10 MB total, 1 MB/image
    // Business: max 100 images, 50 MB total, 2 MB/image
    const maxImages = planInfo.isBusiness ? 100 : planInfo.isPro ? 25 : 3;
    const maxTotalBytes = (planInfo.isBusiness ? 50 : planInfo.isPro ? 10 : 1) * 1024 * 1024;
    const maxSingleBytes = (planInfo.isBusiness ? 2 : planInfo.isPro ? 1 : 0.2) * 1024 * 1024;

    // 3. Read binary body
    const rawBuffer = await c.req.arrayBuffer();
    const bytes = new Uint8Array(rawBuffer);

    if (bytes.length > maxSingleBytes) {
      const limitStr = planInfo.isBusiness ? '2 MB' : planInfo.isPro ? '1 MB' : '200 KB';
      return c.json({ error: `Payload Too Large: Images on your plan must be under ${limitStr}.` }, 413);
    }

    // 4. Enforce count and storage quotas
    const stats = await c.env.MEDIA_DB.prepare(
      'SELECT COUNT(*) as count, SUM(size_bytes) as total_bytes FROM media WHERE site_id = ?'
    )
      .bind(siteId)
      .first<{ count: number; total_bytes: number | null }>();

    const currentCount = stats?.count || 0;
    const currentBytes = stats?.total_bytes || 0;

    if (currentCount >= maxImages) {
      return c.json(
        { error: `Media upload limit reached (${maxImages} images for ${planInfo.plan.toUpperCase()} plan). Upgrade for more storage.` },
        413
      );
    }

    if (currentBytes + bytes.length > maxTotalBytes) {
      return c.json(
        { error: `Storage limit reached for your plan. Please upgrade or delete existing media.` },
        413
      );
    }

    // 5. Validate magic bytes
    const validation = validateImageMagicBytes(bytes);
    if (!validation.valid || !validation.contentType) {
      return c.json({ error: 'Invalid file format. Only valid JPEG, PNG, or WebP images are allowed.' }, 400);
    }

    const mediaId = crypto.randomUUID();
    const filename = c.req.header('X-Filename') || `image-${mediaId.substring(0, 8)}.webp`;

    // 5. Store BLOB in D1 media database
    await c.env.MEDIA_DB.prepare(
      `INSERT INTO media (id, site_id, owner_id, filename, content_type, size_bytes, blob, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`
    )
      .bind(mediaId, siteId, authUser.userId, filename, validation.contentType, bytes.length, bytes)
      .run();

    const mediaUrl = `/media/${mediaId}`;

    return c.json({
      id: mediaId,
      url: mediaUrl,
      filename,
      sizeBytes: bytes.length,
      contentType: validation.contentType,
    }, 201);
  } catch (err: any) {
    return c.json({ error: err?.message || 'Media upload failed' }, 500);
  }
});

// Serve cached media blob (Public Endpoint)
mediaRoutes.get('/media/:id', async (c) => {
  const mediaId = c.req.param('id');

  // Check Cloudflare Edge Cache first
  const cacheKey = new Request(c.req.url, c.req.raw);
  const cache = caches.default;
  const cachedResponse = await cache.match(cacheKey);
  if (cachedResponse) {
    return cachedResponse;
  }

  const row = await c.env.MEDIA_DB.prepare(
    'SELECT content_type, blob FROM media WHERE id = ?'
  )
    .bind(mediaId)
    .first<{ content_type: string; blob: ArrayBuffer | Uint8Array }>();

  if (!row || !row.blob) {
    return c.text('Image Not Found', 404);
  }

  const response = new Response(row.blob, {
    status: 200,
    headers: {
      'Content-Type': row.content_type || 'image/webp',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });

  // Store in Cloudflare Edge Cache
  c.executionCtx.waitUntil(cache.put(cacheKey, response.clone()));
  return response;
});
