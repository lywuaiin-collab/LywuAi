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

/**
 * LywuAi is 100% Free for all users.
 * All premium features (Custom Domain, 24/7 AI Receptionist, WhatsApp CTAs, badge removal)
 * are unlocked unconditionally for every registered account.
 */
export async function getUserPlanInfo(_db: D1Database, _userId: string): Promise<UserPlanInfo> {
  return {
    plan: 'free',
    status: 'active',
    isPro: true,
    isBusiness: true,
    trial: {
      active: true,
      days_left: 9999,
      expired: false,
      expires_at: '2099-01-01T00:00:00.000Z',
    },
  };
}
