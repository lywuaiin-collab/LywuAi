import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth';
import { getTemplate } from '@lywuai/templates';
import { getUserPlanInfo } from '../lib/subscription';
import type { Env, HonoVariables } from '../types';
import type { Site, SiteContent } from '@lywuai/shared';

export const siteRoutes = new Hono<{ Bindings: Env; Variables: HonoVariables }>();

siteRoutes.use('*', authMiddleware);

// List user sites
siteRoutes.get('/', async (c) => {
  try {
    const authUser = c.get('user');
    const sites = await c.env.DB.prepare(
      `SELECT id, name, slug, custom_domain, template_id, status, published_at, created_at, updated_at
       FROM sites
       WHERE owner_id = ?
       ORDER BY updated_at DESC`
    )
      .bind(authUser.userId)
      .all<Omit<Site, 'content_json' | 'published_html'>>();

    return c.json({ sites: sites.results });
  } catch (err: any) {
    return c.json({ error: err?.message || 'Failed to list sites' }, 500);
  }
});

// Create new site
siteRoutes.post('/', async (c) => {
  try {
    const authUser = c.get('user');
    const { name, template_id = 'business', slug } = await c.req.json();

    if (!name) {
      return c.json({ error: 'Site name is required' }, 400);
    }

    // 1. Check User Subscription and 15-day Trial Quotas
    const planInfo = await getUserPlanInfo(c.env.DB, authUser.userId);

    if (!planInfo.isPro && planInfo.trial.expired) {
      return c.json(
        { error: 'Your 15-day free trial has expired. Upgrade to Pro (₹249/mo) or Business (₹799/mo) to continue building.' },
        403
      );
    }

    // Site Limit: Every plan = 1 website per account
    const maxSites = 1;

    const countResult = await c.env.DB.prepare('SELECT COUNT(*) as count FROM sites WHERE owner_id = ?')
      .bind(authUser.userId)
      .first<{ count: number }>();

    const currentCount = countResult?.count || 0;
    if (currentCount >= maxSites) {
      return c.json(
        {
          error:
            'You already have a website on your account. Each account is limited to 1 website. ' +
            'Need a custom bespoke site? Contact GrowthMachine Studio at https://growthmachinestudio.com/',
        },
        403
      );
    }

    // 2. Format and verify unique slug
    let siteSlug = (slug || name)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    if (!siteSlug || siteSlug.length < 3) {
      siteSlug = `site-${crypto.randomUUID().substring(0, 6)}`;
    }

    const existingSlug = await c.env.DB.prepare('SELECT id FROM sites WHERE slug = ?')
      .bind(siteSlug)
      .first<{ id: string }>();

    if (existingSlug) {
      siteSlug = `${siteSlug}-${crypto.randomUUID().substring(0, 4)}`;
    }

    // 3. Load default template content
    const template = getTemplate(template_id);
    const content = JSON.parse(JSON.stringify(template.defaultContent)) as SiteContent;
    content.seo.title = `${name} - Official Website`;

    const siteId = crypto.randomUUID();

    await c.env.DB.prepare(
      `INSERT INTO sites (id, owner_id, name, slug, template_id, content_json, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, 'draft', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`
    )
      .bind(siteId, authUser.userId, name, siteSlug, template_id, JSON.stringify(content))
      .run();

    return c.json({
      site: {
        id: siteId,
        owner_id: authUser.userId,
        name,
        slug: siteSlug,
        template_id,
        content,
        status: 'draft',
      },
    }, 201);
  } catch (err: any) {
    return c.json({ error: err?.message || 'Failed to create site' }, 500);
  }
});

// Get site by ID
siteRoutes.get('/:id', async (c) => {
  try {
    const authUser = c.get('user');
    const siteId = c.req.param('id');

    const site = await c.env.DB.prepare(
      'SELECT id, owner_id, name, slug, custom_domain, template_id, content_json, published_at, status, created_at, updated_at FROM sites WHERE id = ? AND owner_id = ?'
    )
      .bind(siteId, authUser.userId)
      .first<Site>();

    if (!site) {
      return c.json({ error: 'Site not found' }, 404);
    }

    let parsedContent: SiteContent;
    try {
      parsedContent = JSON.parse(site.content_json);
    } catch {
      const template = getTemplate(site.template_id);
      parsedContent = template.defaultContent;
    }

    return c.json({
      site: {
        ...site,
        content: parsedContent,
      },
    });
  } catch (err: any) {
    return c.json({ error: err?.message || 'Failed to retrieve site' }, 500);
  }
});

