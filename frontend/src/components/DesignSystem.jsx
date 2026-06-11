import React, { useRef } from 'react';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';

// 1. Sleek Card Container
export const Card = ({ children, className = '', onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-all duration-200 select-none ${
        onClick ? 'cursor-pointer hover:bg-zinc-800/30' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};

// 2. Vercel-inspired Buttons
export const Button = ({
  children,
  onClick,
  type = 'button',
  variant = 'secondary', // 'primary', 'secondary', 'danger', 'ghost'
  disabled = false,
  className = '',
  loading = false,
}) => {
  const baseStyles = 'inline-flex items-center justify-center px-3.5 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all active:scale-[0.98] disabled:opacity-55 disabled:cursor-not-allowed select-none';
  
  const variants = {
    primary: 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/10',
    secondary: 'bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-zinc-100',
    danger: 'bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/15',
    ghost: 'hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-3.5 w-3.5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  );
};

// 3. Status and Metadata Badges
export const Badge = ({ children, variant = 'zinc', className = '' }) => {
  const variants = {
    indigo: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    rose: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    zinc: 'bg-zinc-800 text-zinc-400 border border-zinc-700',
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider capitalize ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

// 4. Bordered Input Fields
export const Input = ({
  type = 'text',
  placeholder = '',
  value,
  onChange,
  className = '',
  required = false,
  rows,
}) => {
  const classes = `w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3.5 py-2 text-xs text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all font-sans ${className}`;

  if (type === 'textarea') {
    return (
      <textarea
        rows={rows || 3}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        className={`${classes} resize-none`}
      />
    );
  }

  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      className={classes}
    />
  );
};

// 5. Standard Tables
export const Table = ({ headers = [], children, className = '' }) => {
  return (
    <div className={`w-full overflow-x-auto border border-zinc-800 rounded-xl bg-zinc-900 ${className}`}>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-zinc-800 bg-zinc-950/40 text-[10px] text-zinc-500 uppercase tracking-widest font-semibold select-none">
            {headers.map((h, i) => (
              <th key={i} className="px-6 py-3.5 font-bold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800/40 text-xs text-zinc-300 font-sans">
          {children}
        </tbody>
      </table>
    </div>
  );
};

// 6. Base Modal Overlay
export const Modal = ({ children, isOpen, onClose, title = '' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-950/20">
          <h3 className="text-sm font-semibold text-zinc-200">{title}</h3>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-300 text-lg transition-colors"
          >
            &times;
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

// 7. Interactive Chart Container with Image Export Capability
export const ChartContainer = ({ title, subtitle, children, className = '' }) => {
  const containerRef = useRef(null);

  const handleExportPNG = () => {
    if (!containerRef.current) return;
    
    // Find canvas element inside children
    const canvas = containerRef.current.querySelector('canvas');
    if (!canvas) {
      alert('Could not locate canvas element to export.');
      return;
    }

    try {
      // Create temporary download link
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = url;
      link.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_chart.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Failed to export canvas image:', err);
    }
  };

  return (
    <div ref={containerRef} className={`bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex flex-col justify-between ${className}`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="text-xs font-semibold text-zinc-200">{title}</h4>
          {subtitle && <p className="text-[10px] text-zinc-500 mt-0.5">{subtitle}</p>}
        </div>
        <button
          onClick={handleExportPNG}
          className="p-1 bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded transition-colors"
          title="Download Chart as PNG"
        >
          <ArrowDownTrayIcon className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="flex-1 min-h-[200px] relative">
        {children}
      </div>
    </div>
  );
};

// 8. Lightweight Markdown-to-HTML parser for React (Vercel/Linear feel)
export const renderMarkdown = (text) => {
  if (!text) return null;
  
  const lines = text.split('\n');
  let inList = false;
  let listItems = [];
  const renderedElements = [];
  
  const flushList = (keyPrefix) => {
    if (listItems.length > 0) {
      renderedElements.push(
        <ul key={`list-${keyPrefix}`} className="space-y-1 mb-3">
          {listItems}
        </ul>
      );
      listItems = [];
      inList = false;
    }
  };

  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    
    // Headers
    if (trimmed.startsWith('### ')) {
      flushList(idx);
      renderedElements.push(
        <h4 key={idx} className="text-xs font-bold text-zinc-100 mt-4 mb-2 uppercase tracking-wider font-sans">
          {parseInline(trimmed.slice(4))}
        </h4>
      );
      return;
    }
    if (trimmed.startsWith('## ')) {
      flushList(idx);
      renderedElements.push(
        <h3 key={idx} className="text-sm font-bold text-zinc-50 mt-5 mb-2.5 border-b border-zinc-800 pb-1 font-sans">
          {parseInline(trimmed.slice(3))}
        </h3>
      );
      return;
    }
    if (trimmed.startsWith('# ')) {
      flushList(idx);
      renderedElements.push(
        <h2 key={idx} className="text-base font-bold text-zinc-50 mt-6 mb-3 border-b border-zinc-800 pb-1.5 font-sans">
          {parseInline(trimmed.slice(2))}
        </h2>
      );
      return;
    }
    
    // Bullet List
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      inList = true;
      listItems.push(
        <li key={`li-${idx}`} className="list-disc ml-5 text-zinc-400 text-xs leading-relaxed">
          {parseInline(trimmed.slice(2))}
        </li>
      );
      return;
    }
    
    // Numbered List
    const numMatch = trimmed.match(/^\d+\.\s(.*)/);
    if (numMatch) {
      inList = true;
      listItems.push(
        <li key={`li-num-${idx}`} className="list-decimal ml-5 text-zinc-400 text-xs leading-relaxed">
          {parseInline(numMatch[1])}
        </li>
      );
      return;
    }
    
    // Empty line / Break
    if (trimmed === '') {
      flushList(idx);
      renderedElements.push(<div key={idx} className="h-1.5" />);
      return;
    }
    
    // Normal paragraph
    flushList(idx);
    renderedElements.push(
      <p key={idx} className="text-zinc-400 text-xs leading-relaxed my-1.5 font-sans">
        {parseInline(trimmed)}
      </p>
    );
  });
  
  flushList(lines.length);
  return renderedElements;
};

const parseInline = (text) => {
  const parts = [];
  const regex = /(\*\*.*?\*\*|`.*?`)/g;
  let match;
  let lastIndex = 0;
  let keyIdx = 0;
  
  while ((match = regex.exec(text)) !== null) {
    const matchStr = match[0];
    const matchIndex = match.index;
    
    if (matchIndex > lastIndex) {
      parts.push(text.substring(lastIndex, matchIndex));
    }
    
    if (matchStr.startsWith('**') && matchStr.endsWith('**')) {
      parts.push(
        <strong key={`bold-${keyIdx++}`} className="font-semibold text-zinc-200">
          {matchStr.slice(2, -2)}
        </strong>
      );
    } else if (matchStr.startsWith('`') && matchStr.endsWith('`')) {
      parts.push(
        <code key={`code-${keyIdx++}`} className="bg-zinc-950 px-1.5 py-0.5 rounded text-[10px] text-zinc-300 font-mono border border-zinc-800">
          {matchStr.slice(1, -1)}
        </code>
      );
    }
    
    lastIndex = regex.lastIndex;
  }
  
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }
  
  return parts.length > 0 ? parts : text;
};

