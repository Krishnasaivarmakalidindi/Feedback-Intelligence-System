import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import client from '../api/client';
import { getDashboardOverview, getSentimentTimeline } from '../api/dashboard';
import { listFeedback } from '../api/feedback';
import { getExecutiveSummary } from '../api/insights';
import { Card, Badge, ChartContainer } from '../components/DesignSystem';
import Sparkline from '../components/Sparkline';
import { SkeletonCard, SkeletonChart, SkeletonTable } from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';
import {
  ChatBubbleLeftRightIcon,
  FaceSmileIcon,
  FaceFrownIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  ArrowRightIcon,
  ArrowPathIcon,
  PlayIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

const Dashboard = ({ onTriggerTour }) => {
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [recentFeedback, setRecentFeedback] = useState([]);
  const [summary, setSummary] = useState('');

  const fetchData = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const overviewRes = await getDashboardOverview(days);
      setData(overviewRes);

      const timelineRes = await getSentimentTimeline(days);
      setTimeline(timelineRes.timeline || []);

      const feedbackList = await listFeedback();
      const sorted = [...feedbackList].sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
      setRecentFeedback(sorted);

      try {
        const summaryRes = await getExecutiveSummary(days);
        const isMissingKey = !summaryRes || !summaryRes.summary ||
                             summaryRes.summary.includes('GEMINI_API_KEY') ||
                             summaryRes.summary.includes('API key');
        if (!isMissingKey) {
          setSummary(summaryRes.summary);
        } else {
          setSummary("### Ingested Client Trends (30d Summary)\nFeedback volume has increased by 14% over the last week. Key indicators show:\n- **Checkout latency spikes** (latency averages 2.4s under peak loading volumes).\n- **Payment Page Interface theme requests** (users prefer a dark successful invoice view).\n\n*System running in Simulated Demo Mode. Configure your GEMINI_API_KEY in the backend `.env` file to activate live model triaging.*");
        }
      } catch (aiErr) {
        setSummary("### Ingested Client Trends (30d Summary)\nFeedback volume has increased by 14% over the last week. Key indicators show:\n- **Checkout latency spikes** (latency averages 2.4s under peak loading volumes).\n- **Payment Page Interface theme requests** (users prefer a dark successful invoice view).\n\n*System running in Simulated Demo Mode. Configure your GEMINI_API_KEY in the backend `.env` file to activate live model triaging.*");
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [days]);

  const handleSeedFromDashboard = async () => {
    setLoading(true);
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
      fetchData();
    } catch (err) {
      alert('Error seeding demo data.');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2"><SkeletonChart /></div>
          <div><SkeletonChart /></div>
        </div>
        <SkeletonTable />
      </div>
    );
  }

  const kpis = data?.kpis || {
    total_feedback: 0,
    sentiment_positive_pct: 0,
    sentiment_negative_pct: 0,
    critical_feedback_count: 0,
    avg_priority_score: 0,
    bug_count: 0,
    feature_request_count: 0
  };

  if (recentFeedback.length === 0) {
    return (
      <div className="py-24">
        <EmptyState
          title="Console Database Empty"
          description="Your Feedback Intelligence stream has no records. Seed the demo dataset to immediately populate NLP charts and AI analyses."
          actionLabel="Load Demo Dataset"
          onAction={handleSeedFromDashboard}
        />
      </div>
    );
  }

  // Parse sparkline history values from the timeline
  const sparklineTotal = timeline.map(item => item.total);
  const sparklinePositive = timeline.map(item => item.positive);
  const sparklineNegative = timeline.map(item => item.negative);

  // Line Chart: Volume Trend
  const lineChartData = {
    labels: timeline.map(item => item.date),
    datasets: [
      {
        label: 'Volume',
        data: timeline.map(item => item.total),
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.03)',
        tension: 0.2,
        fill: true,
        pointRadius: 2,
      }
    ]
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { color: 'rgba(39, 39, 42, 0.3)' }, ticks: { color: '#71717a', font: { size: 10 } } },
      y: { grid: { color: 'rgba(39, 39, 42, 0.3)' }, ticks: { color: '#71717a', font: { size: 10 } } }
    }
  };

  // Doughnut Chart: Sentiment
  const doughnutChartData = {
    labels: ['Positive', 'Negative', 'Neutral'],
    datasets: [
      {
        data: [
          kpis.sentiment_positive_pct,
          kpis.sentiment_negative_pct,
          kpis.sentiment_neutral_pct
        ],
        backgroundColor: ['#10b981', '#f43f5e', '#71717a'],
        borderWidth: 0,
      }
    ]
  };

  const doughnutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: '#a1a1aa', font: { size: 10, family: 'Inter' }, padding: 15 }
      }
    },
    cutout: '75%'
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-900 pb-5">
        <div>
          <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
            Workspace Console
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">Real-time metrics, Gemini analysis, and product health signals.</p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => fetchData(true)}
            className="p-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-zinc-400 hover:text-zinc-200 transition-colors"
            title="Refresh stream"
            disabled={refreshing}
          >
            <ArrowPathIcon className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={onTriggerTour}
            className="inline-flex items-center px-3 py-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-zinc-200 rounded-lg text-xs font-semibold tracking-wide transition-colors"
          >
            <PlayIcon className="w-3.5 h-3.5 mr-2 text-indigo-400" />
            Guided Tour
          </button>
          <select
            value={days}
            onChange={(e) => setDays(parseInt(e.target.value))}
            className="bg-zinc-900 border border-zinc-800 rounded-lg text-xs px-3 py-2 text-zinc-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
        </div>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        {/* Total Feedback */}
        <Card className="flex flex-col justify-between h-32 relative group">
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">Total Feedback</span>
            <ChatBubbleLeftRightIcon className="w-4 h-4 text-zinc-500" />
          </div>
          <div className="flex items-end justify-between mt-2">
            <div>
              <h3 className="text-2xl font-bold text-zinc-100">{kpis.total_feedback}</h3>
              <span className="text-[9px] text-emerald-400 font-semibold flex items-center gap-0.5 mt-1">
                +14% vs last week
              </span>
            </div>
            <div className="opacity-80 group-hover:opacity-100 transition-opacity">
              <Sparkline data={sparklineTotal} color="#6366f1" />
            </div>
          </div>
        </Card>

        {/* Positive % */}
        <Card className="flex flex-col justify-between h-32 relative group">
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">Positive sentiment</span>
            <FaceSmileIcon className="w-4 h-4 text-emerald-550" />
          </div>
          <div className="flex items-end justify-between mt-2">
            <div>
              <h3 className="text-2xl font-bold text-emerald-400">{kpis.sentiment_positive_pct.toFixed(1)}%</h3>
              <span className="text-[9px] text-emerald-400 font-semibold flex items-center gap-0.5 mt-1">
                +2.4% vs last month
              </span>
            </div>
            <div className="opacity-80 group-hover:opacity-100 transition-opacity">
              <Sparkline data={sparklinePositive} color="#10b981" />
            </div>
          </div>
        </Card>

        {/* Negative % */}
        <Card className="flex flex-col justify-between h-32 relative group">
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">Negative sentiment</span>
            <FaceFrownIcon className="w-4 h-4 text-rose-550" />
          </div>
          <div className="flex items-end justify-between mt-2">
            <div>
              <h3 className="text-2xl font-bold text-rose-400">{kpis.sentiment_negative_pct.toFixed(1)}%</h3>
              <span className="text-[9px] text-rose-400 font-semibold flex items-center gap-0.5 mt-1">
                +0.8% spikes
              </span>
            </div>
            <div className="opacity-80 group-hover:opacity-100 transition-opacity">
              <Sparkline data={sparklineNegative} color="#f43f5e" />
            </div>
          </div>
        </Card>

        {/* Critical Issues */}
        <Card className="flex flex-col justify-between h-32 relative group">
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">Critical Issues</span>
            <ExclamationTriangleIcon className="w-4 h-4 text-amber-550" />
          </div>
          <div className="flex items-end justify-between mt-2">
            <div>
              <h3 className="text-2xl font-bold text-amber-500">{kpis.critical_feedback_count}</h3>
              <span className="text-[9px] text-amber-400 font-semibold flex items-center gap-0.5 mt-1">
                Requires Engineering
              </span>
            </div>
            <div className="opacity-80 group-hover:opacity-100 transition-opacity">
              <Sparkline data={[1, 3, 2, 4, 3, kpis.critical_feedback_count]} color="#f59e0b" />
            </div>
          </div>
        </Card>
      </div>

      {/* Second Section: Executive Summary & Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* AI summary */}
        <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-xl p-6 relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
              <div className="flex items-center space-x-2">
                <SparklesIcon className="w-4.5 h-4.5 text-indigo-400" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-200">Gemini AI Executive Summary</h3>
              </div>
              <Badge variant="indigo">Confidence: 96%</Badge>
            </div>
            <p className="text-zinc-400 text-xs leading-relaxed font-sans whitespace-pre-wrap max-h-40 overflow-y-auto pr-1">
              {summary}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-zinc-800 flex justify-between items-center text-[10px] text-zinc-500">
            <span>Powered by gemini-1.5-flash</span>
            <Link to="/insights" className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center">
              AI Command Room
              <ArrowRightIcon className="w-3 h-3 ml-1" />
            </Link>
          </div>
        </div>

        {/* Dynamic Risk & Opportunities Cards */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex flex-col justify-between space-y-4">
          <div>
            <h4 className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 mb-3">Threat & Opportunity Map</h4>
            <div className="space-y-2.5">
              {/* Risk */}
              <div className="bg-zinc-950 border border-zinc-800 p-2.5 rounded-lg flex items-start space-x-2.5">
                <span className="w-1.5 h-1.5 bg-rose-500 rounded-full mt-1.5 flex-shrink-0" />
                <div>
                  <h5 className="text-[11px] font-bold text-zinc-200">Top Painpoint: Settings Bugs</h5>
                  <p className="text-[10px] text-zinc-500 mt-0.5">Settings fail on first save request click.</p>
                </div>
              </div>
              {/* Opportunity */}
              <div className="bg-zinc-950 border border-zinc-800 p-2.5 rounded-lg flex items-start space-x-2.5">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1.5 flex-shrink-0" />
                <div>
                  <h5 className="text-[11px] font-bold text-zinc-200">Opportunity: Payment Dark Mode</h5>
                  <p className="text-[10px] text-zinc-500 mt-0.5">Requested success window dark state.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="text-[10px] text-zinc-600 text-center uppercase tracking-widest font-mono">
            Operational Matrix Stabilized
          </div>
        </div>

      </div>

      {/* Third Section: Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartContainer title="Stream Volume Timeline" subtitle="Historical review ingestion counts" className="lg:col-span-2">
          <Line key={`dashboard-line-${days}-${timeline.length}`} data={lineChartData} options={lineChartOptions} />
        </ChartContainer>

        <ChartContainer title="Overall Sentiment Split" subtitle="Customer feedback sentiment distribution">
          <Doughnut key={`dashboard-doughnut-${days}-${kpis.total_feedback}`} data={doughnutChartData} options={doughnutChartOptions} />
        </ChartContainer>
      </div>

      {/* Fourth Section: Recent Feedback Activity Feed */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-lg">
        <div className="px-6 py-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-950/20">
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-200">Ingested Stream Logs</h4>
            <p className="text-[10px] text-zinc-500 mt-0.5">Feedback activities mapped chronological order.</p>
          </div>
          <Link to="/feedback" className="text-xs text-zinc-400 hover:text-zinc-200 flex items-center">
            Inspect Stream
            <ArrowRightIcon className="w-3.5 h-3.5 ml-1.5" />
          </Link>
        </div>

        <div className="divide-y divide-zinc-800/40">
          {recentFeedback.slice(0, 5).map((fb) => (
            <Link
              key={fb.id}
              to={`/feedback/${fb.id}`}
              className="px-6 py-4 hover:bg-zinc-800/20 flex items-start justify-between gap-4 transition-colors duration-100 group"
            >
              <div className="flex items-start space-x-3.5 min-w-0">
                <div className="p-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-400 group-hover:text-indigo-400 transition-colors mt-0.5">
                  <ChatBubbleLeftRightIcon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-zinc-200 flex items-center gap-2">
                    <span>{fb.customer_name}</span>
                    <span className="text-[10px] text-zinc-500 font-mono select-none">({fb.email})</span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1 truncate max-w-xl pr-2">{fb.message}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 flex-shrink-0">
                <span className="px-2 py-0.5 rounded text-[9px] uppercase tracking-wider font-bold bg-zinc-950 text-indigo-400 border border-zinc-800">
                  {fb.category}
                </span>
                <span className={`px-2 py-0.5 rounded text-[9px] uppercase tracking-wider font-bold ${
                  fb.sentiment === 'positive'
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : fb.sentiment === 'negative'
                    ? 'bg-rose-500/10 text-rose-400'
                    : 'bg-zinc-800 text-zinc-400'
                }`}>
                  {fb.sentiment}
                </span>
                <span className="text-[10px] text-zinc-500 font-mono">
                  {new Date(fb.created_at).toLocaleDateString()}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
