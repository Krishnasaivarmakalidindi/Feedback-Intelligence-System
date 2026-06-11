import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  HomeIcon,
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
  SparklesIcon,
  Cog6ToothIcon,
  SunIcon,
  MoonIcon
} from '@heroicons/react/24/outline';

const Sidebar = ({ darkMode, setDarkMode }) => {
  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: HomeIcon },
    { name: 'Feedback', path: '/feedback', icon: ChatBubbleLeftRightIcon },
    { name: 'Analytics', path: '/analytics', icon: ChartBarIcon },
    { name: 'AI Insights', path: '/insights', icon: SparklesIcon },
    { name: 'Settings', path: '/settings', icon: Cog6ToothIcon },
  ];

  return (
    <aside className="w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col justify-between h-screen sticky top-0 text-zinc-400">
      {/* Brand Header */}
      <div>
        <div className="h-16 flex items-center px-6 border-b border-zinc-800 gap-3">
          <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            🔮 Feedback Intel
          </span>
          <span className="text-xs px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
            v1.0
          </span>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-zinc-800 text-zinc-100 border-l-2 border-indigo-500 pl-3.5'
                      : 'hover:bg-zinc-800/50 hover:text-zinc-200'
                  }`
                }
              >
                <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
                {item.name}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Theme Toggle & Footer */}
      <div className="p-4 border-t border-zinc-800">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-zinc-800/50 hover:text-zinc-200 transition-colors"
        >
          <span className="flex items-center">
            {darkMode ? (
              <>
                <SunIcon className="w-5 h-5 mr-3 text-amber-400" />
                Light Mode
              </>
            ) : (
              <>
                <MoonIcon className="w-5 h-5 mr-3 text-indigo-400" />
                Dark Mode
              </>
            )}
          </span>
          <span className="text-[10px] uppercase font-semibold text-zinc-600 dark:text-zinc-500 bg-zinc-950/40 px-1.5 py-0.5 rounded border border-zinc-800/40">
            {darkMode ? 'Dark' : 'Light'}
          </span>
        </button>

        <div className="mt-4 px-4 text-center">
          <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-semibold">
            Enterprise BI Console
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
