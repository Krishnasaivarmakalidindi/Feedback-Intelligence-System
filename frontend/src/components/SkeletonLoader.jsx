import React from 'react';

// 1. Card Skeleton
export const SkeletonCard = () => {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 animate-pulse space-y-4">
      <div className="flex justify-between items-center">
        <div className="h-2.5 bg-zinc-800 rounded-full w-24"></div>
        <div className="w-5 h-5 bg-zinc-800 rounded-lg"></div>
      </div>
      <div className="h-6 bg-zinc-800 rounded-full w-16"></div>
      <div className="h-2 bg-zinc-800 rounded-full w-32"></div>
    </div>
  );
};

// 2. Table Skeleton
export const SkeletonTable = ({ rows = 5 }) => {
  return (
    <div className="border border-zinc-800 rounded-xl bg-zinc-900 overflow-hidden animate-pulse">
      <div className="bg-zinc-950/40 h-10 border-b border-zinc-800 flex items-center px-6">
        <div className="h-2 bg-zinc-800 rounded-full w-24"></div>
      </div>
      <div className="divide-y divide-zinc-800/40">
        {Array.from({ length: rows }).map((_, idx) => (
          <div key={idx} className="h-16 flex items-center px-6 justify-between gap-4">
            <div className="space-y-2 flex-1">
              <div className="h-2 bg-zinc-800 rounded-full w-1/4"></div>
              <div className="h-1.5 bg-zinc-800 rounded-full w-1/3"></div>
            </div>
            <div className="h-2 bg-zinc-800 rounded-full w-24"></div>
            <div className="h-2.5 bg-zinc-800 rounded-full w-12"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 3. Chart Skeleton
export const SkeletonChart = () => {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 animate-pulse space-y-6">
      <div className="space-y-2">
        <div className="h-3 bg-zinc-800 rounded-full w-1/3"></div>
        <div className="h-2 bg-zinc-800 rounded-full w-1/2"></div>
      </div>
      <div className="h-44 bg-zinc-950/40 rounded-lg flex items-end justify-between p-4 gap-2">
        <div className="bg-zinc-800/50 w-full rounded-t-sm" style={{ height: '35%' }}></div>
        <div className="bg-zinc-800/50 w-full rounded-t-sm" style={{ height: '60%' }}></div>
        <div className="bg-zinc-800/50 w-full rounded-t-sm" style={{ height: '45%' }}></div>
        <div className="bg-zinc-800/50 w-full rounded-t-sm" style={{ height: '80%' }}></div>
        <div className="bg-zinc-800/50 w-full rounded-t-sm" style={{ height: '30%' }}></div>
      </div>
    </div>
  );
};
