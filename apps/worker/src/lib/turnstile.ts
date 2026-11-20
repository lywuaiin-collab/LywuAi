// Verify Cloudflare Turnstile token server-side

export async function verifyTurnstileToken(token: string, secretKey?: string, remoteIp?: string): Promise<boolean> {
  // If Turnstile secret is not set, allow in local development
  if (!secretKey || secretKey === '1x0000000000000000000000000000000AA') {
    return true;
  }

  if (!token) {
    return false;
  }

  try {
    const formData = new FormData();
    formData.append('secret', secretKey);
    formData.append('response', token);
    if (remoteIp) {
      formData.append('remoteip', remoteIp);
    }

    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData,
    });

    const data: any = await res.json();
    return !!data.success;
  } catch (err) {
    console.error('Turnstile verification error:', err);
    return false;
  }
}
