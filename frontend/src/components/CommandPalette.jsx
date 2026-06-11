import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MagnifyingGlassIcon,
  HomeIcon,
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
  SparklesIcon,
  Cog6ToothIcon,
  DocumentArrowUpIcon,
  TrashIcon,
  PlayIcon
} from '@heroicons/react/24/outline';

export const CommandPalette = ({ onTriggerTour, onSeedData, onResetData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef(null);

  const commands = [
    { name: 'Go to Dashboard', shortcut: 'G D', icon: HomeIcon, action: () => navigate('/dashboard') },
    { name: 'Go to Feedback Stream', shortcut: 'G F', icon: ChatBubbleLeftRightIcon, action: () => navigate('/feedback') },
    { name: 'Go to Analytics Workspace', shortcut: 'G A', icon: ChartBarIcon, action: () => navigate('/analytics') },
    { name: 'Go to AI Insights Command', shortcut: 'G I', icon: SparklesIcon, action: () => navigate('/insights') },
    { name: 'Go to System Settings', shortcut: 'G S', icon: Cog6ToothIcon, action: () => navigate('/settings') },
    { name: 'Start Guided Tour Walkthrough', shortcut: 'T', icon: PlayIcon, action: () => { if (onTriggerTour) onTriggerTour(); } },
    { name: 'Seed Demo Customer Reviews', shortcut: 'S', icon: DocumentArrowUpIcon, action: () => { if (onSeedData) onSeedData(); } },
    { name: 'Wipe Database Records (Reset)', shortcut: 'R', icon: TrashIcon, action: () => { if (onResetData) onResetData(); } },
  ];

  const filteredCommands = commands.filter(cmd =>
    cmd.name.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
        setSearch('');
        setActiveIndex(0);
      } else if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const handleKeyDownList = (e) => {
    if (!isOpen) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => (prev + 1) % Math.max(1, filteredCommands.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => (prev - 1 + filteredCommands.length) % Math.max(1, filteredCommands.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[activeIndex]) {
        filteredCommands[activeIndex].action();
        setIsOpen(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[999] flex items-start justify-center pt-[15vh] p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col max-h-[50vh]">
        
        {/* Search header */}
        <div className="relative border-b border-zinc-800 flex items-center bg-zinc-950/20 px-4">
          <MagnifyingGlassIcon className="w-4 h-4 text-zinc-500 mr-3" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or page navigation..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setActiveIndex(0); }}
            onKeyDown={handleKeyDownList}
            className="w-full bg-transparent border-none py-3 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none"
          />
          <span className="text-[10px] text-zinc-600 bg-zinc-950 px-1.5 py-0.5 rounded border border-zinc-800 select-none">
            ESC
          </span>
        </div>

        {/* Command list */}
        <div className="flex-1 overflow-y-auto p-2 space-y-0.5 max-h-[35vh]">
          {filteredCommands.length > 0 ? (
            filteredCommands.map((cmd, index) => {
              const Icon = cmd.icon;
              const isActive = index === activeIndex;
              return (
                <div
                  key={cmd.name}
                  onClick={() => { cmd.action(); setIsOpen(false); }}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer select-none transition-all duration-100 ${
                    isActive
                      ? 'bg-indigo-600 text-white'
                      : 'text-zinc-400 hover:bg-zinc-800/40 hover:text-zinc-200'
                  }`}
                >
                  <div className="flex items-center">
                    <Icon className={`w-4 h-4 mr-3 ${isActive ? 'text-white' : 'text-zinc-500'}`} />
                    <span>{cmd.name}</span>
                  </div>
                  {cmd.shortcut && (
                    <span className={`text-[10px] uppercase font-mono px-1.5 py-0.5 rounded border ${
                      isActive ? 'bg-indigo-700 border-indigo-500 text-indigo-200' : 'bg-zinc-950 border-zinc-800 text-zinc-600'
                    }`}>
                      {cmd.shortcut}
                    </span>
                  )}
                </div>
              );
            })
          ) : (
            <div className="py-8 text-center text-xs text-zinc-600 italic">
              No matching commands.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
