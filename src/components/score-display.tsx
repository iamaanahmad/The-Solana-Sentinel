'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

export function ScoreDisplay({ score }: { score: number }) {
  const [displayScore, setDisplayScore] = useState(0);

  const getRiskColor = (s: number) => {
    if (s < 40) return 'text-risk-high';
    if (s < 70) return 'text-risk-medium';
    return 'text-risk-low';
  };
  
  const getRiskBgColor = (s: number) => {
    if (s < 40) return 'bg-risk-high/10';
    if (s < 70) return 'bg-risk-medium/10';
    return 'bg-risk-low/10';
  }

  const riskColor = getRiskColor(score);
  const riskBgColor = getRiskBgColor(score);
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (displayScore / 100) * circumference;

  useEffect(() => {
    let animationFrameId: number;
    const startTime = Date.now();
    const duration = 1500; // Animate over 1.5 seconds

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const currentScore = Math.floor(progress * score);
      
      setDisplayScore(currentScore);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrameId);
  }, [score]);

  return (
    <div className="relative h-40 w-40" aria-label={`Sentinel Score: ${score} out of 100`}>
      <svg className="h-full w-full" viewBox="0 0 120 120">
        <circle
          className="text-border/50"
          strokeWidth="10"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="60"
          cy="60"
        />
        <circle
          className={cn('transition-colors duration-500', riskColor)}
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="60"
          cy="60"
          transform="rotate(-90 60 60)"
          style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
        />
      </svg>
      <div
        className={cn(
            'absolute inset-0 flex flex-col items-center justify-center rounded-full transition-colors duration-500',
            riskBgColor
            )}
        >
        <span className={cn('text-5xl font-bold tracking-tight', riskColor)}>
          {displayScore}
        </span>
        <span className="text-sm font-medium text-muted-foreground">Score</span>
      </div>
    </div>
  );
}
