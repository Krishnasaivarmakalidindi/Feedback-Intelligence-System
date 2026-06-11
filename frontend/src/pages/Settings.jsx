import React, { useEffect, useState } from 'react';
import client from '../api/client';
import { Card, Badge, Button } from '../components/DesignSystem';
import {
  ServerIcon,
  CircleStackIcon,
  CpuChipIcon,
  ArrowPathIcon,
  ShieldCheckIcon,
  TrashIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

const Settings = () => {
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [syncTime, setSyncTime] = useState('Checking...');
  const [health, setHealth] = useState({
    server: 'checking',
    database: 'checking',
    ai: 'checking',
    dbCount: 0,
    aiModel: 'gemini-1.5-flash'
  });

  const checkSystemHealth = async () => {
    setLoading(true);
    try {
      let serverState = 'offline';
      let dbState = 'offline';
      let aiState = 'offline';
      let dbCount = 0;
      let aiModelName = 'gemini-1.5-flash';

      try {
        const res = await client.get('/health');
        if (res.data && res.data.status === 'healthy') {
          serverState = 'online';
        }
      } catch (err) {
        serverState = 'offline';
      }

      if (serverState === 'online') {
        try {
          const res = await client.get('/feedback');
          dbCount = res.data.length;
          dbState = 'connected';
        } catch (dbErr) {
          dbState = 'error';
        }
      }

      if (serverState === 'online') {
        try {
          const aiRes = await client.get('/insights/executive-summary', { params: { days: 7 } });
          if (aiRes.data) {
            if (aiRes.data.summary.includes('GEMINI_API_KEY not provided') ||
                aiRes.data.summary.includes('Error: ValueError') ||
                aiRes.data.summary.includes('API key')) {
              aiState = 'key_missing';
            } else {
              aiState = 'active';
              aiModelName = aiRes.data.model || 'gemini-1.5-flash';
            }
          }
        } catch (err) {
          aiState = 'error';
        }
      }

      setHealth({
        server: serverState,
        database: dbState,
        ai: aiState,
        dbCount,
        aiModel: aiModelName
      });
      setSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSystemHealth();
  }, []);

  const handleSeedData = async () => {
    setSeeding(true);
    try {
      const demoRecords = [
        { customer_name: 'Alex Rivera', email: 'alex@vercel.co', message: 'The analytics dashboard loading time is slow when parsing large JSON datasets. We need optimization on the edge function queries.' },
        { customer_name: 'Clara Chen', email: 'clara@stripe.com', message: 'Please add a dark mode option to the payment success screen. It looks a bit too bright compared to the Stripe dashboard interface.' },
        { customer_name: 'Marcus Brody', email: 'marcus@linear.app', message: 'Bug: The keyboard shortcuts "ctrl+k" clashes with Google Chrome bookmarks list in the latest stable update.' },
        { customer_name: 'Dianne Vance', email: 'dianne@notion.so', message: 'Wow! This Feedback Intelligence System works amazingly well. The automatic priority scoring is 100% accurate.' },
        { customer_name: 'Erick Martinez', email: 'erick@github.com', message: 'Complaint: The user profiles settings don\'t save properly on the first attempt. I have to click save twice.' },
        { customer_name: 'Sarah Jenkins', email: 'sarah@framer.com', message: 'The interactive canvas editor freezes for about 2 seconds when importing massive SVG files. Is there a progressive rendering pipeline planned?' },
        { customer_name: 'Liam Neeson', email: 'liam@action.com', message: 'Great tool, the Gemini-powered recommendations list is extremely helpful for our weekly product planning sessions.' },
        { customer_name: 'Vanya Hargreaves', email: 'vanya@umbrella.net', message: 'The sidebar navigation overlaps slightly on tablet devices. Make sure to fix media query breakpoints.' }
      ];

      for (const record of demoRecords) {
        await client.post('/feedback', record);
      }
      alert('Demo feedback successfully seeded!');
      checkSystemHealth();
    } catch (err) {
      alert('Seeding failed.');
    } finally {
      setSeeding(false);
    }
  };

  const handleWipeData = async () => {
    if (!window.confirm('CRITICAL: Delete all feedbacks in the database? This cannot be undone.')) return;
    setResetting(true);
    try {
      await client.post('/feedback/reset');
      alert('Database wiped successfully.');
      checkSystemHealth();
    } catch (err) {
      alert('Wipe database failed.');
    } finally {
      setResetting(false);
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'online':
      case 'connected':
      case 'active':
        return { text: 'Active / Healthy', color: 'emerald' };
      case 'key_missing':
        return { text: 'Key Missing (Backend Env)', color: 'amber' };
      case 'checking':
        return { text: 'Checking node...', color: 'zinc' };
      default:
        return { text: 'Offline / Error', color: 'rose' };
    }
  };

  const serverStatus = getStatusText(health.server);
  const dbStatus = getStatusText(health.database);
  const aiStatus = getStatusText(health.ai);

  return (
    <div className="space-y-6 pb-12 font-sans select-none animate-fade-in">
      
      {/* Header */}
      <div className="flex justify-between items-center border-b border-zinc-900 pb-4">
        <div>
          <h2 className="text-base font-bold text-zinc-100">System Configuration</h2>
          <p className="text-xs text-zinc-500 mt-0.5">Diagnose service configurations, seed data, and purge databases.</p>
        </div>

        <button
          onClick={checkSystemHealth}
          className="inline-flex items-center px-3 py-2 bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-zinc-100 rounded-lg text-xs font-semibold transition-colors"
        >
          <ArrowPathIcon className="w-3.5 h-3.5 mr-2" />
          Test Nodes
        </button>
      </div>

      {/* Health status cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* API server */}
        <Card className="flex flex-col justify-between h-36">
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">API Server Node</span>
            <ServerIcon className="w-5 h-5 text-zinc-500" />
          </div>
          <div>
            <Badge variant={serverStatus.color}>{serverStatus.text}</Badge>
            <span className="block text-[10px] text-zinc-500 font-mono mt-2.5">FastAPI on port 8000</span>
          </div>
        </Card>

        {/* Database */}
        <Card className="flex flex-col justify-between h-36">
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">SQLite Database</span>
            <CircleStackIcon className="w-5 h-5 text-zinc-500" />
          </div>
          <div>
            <Badge variant={dbStatus.color}>{dbStatus.text}</Badge>
            <span className="block text-[10px] text-zinc-500 mt-2.5">
              Storage: <span className="font-semibold text-zinc-300">{health.dbCount}</span> feedbacks ingested
            </span>
          </div>
        </Card>

        {/* Gemini AI */}
        <Card className="flex flex-col justify-between h-36">
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">Gemini AI Engine</span>
            <CpuChipIcon className="w-5 h-5 text-zinc-500" />
          </div>
          <div>
            <Badge variant={aiStatus.color}>{aiStatus.text}</Badge>
            <span className="block text-[10px] text-zinc-500 mt-2.5 font-mono">Model: {health.aiModel}</span>
          </div>
        </Card>

      </div>

      {/* Sync Card */}
      <Card className="p-4 flex items-center justify-between text-xs text-zinc-400 bg-zinc-950/20 border-dashed">
        <span className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block animate-ping" />
          System Operational Matrix Stable
        </span>
        <span className="text-[10px] text-zinc-500 font-mono">Last health ping check: {syncTime}</span>
      </Card>

      {/* Operational Panels */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-6">
        
        {/* Credentials Info */}
        <div className="space-y-1">
          <h4 className="text-xs font-semibold text-zinc-200">AI Credentials Config</h4>
          <p className="text-xs text-zinc-500 leading-relaxed">
            Gemini API credentials are encrypted and stored backend-side in the <span className="font-mono bg-zinc-950 px-1 py-0.5 rounded text-zinc-400">.env</span> file to safeguard keys. No client-side override inputs are accepted.
          </p>
        </div>

        <div className="h-[1px] bg-zinc-800/60" />

        {/* Ingestion Engine */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h4 className="text-xs font-semibold text-zinc-200">Ingest Demo Data Pipeline</h4>
            <p className="text-xs text-zinc-500 mt-1">
              Seed the SQLite storage tables with 8 typical SaaS feedback reviews to immediately test sentiment analyses.
            </p>
          </div>
          <Button
            onClick={handleSeedData}
            disabled={seeding || health.server !== 'online'}
            loading={seeding}
            variant="primary"
          >
            Seed Dataset
          </Button>
        </div>

        <div className="h-[1px] bg-zinc-800/60" />

        {/* Purge Engine */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h4 className="text-xs font-semibold text-zinc-200 text-rose-400">Wipe Storage Engine (Reset)</h4>
            <p className="text-xs text-zinc-500 mt-1">
              Delete all feedback records in the database. This is a critical action used primarily for reset testing.
            </p>
          </div>
          <Button
            onClick={handleWipeData}
            disabled={resetting || health.server !== 'online'}
            loading={resetting}
            variant="danger"
          >
            Wipe database
          </Button>
        </div>

      </div>

    </div>
  );
};

export default Settings;
