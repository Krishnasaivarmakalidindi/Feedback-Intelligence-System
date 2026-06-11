import React from 'react';
import { Link } from 'react-router-dom';
import { MapIcon } from '@heroicons/react/24/outline';

export const NotFoundPage = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center font-sans select-none">
      <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl text-zinc-500 mb-5 shadow-lg">
        <MapIcon className="w-8 h-8 text-indigo-400" />
      </div>
      
      <h2 className="text-sm font-semibold text-zinc-200 uppercase tracking-widest">Page Not Found</h2>
      <p className="text-xs text-zinc-500 mt-2 max-w-xs leading-relaxed">
        The requested URL was not found in the feedback console routing table.
      </p>

      <div className="mt-6 flex gap-3">
        <Link
          to="/"
          className="px-4 py-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-zinc-100 rounded-lg text-xs font-semibold tracking-wide transition-all"
        >
          Landing Page
        </Link>
        <Link
          to="/dashboard"
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold tracking-wide shadow-sm shadow-indigo-600/10 transition-all"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
