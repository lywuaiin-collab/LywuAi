export interface UserPlanInfo {
  plan: 'free' | 'pro' | 'business';
  status: 'active' | 'inactive' | 'past_due' | 'cancelled';
  isPro: boolean;
  isBusiness: boolean;
  trial: {
    active: boolean;
    days_left: number;
    expired: boolean;
    expires_at: string;
  };
}

export async function getUserPlanInfo(db: D1Database, userId: string): Promise<UserPlanInfo> {
  const sub = await db
    .prepare('SELECT plan, status, current_period_end FROM subscriptions WHERE owner_id = ?')
    .bind(userId)
    .first<{ plan: 'free' | 'pro' | 'business'; status: string; current_period_end: string | null }>();

  const userRow = await db
    .prepare('SELECT created_at FROM users WHERE id = ?')
    .bind(userId)
    .first<{ created_at: string }>();

  const registeredAt = userRow?.created_at ? new Date(userRow.created_at) : new Date();
  const trialEnd = new Date(registeredAt.getTime() + 15 * 24 * 60 * 60 * 1000);
  const now = new Date();
  const trialExpired = now > trialEnd;
  const trialDaysLeft = Math.max(0, Math.ceil((trialEnd.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)));

  let status = sub?.status || 'inactive';
  if (status === 'active' && sub?.current_period_end) {
    if (new Date(sub.current_period_end) < now) {
      status = 'past_due';
    }
  }

  const isBusiness = status === 'active' && sub?.plan === 'business';
  const isPro = status === 'active' && (sub?.plan === 'pro' || sub?.plan === 'business');
  const plan: 'free' | 'pro' | 'business' = status === 'active' && sub?.plan ? sub.plan : 'free';

  return {
    plan,
    status: status as any,
    isPro,
    isBusiness,
    trial: {
      active: !trialExpired,
      days_left: trialDaysLeft,
      expired: trialExpired,
      expires_at: trialEnd.toISOString(),
    },
  };
}
