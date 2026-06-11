import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import { Card, Badge, Button, Input, renderMarkdown } from '../components/DesignSystem';
import {
  ArrowLeftIcon,
  SparklesIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  CommandLineIcon,
  DocumentDuplicateIcon
} from '@heroicons/react/24/outline';

const SandboxPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(0); // 0: Idle, 1: Ingesting, 2: NLP Scoring, 3: AI Summary, 4: Done
  const [logs, setLogs] = useState([]);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const addLog = (text) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${text}`]);
  };

  const handleProcessFeedback = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim() || submitting) return;

    setSubmitting(true);
    setResult(null);
    setLogs([]);
    setStep(1);
    
    addLog("Initializing Webhook payload submission...");
    
    try {
      // Step 1: Webhook Ingest
      await new Promise(r => setTimeout(r, 600));
      addLog("Sending POST request to `/api/feedback`...");
      
      const ingestRes = await client.post('/feedback', {
        customer_name: name,
        email: email,
        message: message
      });
      
      const ticket = ingestRes.data;
      addLog(`Webhook successfully received! Generated Ticket #FB-${ticket.id}`);
      
      // Step 2: NLP Analysis & Priority Weighting
      setStep(2);
      addLog("Calculating local TextBlob sentiment polarity...");
      await new Promise(r => setTimeout(r, 800));
      addLog(`Sentiment identified: ${ticket.sentiment.toUpperCase()}`);
      addLog(`Rule-based auto-categorizer mapped topic to: ${ticket.category.toUpperCase()}`);
      addLog(`Algorithmic score evaluated priority weighting: P${ticket.priority_score}`);
      
      // Step 3: AI Single Ticket Analysis
      setStep(3);
      addLog("Contacting Gemini generative AI engine...");
      addLog("Requesting technical root causes and customer support replies...");
      
      const analysisRes = await client.get(`/feedback/${ticket.id}/analysis`);
      const analysis = analysisRes.data;
      
      addLog("AI summaries successfully generated!");
      setStep(4);
      setResult({
        ticket,
        analysis: analysis.analysis,
        reply: analysis.suggested_response
      });
      
      // Clear inputs
      setName('');
      setEmail('');
      setMessage('');
    } catch (err) {
      console.error(err);
      addLog("FATAL ERROR: Pipeline connection failed.");
      setStep(0);
      alert("Pipeline processing failed. Make sure the API server is active.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyReply = () => {
    if (!result?.reply) return;
    navigator.clipboard.writeText(result.reply);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getSentimentEmoji = (sentiment) => {
    switch (sentiment) {
      case 'positive': return '😄';
      case 'negative': return '😡';
      default: return '😐';
    }
  };

  const getSentimentVariant = (sentiment) => {
    switch (sentiment) {
      case 'positive': return 'emerald';
      case 'negative': return 'rose';
      default: return 'zinc';
    }
  };

  return (
    <div className="bg-zinc-950 text-zinc-50 min-h-screen font-sans selection:bg-indigo-550 selection:text-white">
      {/* Upper navigation header */}
      <header className="max-w-7xl mx-auto px-8 h-20 flex items-center justify-between border-b border-zinc-900 select-none">
        <Link
          to="/"
          className="inline-flex items-center text-xs font-semibold text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          <ArrowLeftIcon className="w-3.5 h-3.5 mr-2" />
          Back to Landing
        </Link>
        <div className="flex items-center space-x-3">
          <span className="text-sm font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            🔮 Feedback Intel
          </span>
          <span className="text-[9px] uppercase tracking-wider font-semibold bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded text-indigo-400">
            Pipeline Sandbox
          </span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-8 py-12 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        
        {/* Left Column: Form & Logs */}
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
              <CommandLineIcon className="w-5 h-5 text-indigo-400" />
              Live Ingestion Pipeline
            </h2>
            <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
              Submit raw feedback reviews. Watch the ingestion layer, NLP models, and Gemini AI summarize and score the payload in real-time.
            </p>
          </div>

          <Card className="p-6 space-y-4">
            <form onSubmit={handleProcessFeedback} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-zinc-500 mb-1.5">
                    Customer Name
                  </label>
                  <Input
                    required
                    placeholder="e.g. Clara Chen"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={submitting}
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-zinc-500 mb-1.5">
                    Customer Email
                  </label>
                  <Input
                    type="email"
                    required
                    placeholder="clara@stripe.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={submitting}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-zinc-500 mb-1.5">
                  Feedback Message
                </label>
                <Input
                  type="textarea"
                  required
                  rows={4}
                  placeholder="Type feedback here (e.g. 'The payment screen crashes on iPad screens when clicking checkout')"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  disabled={submitting}
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                loading={submitting}
                className="w-full"
                disabled={submitting}
              >
                {submitting ? "Processing Pipeline..." : "Process Live Feedback"}
              </Button>
            </form>
          </Card>

          {/* Real-time Logger Terminal */}
          {(step > 0) && (
            <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-4 font-mono text-[10.5px] leading-relaxed text-zinc-400 space-y-1 max-h-48 overflow-y-auto shadow-inner">
              <p className="text-zinc-600 font-bold uppercase tracking-wider text-[9px] mb-2 select-none">Pipeline Execution Log:</p>
              {logs.map((log, i) => (
                <div key={i} className={log.includes("ERROR") ? "text-rose-400" : log.includes("successfully") || log.includes("Generated") ? "text-emerald-400" : ""}>
                  {log}
                </div>
              ))}
              {submitting && (
                <div className="text-indigo-400 animate-pulse mt-1">● Pipeline active... running analysis</div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Output Results */}
        <div className="space-y-6">
          <div className="border-b border-zinc-900 pb-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Pipeline Outputs</h4>
          </div>

          {result ? (
            <div className="space-y-6 animate-fade-in">
              {/* Customer Friendly Confirmation Panel */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4 shadow-lg border-l-4 border-l-indigo-500">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400">Customer Success Portal</span>
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <Badge variant="zinc">Status: Open</Badge>
                  </div>
                </div>
                <div className="flex items-start space-x-3.5">
                  <CheckCircleIcon className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h5 className="text-xs font-bold text-zinc-100">We have received your feedback!</h5>
                    <p className="text-[11px] text-zinc-400 mt-1.5 leading-relaxed font-sans">
                      Thank you for your submission. A support ticket has been created under reference <span className="font-mono text-zinc-200 font-semibold bg-zinc-950 px-1 py-0.5 rounded">#FB-{result.ticket.id}</span>. Our team has received your feedback and will get back to you at <span className="text-indigo-400 font-semibold">{result.ticket.email}</span> shortly.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="border border-dashed border-zinc-800 rounded-xl p-12 text-center text-zinc-600 text-xs italic">
              Submit feedback on the left to activate output visualization.
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default SandboxPage;
