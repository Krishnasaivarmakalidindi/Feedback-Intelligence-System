import React from 'react';
import { Link } from 'react-router-dom';
import {
  SparklesIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
  CommandLineIcon
} from '@heroicons/react/24/outline';

export const LandingPage = () => {
  const features = [
    {
      title: 'Real-time NLP Parser',
      description: 'Automatically analyzes sentiment polarity and tags categories (bugs, complaints, praises) instantly upon review ingestion.',
      icon: CommandLineIcon,
    },
    {
      title: 'Gemini Executive Summaries',
      description: 'Processes volume trends and customer reviews using Google Gemini to produce root-cause analysis and prioritized checklists.',
      icon: SparklesIcon,
    },
    {
      title: 'Advanced Analytics Dashboard',
      description: 'Stunning data visualizations displaying timeline trends, category distribution, and keyword mention frequencies.',
      icon: ChartBarIcon,
    },
  ];

  const testimonials = [
    {
      quote: "Feedback Intel transformed our workflow. We triage hundreds of support logs in seconds rather than spending hours manually classifying tickets.",
      author: "Sarah Lin",
      role: "VP of Product, Stripe-Mock",
    },
    {
      quote: "The Gemini AI integration is incredibly accurate. The action items checklist gives us a weekly prioritized product blueprint.",
      author: "David K.",
      role: "Engineering Manager, Vercel-Mock",
    },
  ];

  return (
    <div className="bg-zinc-950 text-zinc-50 min-h-screen font-sans overflow-x-hidden selection:bg-indigo-550 selection:text-white">
      {/* Upper border line decorative */}
      <div className="h-[1px] bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />

      {/* Global Header */}
      <header className="max-w-7xl mx-auto px-8 h-20 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-lg font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            🔮 Feedback Intel
          </span>
          <span className="text-[9px] uppercase tracking-wider font-semibold bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded text-zinc-500">
            SaaS Console
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <Link
            to="/sandbox"
            className="text-xs font-semibold text-zinc-400 hover:text-zinc-250 transition-colors"
          >
            Pipeline Sandbox
          </Link>
          <Link
            to="/dashboard"
            className="inline-flex items-center px-4 py-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-zinc-100 rounded-lg text-xs font-semibold tracking-wide transition-all active:scale-[0.98]"
          >
            Launch Workspace
            <ArrowRightIcon className="w-3 h-3 ml-2" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-4xl mx-auto px-8 pt-20 pb-16 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/5 border border-indigo-500/20 text-indigo-400 rounded-full text-[10px] font-bold tracking-wider uppercase select-none">
          <SparklesIcon className="w-3.5 h-3.5" />
          Gemini 1.5 Pro Powered Analysis
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold text-zinc-100 tracking-tight leading-none max-w-3xl mx-auto">
          Understand Customer Feedback at the{' '}
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Speed of Light
          </span>
        </h1>

        <p className="text-zinc-500 text-base md:text-lg max-w-xl mx-auto leading-relaxed">
          Ingest, analyze, categorize, and prioritize raw user feedback streams instantly. Automatically generate root causes and action checklist reports.
        </p>

        <div className="pt-4 flex justify-center gap-4">
          <Link
            to="/sandbox"
            className="inline-flex items-center px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold tracking-wide shadow-lg shadow-indigo-600/15 transition-all active:scale-[0.98]"
          >
            Try Live Sandbox
            <SparklesIcon className="w-3.5 h-3.5 ml-2" />
          </Link>
          <Link
            to="/dashboard"
            className="inline-flex items-center px-5 py-2.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 hover:text-zinc-100 rounded-lg text-xs font-semibold tracking-wide transition-all"
          >
            Launch Console
            <ArrowRightIcon className="w-3.5 h-3.5 ml-2" />
          </Link>
        </div>
      </section>

      {/* Interface Mockup */}
      <section className="max-w-5xl mx-auto px-8 pb-24">
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 shadow-2xl shadow-indigo-500/[0.01]">
          <div className="bg-zinc-950 border border-zinc-900 rounded-xl overflow-hidden aspect-[16/9] flex flex-col relative">
            
            {/* Mock Header */}
            <div className="h-10 border-b border-zinc-900 bg-zinc-950/80 flex items-center justify-between px-6 text-[10px] text-zinc-600 font-semibold uppercase tracking-wider select-none">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-rose-500" />
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="ml-4 text-zinc-500">Workspace / Dashboard</span>
              </div>
              <div className="flex gap-4">
                <span>Database: Connected</span>
                <span>AI Status: Active</span>
              </div>
            </div>

            {/* Mock Layout */}
            <div className="flex-1 flex overflow-hidden select-none">
              {/* Mock Sidebar */}
              <div className="w-36 border-r border-zinc-900 bg-zinc-950/20 p-3 space-y-1">
                <div className="h-6 bg-zinc-900 rounded w-full"></div>
                <div className="h-6 bg-zinc-900/30 rounded w-full"></div>
                <div className="h-6 bg-zinc-900/30 rounded w-full"></div>
              </div>

              {/* Mock Dashboard Content */}
              <div className="flex-1 p-5 space-y-4 overflow-hidden">
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-3 space-y-2">
                    <div className="h-1.5 bg-zinc-800 rounded w-12"></div>
                    <div className="h-4 bg-zinc-800 rounded w-8"></div>
                  </div>
                  <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-3 space-y-2">
                    <div className="h-1.5 bg-zinc-800 rounded w-12"></div>
                    <div className="h-4 bg-emerald-500/20 rounded w-10"></div>
                  </div>
                  <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-3 space-y-2">
                    <div className="h-1.5 bg-zinc-800 rounded w-12"></div>
                    <div className="h-4 bg-rose-500/20 rounded w-10"></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 flex-1">
                  <div className="bg-zinc-900/40 border border-zinc-800 rounded-lg p-3 h-28 flex flex-col justify-between">
                    <div className="h-2 bg-zinc-800 rounded w-20"></div>
                    <div className="h-12 bg-zinc-950/60 border border-zinc-900 rounded flex items-center justify-center text-[9px] text-zinc-600">
                      Trend Line Graph Mockup
                    </div>
                  </div>
                  <div className="bg-zinc-900/40 border border-zinc-800 rounded-lg p-3 h-28 flex flex-col justify-between">
                    <div className="h-2 bg-zinc-800 rounded w-20"></div>
                    <div className="h-12 bg-zinc-950/60 border border-zinc-900 rounded flex items-center justify-center text-[9px] text-zinc-600">
                      Topic Breakdown Mockup
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="max-w-5xl mx-auto px-8 py-20 border-t border-zinc-900">
        <div className="text-center max-w-xl mx-auto mb-16 space-y-3">
          <h2 className="text-2xl font-bold text-zinc-150">Built for Modern Product Teams</h2>
          <p className="text-zinc-500 text-sm">
            Everything you need to automate classification and ingest real-time customer feedback patterns.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feat) => {
            const Icon = feat.icon;
            return (
              <div key={feat.title} className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-6 hover:border-zinc-800 transition-colors">
                <div className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-indigo-400 w-fit mb-5">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-semibold text-zinc-200">{feat.title}</h3>
                <p className="text-xs text-zinc-500 mt-2.5 leading-relaxed">{feat.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-5xl mx-auto px-8 py-20 border-t border-zinc-900">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((t, idx) => (
            <div key={idx} className="bg-zinc-900/10 border border-zinc-800 rounded-xl p-8 relative flex flex-col justify-between">
              <p className="text-zinc-400 italic text-xs leading-relaxed mb-6">
                "{t.quote}"
              </p>
              <div>
                <h4 className="text-xs font-semibold text-zinc-200">{t.author}</h4>
                <p className="text-[10px] text-zinc-500 font-medium mt-0.5">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Footer */}
      <section className="max-w-5xl mx-auto px-8 py-20 border-t border-zinc-900 text-center space-y-6">
        <h2 className="text-2xl font-bold text-zinc-200">Ready to unlock customer intelligence?</h2>
        <p className="text-zinc-500 text-xs max-w-sm mx-auto leading-relaxed">
          Get started instantly. Seed demo data or parse your customer reviews streams in under 2 minutes.
        </p>
        <div className="pt-2">
          <Link
            to="/dashboard"
            className="inline-flex items-center px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold tracking-wide shadow-md shadow-indigo-600/15 transition-all active:scale-[0.98]"
          >
            Launch Console Workspace
            <ArrowRightIcon className="w-3.5 h-3.5 ml-2" />
          </Link>
        </div>
      </section>

      {/* Footer copyright */}
      <footer className="h-16 border-t border-zinc-900 flex items-center justify-center text-[10px] text-zinc-600 tracking-wider uppercase">
        © 2026 Feedback Intelligence System. All rights reserved.
      </footer>
    </div>
  );
};

export default LandingPage;
