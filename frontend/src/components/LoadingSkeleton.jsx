import React from 'react';

export default function LoadingSkeleton({ className = '', count = 1 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`animate-pulse bg-slate-200 dark:bg-slate-800 rounded-lg ${className || 'h-8 w-full'}`}
        />
      ))}
    </div>
  );
}

