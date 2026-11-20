import React from 'react';
import { Crown, Zap, AlertCircle, Clock } from 'lucide-react';
import type { Subscription, TrialStatus } from '@lywuai/shared';

interface SubscriptionBadgeProps {
  subscription: Subscription | null;
  trial?: TrialStatus | null;
  onUpgrade: () => void;
}

export const SubscriptionBadge: React.FC<SubscriptionBadgeProps> = ({ subscription, trial, onUpgrade }) => {
  // Active Paid Subscription
  if (subscription && subscription.status === 'active') {
    const isBusiness = subscription.plan === 'business';
    const endDate = subscription.current_period_end
      ? new Date(subscription.current_period_end).toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
        })
      : null;

    return (
      <div
        className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl font-bold text-xs border ${
          isBusiness
            ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
            : 'bg-green-50 border-green-200 text-green-700'
        }`}
      >
        <Crown size={13} className={isBusiness ? 'text-indigo-600' : 'text-green-600'} />
        <span>{isBusiness ? 'Business' : 'Pro'}{endDate ? ` · ${endDate}` : ''}</span>
      </div>
    );
  }

  // Past Due
  if (subscription?.status === 'past_due') {
    return (
      <button
        onClick={onUpgrade}
        className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-red-50 border border-red-200 text-red-700 font-bold text-xs hover:bg-red-100 transition"
      >
        <AlertCircle size={13} />
        <span>Plan Expired — Renew</span>
      </button>
    );
  }

  // Cancelled
  if (subscription?.status === 'cancelled') {
    return (
      <button
        onClick={onUpgrade}
        className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-200 transition"
      >
        <AlertCircle size={13} />
        <span>Resubscribe</span>
      </button>
    );
  }

  // Free Tier with 15-Day Trial
  if (trial) {
    if (trial.expired) {
      return (
        <button
          onClick={onUpgrade}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-red-50 border border-red-200 text-red-700 font-bold text-xs hover:bg-red-100 transition"
        >
          <AlertCircle size={13} />
          <span>15-Day Trial Expired — Upgrade</span>
        </button>
      );
    }

    return (
      <button
        onClick={onUpgrade}
        className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs shadow-sm shadow-amber-500/20 transition transform hover:-translate-y-0.5"
      >
        <Clock size={13} />
        <span>Trial: {trial.days_left}d left · Upgrade</span>
      </button>
    );
  }

  return (
    <button
      onClick={onUpgrade}
      className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs shadow-sm shadow-amber-500/20 transition transform hover:-translate-y-0.5"
    >
      <Zap size={13} />
      <span>Upgrade to Pro — from ₹249/mo</span>
    </button>
  );
};
