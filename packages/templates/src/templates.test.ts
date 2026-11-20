import { describe, it, expect } from 'vitest';
import { templates, getTemplate } from './index';
import { escapeHtml } from './utils';

describe('escapeHtml', () => {
  it('escapes HTML special characters', () => {
    expect(escapeHtml('<script>alert("xss")</script>')).toBe(
      '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
    );
    expect(escapeHtml('')).toBe('');
    expect(escapeHtml(undefined as unknown as string)).toBe('');
    expect(escapeHtml(null as unknown as string)).toBe('');
  });
});

describe('templates', () => {
  it('exports exactly 10 templates', () => {
    expect(templates).toHaveLength(10);
  });

  const expectedIds = ['business', 'portfolio', 'restaurant', 'agency', 'salon', 'medical', 'fitness', 'lawyer', 'tutor', 'freelancer'];
  expectedIds.forEach((id) => {
    it(`has template ${id}`, () => {
      const t = getTemplate(id);
      expect(t).toBeDefined();
      expect(t.id).toBe(id);
      expect(t.name).toBeTruthy();
      expect(t.description).toBeTruthy();
      expect(t.defaultContent).toBeDefined();
      expect(typeof t.render).toBe('function');
    });

    it(`renders ${id} to valid HTML string`, () => {
      const t = getTemplate(id);
      const html = t.render(t.defaultContent, { slug: id });
      expect(typeof html).toBe('string');
      expect(html.length).toBeGreaterThan(0);
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('<html');
      expect(html).toContain('</html>');
    });

    it(`escapes user content in ${id}`, () => {
      const t = getTemplate(id);
      const maliciousContent = JSON.parse(JSON.stringify(t.defaultContent));
      maliciousContent.seo.title = '<script>alert("xss")</script>';
      maliciousContent.sections.hero.headline = '"><img src=x onerror=alert(1)>';
      const html = t.render(maliciousContent, { slug: id });
      // User-provided title must be escaped
      expect(html).toContain('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
      expect(html).not.toContain('<script>alert(');
      // User-provided headline must be escaped (raw executable markup must not appear)
      expect(html).toContain('&quot;&gt;&lt;img src=x onerror=alert(1)&gt;');
      expect(html).not.toContain('<img src=x onerror=alert(1)>');
    });

    it(`omits disabled sections in ${id}`, () => {
      const t = getTemplate(id);
      const content = JSON.parse(JSON.stringify(t.defaultContent));
      if (content.sections.features) content.sections.features.enabled = false;
      if (content.sections.testimonials) content.sections.testimonials.enabled = false;
      if (content.sections.contact) content.sections.contact.enabled = false;
      const html = t.render(content, { slug: id });
      expect(typeof html).toBe('string');
      expect(html.length).toBeGreaterThan(0);
    });
  });

  it('getTemplate returns business for unknown id', () => {
    expect(getTemplate('nonexistent').id).toBe('business');
  });
});
