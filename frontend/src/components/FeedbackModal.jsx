import React, { useState } from 'react';
import { XMarkIcon, TrashIcon, CheckIcon } from '@heroicons/react/24/outline';
import { updateFeedback, deleteFeedback } from '../api/feedback';

const FeedbackModal = ({ feedback, onClose, onRefresh }) => {
  const [updating, setUpdating] = useState(false);
  const [category, setCategory] = useState(feedback.category);
  const [priority, setPriority] = useState(feedback.priority_score);

  if (!feedback) return null;

  const handleUpdate = async () => {
    setUpdating(true);
    try {
      await updateFeedback(feedback.id, {
        category,
        priority_score: parseInt(priority),
      });
      onRefresh();
      onClose();
    } catch (err) {
      alert('Error updating feedback. Make sure backend is running.');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this feedback? This action cannot be undone.')) {
      return;
    }
    setUpdating(true);
    try {
      await deleteFeedback(feedback.id);
      onRefresh();
      onClose();
    } catch (err) {
      alert('Error deleting feedback.');
    } finally {
      setUpdating(false);
    }
  };

  const getSentimentBadge = (sentiment) => {
    switch (sentiment?.toLowerCase()) {
      case 'positive':
        return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Positive</span>;
      case 'negative':
        return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">Negative</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-zinc-500/10 text-zinc-400 border border-zinc-500/20">Neutral</span>;
    }
  };

  const getPriorityBadge = (score) => {
    if (score >= 4) {
      return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">Priority {score} (High)</span>;
    } else if (score === 3) {
      return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">Priority {score} (Medium)</span>;
    } else {
      return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Priority {score} (Low)</span>;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-2xl w-full overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
          <h3 className="text-base font-semibold text-zinc-200">Feedback Details</h3>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-widest font-semibold">Customer</p>
              <p className="text-sm text-zinc-300 font-medium">{feedback.customer_name}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-widest font-semibold">Email</p>
              <p className="text-sm text-zinc-300 select-all font-mono">{feedback.email}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-widest font-semibold">Date</p>
              <p className="text-sm text-zinc-300">
                {new Date(feedback.created_at).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-widest font-semibold">Reference ID</p>
              <p className="text-sm text-zinc-300 font-mono">#{feedback.id}</p>
            </div>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2 pt-2">
            {getSentimentBadge(feedback.sentiment)}
            {getPriorityBadge(feedback.priority_score)}
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 capitalize">
              {feedback.category}
            </span>
          </div>

          {/* Feedback message */}
          <div className="space-y-2">
            <p className="text-xs text-zinc-500 uppercase tracking-widest font-semibold">Message</p>
            <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-lg text-sm text-zinc-200 leading-relaxed font-sans whitespace-pre-wrap">
              {feedback.message}
            </div>
          </div>

          {/* Controls to update Priority & Category */}
          <div className="pt-4 border-t border-zinc-800 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-zinc-500 uppercase tracking-widest font-semibold mb-2">
                Edit Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="bug">Bug</option>
                <option value="feature_request">Feature Request</option>
                <option value="complaint">Complaint</option>
                <option value="praise">Praise</option>
                <option value="general">General</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-zinc-500 uppercase tracking-widest font-semibold mb-2">
                Edit Priority Score
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(parseInt(e.target.value))}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="1">Priority 1 (Lowest)</option>
                <option value="2">Priority 2 (Low)</option>
                <option value="3">Priority 3 (Medium)</option>
                <option value="4">Priority 4 (High)</option>
                <option value="5">Priority 5 (Critical)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-950/50 flex items-center justify-between">
          <button
            onClick={handleDelete}
            disabled={updating}
            className="flex items-center text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/5 px-3 py-2 rounded-lg border border-rose-500/10 transition-all disabled:opacity-50"
          >
            <TrashIcon className="w-4 h-4 mr-1.5" />
            Delete Record
          </button>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              disabled={updating}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdate}
              disabled={updating || (category === feedback.category && parseInt(priority) === feedback.priority_score)}
              className="flex items-center px-4 py-2 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-500 transition-colors disabled:opacity-55 disabled:cursor-not-allowed"
            >
              <CheckIcon className="w-4 h-4 mr-1.5" />
              {updating ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackModal;
