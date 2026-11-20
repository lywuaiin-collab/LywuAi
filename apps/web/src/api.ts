import type { User, Site, SiteContent, Submission, Subscription, TrialStatus } from '@lywuai/shared';

export async function fetchMe(): Promise<User | null> {
  try {
    const res = await fetch('/api/auth/me');
    if (!res.ok) return null;
    const data = await res.json();
    return data.user || null;
  } catch {
    return null;
  }
}

export async function loginWithEmail(email: string, password: string): Promise<{ success: boolean; error?: string; user?: User }> {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error };
    return { success: true, user: data.user };
  } catch {
    return { success: false, error: 'Network error' };
  }
}

export async function registerWithEmail(email: string, password: string, name?: string): Promise<{ success: boolean; error?: string; user?: User }> {
  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error };
    return { success: true, user: data.user };
  } catch {
    return { success: false, error: 'Network error' };
  }
}

export async function logoutUser(): Promise<void> {
  await fetch('/api/auth/logout', { method: 'POST' });
}

export async function fetchUserSites(): Promise<Site[]> {
  try {
    const res = await fetch('/api/sites');
    if (!res.ok) return [];
    const data = await res.json();
    return data.sites || [];
  } catch {
    return [];
  }
}

export async function createSite(name: string, template_id: string, slug?: string): Promise<{ site?: Site; error?: string }> {
  try {
    const res = await fetch('/api/sites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, template_id, slug }),
    });
    const data = await res.json();
    if (!res.ok) return { error: data.error };
    return { site: data.site };
  } catch {
    return { error: 'Failed to create site' };
  }
}

export async function fetchSite(id: string): Promise<{ site?: Site & { content: SiteContent }; error?: string }> {
  try {
    const res = await fetch(`/api/sites/${id}`);
    const data = await res.json();
    if (!res.ok) return { error: data.error };
    return { site: data.site };
  } catch {
    return { error: 'Failed to fetch site' };
  }
}

export async function autosaveSite(id: string, payload: { content?: SiteContent; name?: string; slug?: string; custom_domain?: string | null }): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`/api/sites/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    return { success: res.ok, error: data.error };
  } catch {
    return { success: false, error: 'Autosave failed' };
  }
}

export async function publishSite(id: string): Promise<{ success: boolean; url?: string; slug?: string; error?: string }> {
  try {
    const res = await fetch(`/api/sites/${id}/publish`, { method: 'POST' });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error };
    return { success: true, url: data.url, slug: data.slug };
  } catch {
    return { success: false, error: 'Publish failed' };
  }
}

export async function deleteSite(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/sites/${id}`, { method: 'DELETE' });
    return res.ok;
  } catch {
    return false;
  }
}

export async function generateContentWithAi(templateId: string, description: string): Promise<{ success: boolean; content?: SiteContent; error?: string }> {
  try {
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ template_id: templateId, description }),
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error };
    return { success: true, content: data.content };
  } catch {
    return { success: false, error: 'AI generation failed' };
  }
}

export async function fetchSiteSubmissions(siteId: string): Promise<Submission[]> {
  try {
    const res = await fetch(`/api/sites/${siteId}/submissions`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.submissions || [];
  } catch {
    return [];
  }
}

export async function uploadSiteMedia(siteId: string, fileBytes: Uint8Array, filename: string): Promise<{ url?: string; error?: string }> {
  try {
    const res = await fetch(`/api/sites/${siteId}/media`, {
      method: 'POST',
      headers: {
        'Content-Type': 'image/webp',
        'X-Filename': filename,
      },
      body: fileBytes.buffer as ArrayBuffer,
    });
    const data = await res.json();
    if (!res.ok) return { error: data.error };
    return { url: data.url };
  } catch {
    return { error: 'Upload failed' };
  }
}


// ─── Payment / Subscription APIs ──────────────────────────────

export async function createPaymentOrder(
  plan: 'pro' | 'business' = 'pro',
  period: 'monthly' | 'yearly' = 'yearly'
): Promise<{
  order_id: string;
  amount: number;
  currency: string;
  key_id: string;
  plan?: 'pro' | 'business';
  period?: 'monthly' | 'yearly';
  dev_mode?: boolean;
  error?: string;
}> {
  try {
    const res = await fetch('/api/payments/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan, period }),
    });
    const data = await res.json();
    if (!res.ok) return { order_id: '', amount: 0, currency: '', key_id: '', error: data.error };
    return data;
  } catch {
    return { order_id: '', amount: 0, currency: '', key_id: '', error: 'Network error' };
  }
}

export async function verifyPayment(payload: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  plan?: 'pro' | 'business';
  period?: 'monthly' | 'yearly';
}): Promise<{ success: boolean; subscription?: { status: string; plan: string; current_period_end: string; billing_cycle?: string }; error?: string }> {
  try {
    const res = await fetch('/api/payments/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error };
    return { success: true, subscription: data.subscription };
  } catch {
    return { success: false, error: 'Network error' };
  }
}

export async function getSubscriptionStatus(): Promise<{ subscription: Subscription | null; trial?: TrialStatus; error?: string }> {
  try {
    const res = await fetch('/api/payments/status');
    if (!res.ok) {
      if (res.status === 401) return { subscription: null };
      return { subscription: null, error: `Status ${res.status}` };
    }
    const data = await res.json();
    return { subscription: data.subscription || null, trial: data.trial };
  } catch {
    return { subscription: null, error: 'Network error' };
  }
}

export async function cancelSubscription(): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch('/api/payments/cancel', { method: 'POST' });
    const data = await res.json();
    return { success: res.ok, error: data.error };
  } catch {
    return { success: false, error: 'Network error' };
  }
}


// ─── Support / Ticketing API ──────────────────────────────────

export async function submitSupportTicket(payload: {
  category: 'problem' | 'complaint' | 'suggestion' | 'other';
  subject?: string;
  message: string;
  email?: string;
  name?: string;
}): Promise<{ success: boolean; ticketId?: string; message?: string; error?: string }> {
  try {
    const res = await fetch('/api/support/ticket', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error || 'Failed to submit' };
    return { success: true, ticketId: data.ticketId, message: data.message };
  } catch {
    return { success: false, error: 'Network error. Please try again.' };
  }
}
