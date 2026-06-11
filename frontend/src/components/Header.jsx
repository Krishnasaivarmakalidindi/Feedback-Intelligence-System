import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import client from '../api/client';

const Header = () => {
  const location = useLocation();
  const [status, setStatus] = useState({
    server: 'checking',
    database: 'checking',
    ai: 'checking'
  });

  const getPageTitle = (pathname) => {
    switch (pathname) {
      case '/dashboard':
        return 'Dashboard';
      case '/feedback':
        return 'Feedback Management';
      case '/analytics':
        return 'Analytics Overview';
      case '/insights':
        return 'Gemini AI Insights';
      case '/settings':
        return 'System Settings';
      default:
        return 'Console';
    }
  };

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await client.get('/health');
        if (res.data && res.data.status === 'healthy') {
          // Verify database by calling overview with 7 days (lightweight)
          try {
            await client.get('/dashboard/overview', { params: { days: 7 } });
            // Check AI by calling executive summary (we check if it contains missing API key message)
            let aiState = 'active';
            try {
              const aiRes = await client.get('/insights/executive-summary', { params: { days: 7 } });
              if (aiRes.data && (
                aiRes.data.summary.includes('GEMINI_API_KEY not provided') ||
                aiRes.data.summary.includes('Error: ValueError') ||
                aiRes.data.summary.includes('API key')
              )) {
                aiState = 'missing_key';
              }
            } catch (err) {
              aiState = 'error';
            }

            setStatus({
              server: 'healthy',
              database: 'connected',
              ai: aiState
            });
          } catch (dbErr) {
            setStatus({
              server: 'healthy',
              database: 'error',
              ai: 'error'
            });
          }
        } else {
          setStatus({ server: 'error', database: 'error', ai: 'error' });
        }
      } catch (err) {
        setStatus({ server: 'offline', database: 'offline', ai: 'offline' });
      }
    };

    checkHealth();
    // Poll status every 30 seconds
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, [location.pathname]);

  const getStatusBadge = (type, state) => {
    let color = 'bg-zinc-800 text-zinc-400';
    let dotColor = 'bg-zinc-600';
    let label = state;

    if (state === 'healthy' || state === 'connected' || state === 'active') {
      color = 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      dotColor = 'bg-emerald-500';
      label = state === 'healthy' ? 'Server: OK' : state === 'connected' ? 'DB: Connected' : 'AI: Active';
    } else if (state === 'checking') {
      color = 'bg-zinc-800/40 text-zinc-400 border border-zinc-800';
      dotColor = 'bg-zinc-500 animate-pulse';
      label = `Checking ${type}...`;
    } else if (state === 'missing_key') {
      color = 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      dotColor = 'bg-amber-500';
      label = 'AI: Key Missing';
    } else {
      color = 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
      dotColor = 'bg-rose-500';
      label = type === 'AI' ? 'AI: Error' : type === 'DB' ? 'DB: Offline' : 'Server: Offline';
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${color}`}>
        <span className={`h-1.5 w-1.5 rounded-full ${dotColor} mr-1.5 inline-block ${state === 'checking' ? '' : 'animate-ping'}`} />
        <span className="relative">{label}</span>
      </span>
    );
  };

  return (
    <header className="h-16 border-b border-zinc-800 bg-zinc-950 flex items-center justify-between px-8 text-zinc-300 z-10 sticky top-0">
      <div className="flex items-center space-x-3">
        <h1 className="text-lg font-semibold text-zinc-100">
          {getPageTitle(location.pathname)}
        </h1>
        <span className="text-zinc-600">/</span>
        <span className="text-xs text-zinc-500">console</span>
      </div>

      {/* System status dots */}
      <div className="flex items-center space-x-3">
        {getStatusBadge('Server', status.server)}
        {getStatusBadge('DB', status.database)}
        {getStatusBadge('AI', status.ai)}
      </div>
    </header>
  );
};

export default Header;
