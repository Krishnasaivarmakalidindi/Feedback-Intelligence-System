import React, { useEffect, useState } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import { getAnalyticsOverview } from '../api/analytics';
import { ChartContainer } from '../components/DesignSystem';
import { SkeletonChart } from '../components/SkeletonLoader';
import {
  ArrowPathIcon,
  ArrowDownTrayIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

const Analytics = () => {
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [analytics, setAnalytics] = useState(null);

  const fetchAnalytics = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const data = await getAnalyticsOverview(days, 15);
      setAnalytics(data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [days]);

  const handleExportData = () => {
    if (!analytics) return;
    const blob = new Blob([JSON.stringify(analytics, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `feedback_analytics_${days}d_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkeletonChart />
          <SkeletonChart />
        </div>
      </div>
    );
  }

  // Anomaly Banner configuration
  const severity = analytics?.anomaly_severity?.toLowerCase() || 'none';
  const anomalyMessage = analytics?.anomaly_message || 'Pattern activity is within regular thresholds.';

  const getAnomalyCard = () => {
    if (severity === 'high' || severity === 'critical') {
      return (
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-5 flex items-start space-x-4 animate-pulse select-none">
          <div className="p-2.5 bg-rose-500/20 text-rose-400 rounded-lg">
            <ExclamationTriangleIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-rose-300">Anomaly Alert: Critical Stream Detected</h3>
            <p className="text-[11px] text-rose-400 mt-1">{anomalyMessage}</p>
          </div>
        </div>
      );
    } else if (severity === 'medium' || severity === 'warning') {
      return (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-5 flex items-start space-x-4 select-none">
          <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-lg">
            <ExclamationTriangleIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-amber-300">Anomaly Warning: Activity Spike</h3>
            <p className="text-[11px] text-amber-400 mt-1">{anomalyMessage}</p>
          </div>
        </div>
      );
    } else {
      return (
        <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-5 flex items-start space-x-4 select-none">
          <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-lg">
            <ShieldCheckIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-emerald-400">Security & Operational Patterns Stable</h3>
            <p className="text-[10px] text-zinc-500 mt-1">{anomalyMessage}</p>
          </div>
        </div>
      );
    }
  };

  // Keyword layout settings
  const keywords = analytics?.top_keywords || [];
  const maxKeywordCount = keywords.length > 0 ? keywords[0].count : 1;

  // Chart: Daily Trend
  const dailyTrend = analytics?.daily_trend || [];
  const lineData = {
    labels: dailyTrend.map(item => item.date),
    datasets: [
      {
        label: 'Feedback Frequency',
        data: dailyTrend.map(item => item.count),
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.05)',
        tension: 0.2,
        fill: true,
        pointRadius: 2,
      }
    ]
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { color: 'rgba(39, 39, 42, 0.3)' }, ticks: { color: '#71717a', font: { size: 10 } } },
      y: { grid: { color: 'rgba(39, 39, 42, 0.3)' }, ticks: { color: '#71717a', font: { size: 10 }, stepSize: 1 } }
    }
  };

  // Chart: Topic Distribution
  const topicDistribution = analytics?.topic_distribution || {};
  const topicLabels = Object.keys(topicDistribution);
  const topicCounts = Object.values(topicDistribution);

  const topicChartData = {
    labels: topicLabels.map(t => t.charAt(0).toUpperCase() + t.slice(1)),
    datasets: [
      {
        data: topicCounts,
        backgroundColor: 'rgba(99, 102, 241, 0.85)',
        borderColor: '#6366f1',
        borderWidth: 0,
        borderRadius: 4,
      }
    ]
  };

  const topicChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#71717a', font: { size: 10 } } },
      y: { grid: { color: 'rgba(39, 39, 42, 0.3)' }, ticks: { color: '#71717a', font: { size: 10 }, stepSize: 1 } }
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Action Header */}
      <div className="flex justify-between items-center border-b border-zinc-900 pb-4">
        <div>
          <h2 className="text-base font-bold text-zinc-100">Analytics Workspace</h2>
          <p className="text-xs text-zinc-500 mt-0.5">Deep-dive keyword distributions, topic mapping, and anomaly reporting.</p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => fetchAnalytics(true)}
            className="p-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-zinc-400 hover:text-zinc-200 transition-colors"
            disabled={refreshing}
          >
            <ArrowPathIcon className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleExportData}
            className="inline-flex items-center px-3 py-2 bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-zinc-100 rounded-lg text-xs font-semibold transition-colors"
          >
            <ArrowDownTrayIcon className="w-3.5 h-3.5 mr-2 text-zinc-500" />
            Export JSON
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

      {/* Anomaly Detection Banner */}
      {getAnomalyCard()}

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartContainer title="Ingestion Frequencies" subtitle="Chronological review count timelines">
          {dailyTrend.length > 0 ? (
            <Line key={`analytics-line-${days}-${dailyTrend.length}`} data={lineData} options={lineOptions} />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-[10px] text-zinc-500 italic">
              Timeline data empty.
            </div>
          )}
        </ChartContainer>

        <ChartContainer title="Topic Ingestion splits" subtitle="Extracted ticket topics distribution">
          {topicCounts.length > 0 ? (
            <Bar key={`analytics-bar-${days}-${topicCounts.length}`} data={topicChartData} options={topicChartOptions} />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-[10px] text-zinc-500 italic">
              Topic breakdown empty.
            </div>
          )}
        </ChartContainer>
      </div>

      {/* Keyword Distribution Analysis */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <div className="mb-6">
          <h4 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider">Top Mentions Keywords</h4>
          <p className="text-[10px] text-zinc-500 mt-0.5">Frequency count of keywords parsed from client logs.</p>
        </div>

        {keywords.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
            {keywords.map((kw, i) => {
              const percentage = (kw.count / maxKeywordCount) * 100;
              return (
                <div key={kw.word} className="flex items-center space-x-4">
                  <span className="w-4 text-xs font-mono text-zinc-600">
                    {(i + 1).toString().padStart(2, '0')}
                  </span>
                  <span className="w-24 text-xs text-zinc-300 truncate font-semibold" title={kw.word}>
                    {kw.word}
                  </span>
                  <div className="flex-1 h-2 bg-zinc-950 rounded-full overflow-hidden border border-zinc-900">
                    <div
                      className="bg-indigo-600/80 h-full rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-xs font-mono text-indigo-400 font-semibold">
                    {kw.count}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-12 text-center text-xs text-zinc-500 italic">
            No keywords extracted.
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;