// Autosave draft (debounced, dirty check)
siteRoutes.patch('/:id', async (c) => {
  try {
    const authUser = c.get('user');
    const siteId = c.req.param('id');
    const { content, name, slug, custom_domain } = await c.req.json();

    const site = await c.env.DB.prepare('SELECT id FROM sites WHERE id = ? AND owner_id = ?')
      .bind(siteId, authUser.userId)
      .first<{ id: string }>();

    if (!site) {
      return c.json({ error: 'Site not found' }, 404);
    }

    if (content) {
      await c.env.DB.prepare(
        'UPDATE sites SET content_json = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
      )
        .bind(JSON.stringify(content), siteId)
        .run();
    }

    if (name) {
      await c.env.DB.prepare('UPDATE sites SET name = ? WHERE id = ?').bind(name, siteId).run();
    }

    if (slug) {
      const cleanSlug = slug.toLowerCase().trim().replace(/[^a-z0-9-]+/g, '-');
      const conflict = await c.env.DB.prepare('SELECT id FROM sites WHERE slug = ? AND id != ?')
        .bind(cleanSlug, siteId)
        .first<{ id: string }>();

      if (!conflict) {
        await c.env.DB.prepare('UPDATE sites SET slug = ? WHERE id = ?').bind(cleanSlug, siteId).run();
      }
    }

    if (custom_domain !== undefined) {
      const planInfo = await getUserPlanInfo(c.env.DB, authUser.userId);
      if (!planInfo.isBusiness) {
        return c.json(
          { error: 'Custom domains are exclusive to the Business Plan (₹799/mo). Upgrade to Business to connect your own domain.' },
          403
        );
      }

      let cleanDomain = (custom_domain || '').toLowerCase().trim()
        .replace(/^https?:\/\//i, '')
        .replace(/\/.*$/, '')
        .replace(/:\d+$/, '');

      if (cleanDomain) {
        const domainRegex = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)+$/i;
        if (!domainRegex.test(cleanDomain)) {
          return c.json({ error: 'Invalid domain format. Example: yourdomain.com' }, 400);
        }

        const conflict = await c.env.DB.prepare('SELECT id FROM sites WHERE custom_domain = ? AND id != ?')
          .bind(cleanDomain, siteId)
          .first<{ id: string }>();

        if (conflict) {
          return c.json({ error: 'This custom domain is already mapped to another website.' }, 400);
        }

        await c.env.DB.prepare('UPDATE sites SET custom_domain = ? WHERE id = ?')
          .bind(cleanDomain, siteId)
          .run();
      } else {
        await c.env.DB.prepare('UPDATE sites SET custom_domain = NULL WHERE id = ?')
          .bind(siteId)
          .run();
      }
    }

    return c.json({ success: true, savedAt: new Date().toISOString() });
  } catch (err: any) {
    return c.json({ error: err?.message || 'Autosave failed' }, 500);
  }
});

// Delete site
siteRoutes.delete('/:id', async (c) => {
  try {
    const authUser = c.get('user');
    const siteId = c.req.param('id');

    await c.env.DB.prepare('DELETE FROM sites WHERE id = ? AND owner_id = ?')
      .bind(siteId, authUser.userId)
      .run();

    // Clean up media blobs associated with this site
    await c.env.MEDIA_DB.prepare('DELETE FROM media WHERE site_id = ? AND owner_id = ?')
      .bind(siteId, authUser.userId)
      .run();

    return c.json({ success: true, message: 'Site deleted successfully' });
  } catch (err: any) {
    return c.json({ error: err?.message || 'Failed to delete site' }, 500);
  }
});

// Publish site: render static HTML snapshot and store in D1
siteRoutes.post('/:id/publish', async (c) => {
  try {
    const authUser = c.get('user');
    const siteId = c.req.param('id');

    // 1. Check user plan and trial
    const planInfo = await getUserPlanInfo(c.env.DB, authUser.userId);
    if (!planInfo.isPro && planInfo.trial.expired) {
      return c.json(
        { error: 'Your 15-day free trial has expired. Upgrade to Pro (₹249/mo) or Business (₹799/mo) to publish your website.' },
        403
      );
    }

    const site = await c.env.DB.prepare(
      'SELECT id, owner_id, name, slug, template_id, content_json FROM sites WHERE id = ? AND owner_id = ?'
    )
      .bind(siteId, authUser.userId)
      .first<Site>();

    if (!site) {
      return c.json({ error: 'Site not found' }, 404);
    }

    const content: SiteContent = JSON.parse(site.content_json);
    const template = getTemplate(site.template_id);

    // Render full self-contained HTML snapshot
    const renderedHtml = template.render(content, {
      turnstileSiteKey: c.env.TURNSTILE_SITE_KEY,
      slug: site.slug,
    });

    const publishedAt = new Date().toISOString();

    await c.env.DB.prepare(
      `UPDATE sites
       SET published_html = ?, published_content_json = ?, published_at = ?, status = 'published'
       WHERE id = ?`
    )
      .bind(renderedHtml, site.content_json, publishedAt, siteId)
      .run();

    const publicUrl = `/s/${site.slug}`;

    return c.json({
      success: true,
      publishedAt,
      url: publicUrl,
      slug: site.slug,
    });
  } catch (err: any) {
    return c.json({ error: err?.message || 'Publishing failed' }, 500);
  }
});
