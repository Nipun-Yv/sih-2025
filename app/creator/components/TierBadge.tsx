'use client';

import { Crown } from 'lucide-react';
import { useEffect, useState } from 'react';

interface TierBadgeProps {
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
}

export default function TierBadge({ tier }: TierBadgeProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setIsAnimating(true);
  }, []);

  const tierStyles = {
    bronze: 'bg-gradient-to-br from-orange-600 to-orange-800',
    silver: 'bg-gradient-to-br from-gray-300 to-gray-500',
    gold: 'bg-gradient-to-br from-yellow-400 to-yellow-600',
    platinum: 'bg-gradient-to-br from-purple-400 to-purple-600',
  };

  const tierGlow = {
    bronze: 'shadow-orange-500/30',
    silver: 'shadow-gray-400/30',
    gold: 'shadow-yellow-500/30',
    platinum: 'shadow-purple-500/30',
  };

  return (
    <div className={`
      relative px-4 py-2 rounded-full text-white font-semibold text-sm
      flex items-center gap-2 ${tierStyles[tier]}
      ${isAnimating ? 'animate-in fade-in zoom-in duration-500' : ''}
      shadow-lg ${tierGlow[tier]}
    `}>
      <Crown className="h-4 w-4" />
      <span className="uppercase tracking-wide">{tier}</span>
      {isAnimating && (
        <div className={`
          absolute inset-0 rounded-full ${tierStyles[tier]} 
          animate-ping opacity-20
        `} />
      )}
    </div>
  );
}