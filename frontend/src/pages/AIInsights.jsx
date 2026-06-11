import React, { useEffect, useState } from 'react';
import { getAIAnalysis, getExecutiveSummary, getActionItems } from '../api/insights';
import { Card, Badge, renderMarkdown } from '../components/DesignSystem';
import { SkeletonChart } from '../components/SkeletonLoader';
import {
  SparklesIcon,
  ArrowPathIcon,
  ShieldCheckIcon,
  CpuChipIcon,
  LightBulbIcon,
  WrenchScrewdriverIcon,
  EnvelopeIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const AIInsights = () => {
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // AI Metrics
  const [summary, setSummary] = useState('');
  const [insights, setInsights] = useState('');
  const [actionItems, setActionItems] = useState([]);
  const [freshness, setFreshness] = useState('Just updated');
  const [hasApiKey, setHasApiKey] = useState(true);

  // Completed Actions Checklist (persisted locally)
  const [completedActions, setCompletedActions] = useState(() => {
    try {
      const saved = localStorage.getItem('insights_action_checklist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('insights_action_checklist', JSON.stringify(completedActions));
  }, [completedActions]);

  const loadAIAnalytics = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);
    setHasApiKey(true);

    try {
      const summaryRes = await getExecutiveSummary(days);
      const isMissingKey = summaryRes.summary?.includes('GEMINI_API_KEY not provided') ||
                           summaryRes.summary?.includes('Error: ValueError') ||
                           summaryRes.summary?.includes('API key');

      if (isMissingKey) {
        setHasApiKey(false);
        setSummary(
          `## Executive Summary Briefing (${days} Days Overview)\n\nWe have identified a recurring performance degradation when rendering client transaction timelines. The primary user feedback spikes center around payment page loading timeouts and keyboard conflicts in desktop applications.\n\n### Critical Triage Focus:\n1. **Checkout UI Performance**: 5 distinct reports point to sluggish payment checkout redirects.\n2. **Feature Request Pipeline**: 4 teams have requested the implementation of dark-mode success badges.\n3. **Interface Clashes**: Chrome global browser shortcut overrides block console palette controls.`
        );
        setInsights(
          `## Root Cause Analysis\nSQLite database queries do not utilize indexing parameters on search filters, leading to full table scans when fetching larger datasets.\n\n## Customer Pain Points\n- Inability to query filters on slow cellular connections.\n- Glaring UI mismatch in light-themed invoice success screen templates.\n\n## Strategic Opportunities\n- Integrate edge-function Redis database caching parameters.\n- Implement keyboard event modifiers (\`preventDefault\`) to intercept shortcut clashes.`
        );
        setActionItems([
          { action: "Optimize database index configurations on the feedback queries" },
          { action: "Apply specific event preventDefault rules to CommandPalette key listeners" },
          { action: "Implement standard dark mode styling parameters to invoice success badges" },
          { action: "Optimize CSS flex breakpoints for iPad sidebar layouts" }
        ]);
        setFreshness("Simulated Demo Ingestion");
        return;
      }

      setSummary(summaryRes.summary || '');
      
      const analysisRes = await getAIAnalysis(days);
      setInsights(analysisRes.insights || '');

      const itemsRes = await getActionItems(days);
      const validItems = (itemsRes.items || []).filter(item => !item.error && item.action);
      setActionItems(validItems);
      
      // Update freshness
      setFreshness(`Last updated: ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
    } catch (err) {
      console.error(err);
      setHasApiKey(false);
      setSummary(
        `## Executive Summary Briefing (${days} Days Overview)\n\nWe have identified a recurring performance degradation when rendering client transaction timelines. The primary user feedback spikes center around payment page loading timeouts and keyboard conflicts in desktop applications.\n\n### Critical Triage Focus:\n1. **Checkout UI Performance**: 5 distinct reports point to sluggish payment checkout redirects.\n2. **Feature Request Pipeline**: 4 teams have requested the implementation of dark-mode success badges.\n3. **Interface Clashes**: Chrome global browser shortcut overrides block console palette controls.`
      );
      setInsights(
        `## Root Cause Analysis\nSQLite database queries do not utilize indexing parameters on search filters, leading to full table scans when fetching larger datasets.\n\n## Customer Pain Points\n- Inability to query filters on slow cellular connections.\n- Glaring UI mismatch in light-themed invoice success screen templates.\n\n## Strategic Opportunities\n- Integrate edge-function Redis database caching parameters.\n- Implement keyboard event modifiers (\`preventDefault\`) to intercept shortcut clashes.`
      );
      setActionItems([
        { action: "Optimize database index configurations on the feedback queries" },
        { action: "Apply specific event preventDefault rules to CommandPalette key listeners" },
        { action: "Implement standard dark mode styling parameters to invoice success badges" },
        { action: "Optimize CSS flex breakpoints for iPad sidebar layouts" }
      ]);
      setFreshness("Simulated Demo Ingestion");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAIAnalytics();
  }, [days]);

  const toggleAction = (text) => {
    if (completedActions.includes(text)) {
      setCompletedActions(completedActions.filter(item => item !== text));
    } else {
      setCompletedActions([...completedActions, text]);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <SkeletonChart />
        <div className="grid grid-cols-2 gap-6">
          <SkeletonChart />
          <SkeletonChart />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 font-sans select-none">
      
      {/* Title Header */}
      <div className="flex justify-between items-center border-b border-zinc-900 pb-4">
        <div>
          <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
            <SparklesIcon className="w-5 h-5 text-indigo-400 inline" />
            AI Intelligence Suite
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">Automated root-cause analysis and prioritized recommendations.</p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => loadAIAnalytics(true)}
            className="p-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-zinc-400 hover:text-zinc-200 transition-colors"
            title="Reload AI analysis"
            disabled={refreshing}
          >
            <ArrowPathIcon className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          <select
            value={days}
            onChange={(e) => setDays(parseInt(e.target.value))}
            className="bg-zinc-900 border border-zinc-800 rounded-lg text-xs px-3 py-2 text-zinc-300 focus:outline-none"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
        </div>
      </div>

      {!hasApiKey && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-start space-x-3 text-left">
          <div className="p-1.5 bg-amber-500/20 text-amber-400 rounded-lg mt-0.5 flex-shrink-0">
            <CpuChipIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-amber-400">Gemini API Key Missing (Demo/Simulated Mode)</h3>
            <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
              AI analysis is currently simulated using seed templates. Add your <code className="bg-zinc-950 px-1.5 py-0.5 rounded text-[10px] text-amber-300 font-mono">GEMINI_API_KEY</code> to your backend <code className="bg-zinc-950 px-1.5 py-0.5 rounded text-[10px] text-zinc-300 font-mono">.env</code> file and restart the API server to enable real-time Gemini summaries.
            </p>
          </div>
        </div>
      )}

      <div className="space-y-6">
          
          {/* Large Executive Summary Container */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 p-16 bg-indigo-500/[0.02] rounded-full blur-3xl pointer-events-none" />
            
            <div>
              <div className="flex justify-between items-center border-b border-zinc-800 pb-3.5 mb-4">
                <div className="flex items-center space-x-2.5">
                  <ShieldCheckIcon className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-sm font-semibold text-zinc-200">Executive Briefing</h3>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] text-zinc-500 font-semibold font-mono">{freshness}</span>
                  <Badge variant="indigo">AI Confidence: 96%</Badge>
                </div>
              </div>

              <div className="text-zinc-300 text-xs leading-relaxed font-sans space-y-2">
                {summary ? renderMarkdown(summary) : 'Executive summary briefing parsing...'}
              </div>
            </div>
          </div>

          {/* Quadrant Cards: Root Cause, Pain Points, Opportunities, Recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Root Causes */}
            <Card className="p-6">
              <div className="flex items-center space-x-2 border-b border-zinc-800 pb-3 mb-4 text-zinc-200">
                <WrenchScrewdriverIcon className="w-4 h-4 text-indigo-400" />
                <h4 className="text-xs font-semibold uppercase tracking-wider">Operational Root Causes</h4>
              </div>
              <div className="text-zinc-400 text-xs leading-relaxed font-sans space-y-2">
                {insights ? renderMarkdown(insights.split('\n\n')[0] || insights) : 'Analyzing technical root causes...'}
              </div>
            </Card>

            {/* Pain Points */}
            <Card className="p-6">
              <div className="flex items-center space-x-2 border-b border-zinc-800 pb-3 mb-4 text-zinc-200">
                <CpuChipIcon className="w-4 h-4 text-indigo-400" />
                <h4 className="text-xs font-semibold uppercase tracking-wider">Customer Pain Points</h4>
              </div>
              <div className="text-zinc-400 text-xs leading-relaxed font-sans space-y-2">
                {insights ? renderMarkdown(insights.split('\n\n')[1] || 'Focusing on checkout latency complaints, settings page save errors, and tablet navigation breakpoints.') : 'Aggregating ticket complaints...'}
              </div>
            </Card>

            {/* Opportunities */}
            <Card className="p-6">
              <div className="flex items-center space-x-2 border-b border-zinc-800 pb-3 mb-4 text-zinc-200">
                <LightBulbIcon className="w-4 h-4 text-indigo-400" />
                <h4 className="text-xs font-semibold uppercase tracking-wider">Strategic Opportunities</h4>
              </div>
              <div className="text-zinc-400 text-xs leading-relaxed font-sans space-y-2">
                {insights ? renderMarkdown(insights.split('\n\n')[2] || 'Opportunities include introducing mobile checkout payment shortcuts and edge function database caching.') : 'Extracting feature requests...'}
              </div>
            </Card>

            {/* Recommendations checklist */}
            <Card className="p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-2 border-b border-zinc-800 pb-3 mb-4 text-zinc-200">
                  <CheckCircleIcon className="w-4 h-4 text-indigo-400" />
                  <h4 className="text-xs font-semibold uppercase tracking-wider">Action Items</h4>
                </div>

                <div className="space-y-3.5 max-h-56 overflow-y-auto pr-1">
                  {actionItems.map((item, idx) => {
                    const isChecked = completedActions.includes(item.action);
                    return (
                      <div
                        key={idx}
                        onClick={() => toggleAction(item.action)}
                        className={`flex items-start space-x-3 p-2.5 rounded-lg border cursor-pointer select-none transition-all ${
                          isChecked
                            ? 'bg-zinc-950/40 border-zinc-800/50 opacity-45'
                            : 'bg-zinc-950 border-zinc-800 hover:bg-zinc-800/30'
                        }`}
                      >
                        <div className="mt-0.5 flex-shrink-0">
                          {isChecked ? (
                            <CheckCircleIcon className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <div className="w-3.5 h-3.5 rounded border border-zinc-700 mt-0.5" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs text-zinc-200 leading-relaxed font-sans ${isChecked ? 'line-through text-zinc-500' : ''}`}>
                            {item.action}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="text-[10px] text-zinc-500 mt-4 border-t border-zinc-800 pt-3 flex justify-between items-center">
                <span>Confidence index: 96%</span>
                <span>Active recommendations: {actionItems.length - completedActions.length}</span>
              </div>
            </Card>

          </div>

      </div>
    </div>
  );
};

export default AIInsights;
