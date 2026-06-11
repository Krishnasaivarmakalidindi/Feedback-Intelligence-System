import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import client from '../api/client';
import { getFeedbackById, updateFeedback, deleteFeedback } from '../api/feedback';
import { Badge, Card, Button, renderMarkdown } from '../components/DesignSystem';
import {
  ArrowLeftIcon,
  TrashIcon,
  DocumentDuplicateIcon,
  SparklesIcon,
  EnvelopeIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

export const FeedbackDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [feedback, setFeedback] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  // Sidebar States
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState(1);
  const [ticketStatus, setTicketStatus] = useState('investigating');

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const fbData = await getFeedbackById(id);
      setFeedback(fbData);
      setCategory(fbData.category);
      setPriority(fbData.priority_score);

      // Fetch AI Single ticket analysis
      try {
        const aiRes = await client.get(`/feedback/${id}/analysis`);
        if (aiRes.data && aiRes.data.analysis && aiRes.data.analysis.includes("AI key missing")) {
          let categoryLabel = fbData.category || "general";
          let simulatedAnalysis = "";
          
          if (categoryLabel === "bug") {
            simulatedAnalysis = `Technical Analysis: The issue points to a client-side execution crash. Code traces suggest anomalous keyboard event handling clashing with main browser threads. Suggested resolution is to bound window keypress events specifically to the focus viewport.`;
          } else if (categoryLabel === "feature_request") {
            simulatedAnalysis = `Technical Analysis: Product feature request regarding visual styles. This aligns with modern SaaS interfaces (e.g. Stripe, Linear). Recommended action is to include CSS tailwind preference states in localStorage profiles.`;
          } else {
            simulatedAnalysis = `Technical Analysis: Operational log review. The client expresses feedback regarding general service performance. Recommended action is to audit connection handshakes and database query speeds.`;
          }
          
          setAnalysis({
            analysis: `${simulatedAnalysis}\n\n*Running in Simulated Demo Mode (GEMINI_API_KEY is not configured on the server).*`,
            suggested_response: aiRes.data.suggested_response
          });
        } else {
          setAnalysis(aiRes.data);
        }
      } catch (aiErr) {
        setAnalysis({
          analysis: 'Gemini service returned an error. Verify your API Key.',
          suggested_response: 'Draft response not generated.'
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleSaveAttributes = async () => {
    setSaving(true);
    try {
      await updateFeedback(id, {
        category,
        priority_score: parseInt(priority)
      });
      alert('Attributes updated successfully!');
      fetchDetails();
    } catch (err) {
      alert('Failed to save attributes.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTicket = async () => {
    if (!window.confirm('Wipe this record from the database? This action is permanent.')) return;
    try {
      await deleteFeedback(id);
      navigate('/feedback');
    } catch (err) {
      alert('Failed to delete feedback record.');
    }
  };

  const handleCopyResponse = () => {
    if (!analysis?.suggested_response) return;
    navigator.clipboard.writeText(analysis.suggested_response);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-zinc-400">
        <ArrowPathIcon className="w-6 h-6 animate-spin text-indigo-500 mb-3" />
        <p className="text-xs font-semibold">Retrieving ticket attributes and generating AI summaries...</p>
      </div>
    );
  }

  if (!feedback) {
    return (
      <div className="py-24 text-center">
        <p className="text-sm text-zinc-500 italic">Ticket record not found.</p>
        <Link to="/feedback" className="text-indigo-400 hover:text-indigo-300 font-semibold underline text-xs mt-3 block">
          Back to Stream
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-16 font-sans">
      
      {/* Upper navigation */}
      <div className="flex items-center justify-between border-b border-zinc-900 pb-4 select-none">
        <Link
          to="/feedback"
          className="inline-flex items-center text-xs font-semibold text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          <ArrowLeftIcon className="w-3.5 h-3.5 mr-2" />
          Back to stream
        </Link>

        <button
          onClick={handleDeleteTicket}
          className="inline-flex items-center px-3 py-1.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/15 rounded-lg text-xs font-semibold transition-colors"
        >
          <TrashIcon className="w-3.5 h-3.5 mr-2" />
          Delete Ticket
        </button>
      </div>

      {/* Main Grid: Linear style */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Column: Message + AI Report */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Customer message box */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-zinc-100">{feedback.customer_name}</h2>
                <span className="text-[11px] text-zinc-500 font-mono mt-0.5 block">{feedback.email}</span>
              </div>
              <span className="text-[10px] text-zinc-500 font-mono">
                {new Date(feedback.created_at).toLocaleString()}
              </span>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl text-xs text-zinc-200 leading-relaxed whitespace-pre-wrap font-sans">
              {feedback.message}
            </div>
          </div>

          {/* AI Analysis quadrant */}
          <Card className="p-6 relative overflow-hidden">
            <div className="flex items-center space-x-2.5 mb-4 border-b border-zinc-800 pb-3">
              <SparklesIcon className="w-4 h-4 text-indigo-400" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-200">Gemini Ticket Analysis</h3>
            </div>
            <div className="text-zinc-300 text-xs leading-relaxed font-sans space-y-2">
              {analysis?.analysis ? renderMarkdown(analysis.analysis) : 'Analyzing details...'}
            </div>
          </Card>

          {/* Suggested Email Response */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4 border-b border-zinc-800 pb-3">
              <div className="flex items-center space-x-2.5">
                <EnvelopeIcon className="w-4 h-4 text-indigo-400" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-200">Suggested Response draft</h3>
              </div>
              <button
                onClick={handleCopyResponse}
                className="inline-flex items-center px-2 py-1 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-200 rounded text-[10px] font-semibold tracking-wide transition-colors"
              >
                <DocumentDuplicateIcon className="w-3.5 h-3.5 mr-1" />
                {copied ? 'Copied!' : 'Copy Reply'}
              </button>
            </div>
            <div className="bg-zinc-950 border border-zinc-900 p-4 rounded-lg text-xs font-mono text-zinc-300 leading-relaxed whitespace-pre-wrap select-all">
              {analysis?.suggested_response || 'Generating suggested draft response...'}
            </div>
          </Card>

        </div>

        {/* Right Sidebar: Attributes controls */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-5 select-none">
          <h4 className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 border-b border-zinc-800 pb-2">
            Ticket Attributes
          </h4>

          {/* Reference ID */}
          <div>
            <span className="block text-[10px] text-zinc-500 uppercase tracking-widest font-semibold mb-1">Ticket Reference</span>
            <span className="text-xs font-mono text-zinc-300">#FB-{feedback.id}</span>
          </div>

          {/* Ticket Status */}
          <div>
            <label className="block text-[10px] text-zinc-500 uppercase tracking-widest font-semibold mb-2">Status</label>
            <select
              value={ticketStatus}
              onChange={(e) => setTicketStatus(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-300 focus:outline-none"
            >
              <option value="open">Open</option>
              <option value="investigating">Investigating</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>

          {/* Category Dropdown */}
          <div>
            <label className="block text-[10px] text-zinc-500 uppercase tracking-widest font-semibold mb-2">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-300 focus:outline-none"
            >
              <option value="bug">Bug</option>
              <option value="feature_request">Feature Request</option>
              <option value="complaint">Complaint</option>
              <option value="praise">Praise</option>
              <option value="general">General</option>
            </select>
          </div>

          {/* Priority Score Dropdown */}
          <div>
            <label className="block text-[10px] text-zinc-500 uppercase tracking-widest font-semibold mb-2">Priority Score</label>
            <select
              value={priority}
              onChange={(e) => setPriority(parseInt(e.target.value))}
              className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-300 focus:outline-none"
            >
              <option value="1">Priority 1 (Lowest)</option>
              <option value="2">Priority 2 (Low)</option>
              <option value="3">Priority 3 (Medium)</option>
              <option value="4">Priority 4 (High)</option>
              <option value="5">Priority 5 (Critical)</option>
            </select>
          </div>

          {/* Local Sentiment indicator */}
          <div>
            <span className="block text-[10px] text-zinc-500 uppercase tracking-widest font-semibold mb-2">Extracted Sentiment</span>
            <Badge variant={feedback.sentiment === 'positive' ? 'emerald' : feedback.sentiment === 'negative' ? 'rose' : 'zinc'}>
              {feedback.sentiment}
            </Badge>
          </div>

          {/* Save Action */}
          <div className="pt-2 border-t border-zinc-800">
            <Button
              onClick={handleSaveAttributes}
              disabled={saving || (category === feedback.category && priority === feedback.priority_score)}
              loading={saving}
              variant="primary"
              className="w-full"
            >
              Update Ticket
            </Button>
          </div>
        </div>

      </div>

    </div>
  );
};

export default FeedbackDetailPage;
