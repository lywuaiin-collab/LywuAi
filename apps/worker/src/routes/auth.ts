import { Hono } from 'hono';
import { generateSalt, hashPassword, verifyPassword, signJwt } from '../lib/crypto';
import { authMiddleware } from '../middleware/auth';
import type { Env, HonoVariables } from '../types';

export const authRoutes = new Hono<{ Bindings: Env; Variables: HonoVariables }>();

// Register with Email + Password
authRoutes.post('/register', async (c) => {
  try {
    const { email, password, name } = await c.req.json();

    if (!email || !password || password.length < 6) {
      return c.json({ error: 'Valid email and password (minimum 6 characters) are required.' }, 400);
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existing = await c.env.DB.prepare('SELECT id FROM users WHERE email = ?')
      .bind(cleanEmail)
      .first<{ id: string }>();

    if (existing) {
      return c.json({ error: 'An account with this email already exists. Please sign in.' }, 409);
    }

    const userId = crypto.randomUUID();
    const salt = generateSalt(16);
    const passwordHash = await hashPassword(password, salt);
    const cleanName = name?.trim() || cleanEmail.split('@')[0];

    await c.env.DB.prepare(
      `INSERT INTO users (id, email, password_hash, password_salt, name, login, created_at)
       VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`
    )
      .bind(userId, cleanEmail, passwordHash, salt, cleanName, cleanEmail.split('@')[0])
      .run();

    const token = await signJwt(
      { userId, email: cleanEmail, name: cleanName, login: cleanEmail.split('@')[0] },
      c.env.SESSION_SECRET
    );

    c.header('Set-Cookie', `auth_token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000`);

    return c.json({
      message: 'Account created successfully',
      token,
      user: { id: userId, email: cleanEmail, name: cleanName },
    }, 201);
  } catch (err: any) {
    return c.json({ error: err?.message || 'Registration failed' }, 500);
  }
});

// Login with Email + Password
authRoutes.post('/login', async (c) => {
  try {
    const { email, password } = await c.req.json();
    if (!email || !password) {
      return c.json({ error: 'Email and password are required.' }, 400);
    }

    const cleanEmail = email.toLowerCase().trim();

    const user = await c.env.DB.prepare(
      'SELECT id, email, password_hash, password_salt, name, login FROM users WHERE email = ?'
    )
      .bind(cleanEmail)
      .first<{ id: string; email: string; password_hash: string; password_salt: string; name: string; login: string }>();

    if (!user || !user.password_hash || !user.password_salt) {
      return c.json({ error: 'Invalid email or password.' }, 401);
    }

    const isValid = await verifyPassword(password, user.password_salt, user.password_hash);
    if (!isValid) {
      return c.json({ error: 'Invalid email or password.' }, 401);
    }

    const token = await signJwt(
      { userId: user.id, email: user.email, name: user.name, login: user.login },
      c.env.SESSION_SECRET
    );

    c.header('Set-Cookie', `auth_token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000`);

    return c.json({
      message: 'Signed in successfully',
      token,
      user: { id: user.id, email: user.email, name: user.name, login: user.login },
    });
  } catch (err: any) {
    return c.json({ error: err?.message || 'Login failed' }, 500);
  }
});

// GitHub OAuth Redirect
authRoutes.get('/github', (c) => {
  const clientId = c.env.GITHUB_CLIENT_ID;
  if (!clientId) {
    return c.json({ error: 'GitHub OAuth is not configured on this instance' }, 400);
  }

  const redirectUri = `${new URL(c.req.url).origin}/api/auth/github/callback`;
  const url = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=user:email`;
  return c.redirect(url);
});

// GitHub OAuth Callback
authRoutes.get('/github/callback', async (c) => {
  const code = c.req.query('code');
  if (!code) {
    return c.redirect('/?error=github_cancelled');
  }

  try {
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: c.env.GITHUB_CLIENT_ID,
        client_secret: c.env.GITHUB_CLIENT_SECRET,
        code,
      }),
    });

    const tokenData: any = await tokenRes.json();
    if (!tokenData.access_token) {
      return c.redirect('/?error=github_token_error');
    }

    // Fetch user details
    const ghUserRes = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'User-Agent': 'LywuAi-Website-Builder',
      },
    });
    const ghUser: any = await ghUserRes.json();

    // Fetch primary email if hidden
    let email = ghUser.email;
    if (!email) {
      const emailRes = await fetch('https://api.github.com/user/emails', {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
          'User-Agent': 'LywuAi-Website-Builder',
        },
      });
      const emails: any = await emailRes.json();
      const primaryEmail = Array.isArray(emails) ? emails.find((e: any) => e.primary)?.email : null;
      email = primaryEmail || `${ghUser.id}+github@lywuai.local`;
    }

    // Upsert user
    let user = await c.env.DB.prepare('SELECT id, email, name, login FROM users WHERE github_id = ? OR email = ?')
      .bind(ghUser.id, email)
      .first<{ id: string; email: string; name: string; login: string }>();

    let userId = user?.id;
    if (!userId) {
      userId = crypto.randomUUID();
      await c.env.DB.prepare(
        `INSERT INTO users (id, email, github_id, login, name, avatar_url, created_at)
         VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`
      )
        .bind(userId, email, ghUser.id, ghUser.login, ghUser.name || ghUser.login, ghUser.avatar_url)
        .run();
    }

    const token = await signJwt(
      { userId, email, login: ghUser.login, name: ghUser.name || ghUser.login },
      c.env.SESSION_SECRET
    );

    c.header('Set-Cookie', `auth_token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000`);
    return c.redirect('/');
  } catch (err) {
    return c.redirect('/?error=github_auth_failed');
  }
});

// Logout
authRoutes.post('/logout', (c) => {
  c.header('Set-Cookie', 'auth_token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0');
  return c.json({ message: 'Signed out successfully' });
});

// Current Authenticated User Profile
authRoutes.get('/me', authMiddleware, async (c) => {
  const authUser = c.get('user');
  const user = await c.env.DB.prepare(
    'SELECT id, email, name, login, avatar_url, telegram_chat_id, created_at FROM users WHERE id = ?'
  )
    .bind(authUser.userId)
    .first();

  if (!user) {
    return c.json({ error: 'User not found' }, 404);
  }

  return c.json({ user });
});
