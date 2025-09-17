'use client';

import { Check, Circle } from 'lucide-react';

const steps = [
  { key: 'unverified', label: 'Account Created' },
  { key: 'verified', label: 'YouTube Verified' },
  { key: 'calculating', label: 'Score Calculated' },
  { key: 'tier_assigned', label: 'Tier Assigned' },
  { key: 'contract_pending', label: 'Contract Ready' },
  { key: 'contract_signed', label: 'Contract Signed' },
  { key: 'content_submitted', label: 'Content Submitted' },
];

interface StatusTimelineProps {
  currentStatus: string;
}

export default function StatusTimeline({ currentStatus }: StatusTimelineProps) {
  const currentIndex = steps.findIndex(step => step.key === currentStatus);
  
  return (
    <div className="bg-white rounded-xl p-6 border border-orange-100">
      <h3 className="font-semibold text-gray-900 mb-6">Your Journey</h3>
      <div className="space-y-4">
        {steps.map((step, index) => {
          const isCompleted = index <= currentIndex;
          const isCurrent = index === currentIndex;
          
          return (
            <div key={step.key} className="flex items-center gap-3">
              <div className={`
                flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
                transition-all duration-300
                ${isCompleted 
                  ? 'bg-orange-500 text-white' 
                  : 'bg-gray-100 text-gray-400'
                }
                ${isCurrent && 'ring-4 ring-orange-200'}
              `}>
                {isCompleted && index < currentIndex ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Circle className="h-4 w-4" />
                )}
              </div>
              <span className={`
                text-sm font-medium
                ${isCompleted ? 'text-gray-900' : 'text-gray-500'}
              `}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}