import React from 'react';
import { Zap } from 'lucide-react';
import type { Subscription, TrialStatus } from '@lywuai/shared';

interface SubscriptionBadgeProps {
  subscription?: Subscription | null;
  trial?: TrialStatus | null;
  onUpgrade?: () => void;
}

export const SubscriptionBadge: React.FC<SubscriptionBadgeProps> = () => {
  return (
    <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl font-bold text-xs bg-emerald-50 border border-emerald-200 text-emerald-700 shadow-xs">
      <Zap size={13} className="text-emerald-600 fill-emerald-500" />
      <span>$1/month only</span>
    </div>
  );
};
