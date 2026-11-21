import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth';
import { validateImageMagicBytes } from '../lib/magic-bytes';
import type { Env, HonoVariables } from '../types';

export const mediaRoutes = new Hono<{ Bindings: Env; Variables: HonoVariables }>();

// Upload custom image for site (100% Free: up to 50 images, 25MB total)
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

    // Free generous limits for all users:
    const maxImages = 50;
    const maxTotalBytes = 25 * 1024 * 1024; // 25 MB
    const maxSingleBytes = 2 * 1024 * 1024;  // 2 MB per image

    // 2. Read binary body
    const rawBuffer = await c.req.arrayBuffer();
    const bytes = new Uint8Array(rawBuffer);

    if (bytes.length > maxSingleBytes) {
      return c.json({ error: 'Payload Too Large: Images must be under 2 MB each.' }, 413);
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
        { error: `Media upload limit reached (${maxImages} images). Please delete existing media to upload more.` },
        413
      );
    }

    if (currentBytes + bytes.length > maxTotalBytes) {
      return c.json(
        { error: `Storage limit reached (25 MB total). Please delete existing media to free up space.` },
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
