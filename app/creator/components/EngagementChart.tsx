'use client';

import { useEffect, useState } from 'react';

interface EngagementChartProps {
  score: number;
}

export default function EngagementChart({ score }: EngagementChartProps) {
  const [displayScore, setDisplayScore] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setIsAnimating(true);
    // Animate score counter
    const duration = 2000;
    const steps = 60;
    const increment = score / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= score) {
        setDisplayScore(score);
        clearInterval(timer);
      } else {
        setDisplayScore(Math.round(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [score]);

  const circumference = 2 * Math.PI * 100;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  
  const getScoreColor = () => {
    if (score >= 85) return '#22c55e'; // green
    if (score >= 70) return '#fb923c'; // orange
    if (score >= 50) return '#f87171'; // light red
    return '#ef4444'; // red
  };

  return (
    <div className="relative w-64 h-64 mx-auto">
      <svg className="transform -rotate-90 w-full h-full">
        {/* Background circle */}
        <circle
          cx="128"
          cy="128"
          r="100"
          stroke="#f3f4f6"
          strokeWidth="20"
          fill="none"
        />
        
        {/* Progress circle */}
        <circle
          cx="128"
          cy="128"
          r="100"
          stroke={getScoreColor()}
          strokeWidth="20"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className={`transition-all duration-2000 ease-out ${isAnimating ? 'animate-draw' : ''}`}
          style={{
            strokeLinecap: 'round',
          }}
        />
      </svg>
      
      {/* Score display */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-5xl font-bold text-gray-900">{displayScore}</span>
        <span className="text-lg text-gray-600 mt-1">out of 100</span>
      </div>
      
      <style jsx>{`
        @keyframes draw {
          from {
            stroke-dashoffset: ${circumference};
          }
          to {
            stroke-dashoffset: ${strokeDashoffset};
          }
        }
        .animate-draw {
          animation: draw 2s ease-out forwards;
        }
      `}</style>
    </div>
  );
}