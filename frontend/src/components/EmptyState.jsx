import React from 'react';
import { InboxIcon } from '@heroicons/react/24/outline';

export const EmptyState = ({
  title = 'No feedback found',
  description = 'Seed a demo dataset or submit customer feedbacks to begin sentiment and category extraction.',
  actionLabel,
  onAction
}) => {
  return (
    <div className="flex flex-col items-center justify-center border border-dashed border-zinc-800 bg-zinc-900/10 rounded-2xl p-12 text-center max-w-md mx-auto my-8 animate-fade-in">
      <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-500 mb-4 shadow-md">
        <InboxIcon className="w-6 h-6" />
      </div>
      <h3 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider">{title}</h3>
      <p className="text-xs text-zinc-500 mt-2 leading-relaxed max-w-xs">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-sm shadow-indigo-600/10 transition-all active:scale-95"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
