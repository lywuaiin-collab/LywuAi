/**
 * Support & Ticketing Route
 * Handles user problem reports, complaints, and product suggestions.
 * 
 * Routing logic:
 * - Problems & Complaints -> Routed to WhatsApp (+91 7557575514)
 * - Suggestions & Feature Requests -> Routed to Telegram (+91 7557575514)
 * 
 * SECURITY DIRECTIVE:
 * The administrator phone number is kept strictly on the server side and
 * NEVER returned in client responses or exposed in frontend code.
 */

import { Hono } from 'hono';
import type { Env, HonoVariables } from '../types';

export const supportRoutes = new Hono<{ Bindings: Env; Variables: HonoVariables }>();

// Internal fallback admin notification phone (Never exposed to clients)
const ADMIN_PHONE = '917557575514';

function generateTicketId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  for (let i = 0; i < 6; i++) {
    code += chars[bytes[i] % chars.length];
  }
  return `TKT-${code}`;
}

supportRoutes.post('/ticket', async (c) => {
  try {
    const body = await c.req.json<{
      category: 'problem' | 'complaint' | 'suggestion' | 'other';
      subject?: string;
      message: string;
      email?: string;
      name?: string;
    }>();

    const { category, subject, message, email, name } = body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return c.json({ error: 'Please enter your message or description' }, 400);
    }

    const cleanCategory = ['problem', 'complaint', 'suggestion', 'other'].includes(category)
      ? category
      : 'other';

    // Route target channel based on category
    // Problems & complaints go to WhatsApp, suggestions go to Telegram
    const targetChannel = (cleanCategory === 'problem' || cleanCategory === 'complaint')
      ? 'whatsapp'
      : 'telegram';

    const ticketId = generateTicketId();
    const userEmail = email ? String(email).trim() : 'anonymous';
    const userName = name ? String(name).trim() : 'LywuAi User';
    const ticketSubject = subject ? String(subject).trim() : `${cleanCategory.toUpperCase()} Report`;

    // Save ticket into D1 database
    await c.env.DB.prepare(
      `INSERT INTO support_tickets (id, user_email, user_name, category, subject, message, target_channel, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'open', CURRENT_TIMESTAMP)`
    )
      .bind(
        ticketId,
        userEmail,
        userName,
        cleanCategory,
        ticketSubject,
        message.trim(),
        targetChannel
      )
      .run();

    // Notification Dispatch Handler (Internal)
    const notificationText = `🚨 [LywuAi ${cleanCategory.toUpperCase()}]
Ticket: ${ticketId}
From: ${userName} (${userEmail})
Subject: ${ticketSubject}
Message: ${message.trim()}
Target: ${targetChannel.toUpperCase()} -> ${ADMIN_PHONE}`;

    // Optional Telegram Bot dispatch if configured in secrets
    const telegramToken = (c.env as any).TELEGRAM_BOT_TOKEN;
    const telegramChatId = (c.env as any).TELEGRAM_CHAT_ID;
    if (telegramToken && telegramChatId && targetChannel === 'telegram') {
      c.executionCtx.waitUntil(
        fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: telegramChatId,
            text: notificationText,
          }),
        }).catch((err) => console.error('Telegram dispatch error:', err))
      );
    }

    console.log(`[Ticket Created] ${notificationText}`);

    // Return safe confirmation to user (Admin phone number is NOT in the response)
    return c.json({
      success: true,
      ticketId,
      category: cleanCategory,
      message: `Your ticket (${ticketId}) has been received and routed to our team. We appreciate your feedback and will review it promptly!`,
    });
  } catch (err: any) {
    console.error('Support ticket error:', err);
    return c.json({ error: 'Failed to submit ticket. Please try again.' }, 500);
  }
});
