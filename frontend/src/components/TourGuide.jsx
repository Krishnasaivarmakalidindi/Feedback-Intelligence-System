import React from 'react';

export const TourGuide = ({ isOpen, step, onNext, onPrev, onClose }) => {
  if (!isOpen) return null;

  const tourSteps = [
    {
      title: 'Welcome to Feedback Intel 🔮',
      text: 'Explore your automated intelligence workspace. We will walk you through the dashboard, NLP charts, customer feeds, and AI insights.',
      action: 'Next'
    },
    {
      title: 'Real-time KPIs & Sparklines 📈',
      text: 'Look at the top row metrics. Each contains an inline SVG sparkline reflecting historical data. The doughnut and bar charts below detail category and sentiment ratios.',
      action: 'Next'
    },
    {
      title: 'Gemini Executive Summaries 🌟',
      text: 'Read the AI Executive Summary on the dashboard. Gemini processes recent reviews to analyze top risks, opportunities, and requested features instantly.',
      action: 'Next'
    },
    {
      title: 'Actionable Ingestion Feed ⚡',
      text: 'Go to the Feedback page to search comments, filter categories, update priority scores on ticket details, or upload CSV files.',
      action: 'Next'
    },
    {
      title: 'AI Command Checklist 🎯',
      text: 'Head to the AI Insights tab to access root cause analyses, confidence ratings, and an interactive checklist of recommendations.',
      action: 'Finish'
    }
  ];

  const currentStep = tourSteps[step] || tourSteps[0];

  return (
    <div className="fixed bottom-6 right-6 z-[99] max-w-sm w-full bg-zinc-900 border border-indigo-500/50 rounded-xl p-5 shadow-2xl shadow-indigo-600/5 animate-bounce-short font-sans">
      <div className="flex justify-between items-start mb-3">
        <h4 className="text-xs font-semibold text-zinc-150 flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-indigo-500 inline-block animate-ping" />
          {currentStep.title}
        </h4>
        <span className="text-[10px] text-zinc-500 font-semibold font-mono">
          {step + 1} / {tourSteps.length}
        </span>
      </div>

      <p className="text-xs text-zinc-400 leading-relaxed mb-5">
        {currentStep.text}
      </p>

      <div className="flex items-center justify-between">
        <button
          onClick={onClose}
          className="text-[10px] uppercase font-bold text-zinc-600 hover:text-zinc-400 tracking-wider transition-colors"
        >
          Skip Tour
        </button>

        <div className="flex gap-2">
          {step > 0 && (
            <button
              onClick={onPrev}
              className="px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-bold uppercase tracking-wider"
            >
              Back
            </button>
          )}
          <button
            onClick={onNext}
            className="px-3 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold uppercase tracking-wider shadow-sm shadow-indigo-600/10"
          >
            {currentStep.action}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TourGuide;
