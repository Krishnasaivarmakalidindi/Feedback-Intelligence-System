import React, { useState, useRef, useEffect } from 'react';
import client from '../api/client';
import {
  SparklesIcon,
  ChatBubbleLeftEllipsisIcon,
  XMarkIcon,
  PaperAirplaneIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

export const AIChatAnalyst = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Hi! I am your AI Feedback Analyst. Ask me anything about customer sentiment, bug spikes, or recommended improvements.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  const sampleQuestions = [
    "What is the biggest complaint?",
    "What features are requested most?",
    "Summarize customer sentiment."
  ];

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend) => {
    const queryText = textToSend || input;
    if (!queryText.trim() || loading) return;

    // Add user message
    setMessages(prev => [...prev, { role: 'user', text: queryText }]);
    setInput('');
    setLoading(true);

    try {
      const res = await client.get('/insights/chat', {
        params: { query: queryText, days: 30 }
      });
      
      const reply = res.data?.response || 'No response returned from the analyst.';
      if (reply.includes("GEMINI_API_KEY is not configured") || reply.includes("Error running chat query")) {
        // Return high-fidelity mock chat analyst responses
        const queryLower = queryText.toLowerCase();
        let simulatedReply = "";
        
        if (queryLower.includes("complaint") || queryLower.includes("bug") || queryLower.includes("pain")) {
          simulatedReply = "Based on our simulated database audit, the largest volume of complaints (38%) is related to latency spikes during payment checkout redirects. Users report the success dialogues load for up to 3 seconds before completing transactions.";
        } else if (queryLower.includes("feature") || queryLower.includes("request") || queryLower.includes("improvement")) {
          simulatedReply = "The most requested feature in the current feedback stream is standard dark mode compatibility for the invoice confirmation modal. Users indicate that the current light-themed modal clashes with the dark mode console layout.";
        } else if (queryLower.includes("sentiment") || queryLower.includes("mood") || queryLower.includes("feel")) {
          simulatedReply = "Customer sentiment is currently 62% Positive, 25% Negative, and 13% Neutral. While general appreciation is high for the automatic priority triaging, negative sentiment spikes are driven by settings page save timeouts.";
        } else {
          simulatedReply = "I have processed your query against the simulated feedback log database. Our records show positive client appreciation regarding automatic priority detection, though secondary issues are logged for settings page saving latency.";
        }
        
        setMessages(prev => [...prev, { role: 'assistant', text: `${simulatedReply}\n\n*Running in simulated demo mode. Configure GEMINI_API_KEY in the backend .env to enable real-time generative chat.*` }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', text: reply }]);
      }
    } catch (err) {
      // Return high-fidelity mock chat analyst responses on network failure too
      const queryLower = queryText.toLowerCase();
      let simulatedReply = "";
      
      if (queryLower.includes("complaint") || queryLower.includes("bug") || queryLower.includes("pain")) {
        simulatedReply = "Based on our simulated database audit, the largest volume of complaints (38%) is related to latency spikes during payment checkout redirects. Users report the success dialogues load for up to 3 seconds before completing transactions.";
      } else if (queryLower.includes("feature") || queryLower.includes("request") || queryLower.includes("improvement")) {
        simulatedReply = "The most requested feature in the current feedback stream is standard dark mode compatibility for the invoice confirmation modal. Users indicate that the current light-themed modal clashes with the dark mode console layout.";
      } else if (queryLower.includes("sentiment") || queryLower.includes("mood") || queryLower.includes("feel")) {
        simulatedReply = "Customer sentiment is currently 62% Positive, 25% Negative, and 13% Neutral. While general appreciation is high for the automatic priority triaging, negative sentiment spikes are driven by settings page save timeouts.";
      } else {
        simulatedReply = "I have processed your query against the simulated feedback log database. Our records show positive client appreciation regarding automatic priority detection, though secondary issues are logged for settings page saving latency.";
      }
      
      setMessages(prev => [...prev, { role: 'assistant', text: `${simulatedReply}\n\n*Running in simulated demo mode. Configure GEMINI_API_KEY in the backend .env to enable real-time generative chat.*` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 font-sans">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 p-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full shadow-xl shadow-indigo-600/20 transition-all hover:scale-105 active:scale-95"
          title="Ask AI Analyst"
        >
          <SparklesIcon className="w-5 h-5 text-white" />
          <span className="text-xs font-bold tracking-wide pr-1">Ask AI</span>
        </button>
      )}

      {/* Slide Out Chat Pane */}
      {isOpen && (
        <div className="w-80 md:w-96 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl flex flex-col h-[500px] overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="px-4 py-3.5 border-b border-zinc-800 bg-zinc-950/40 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <SparklesIcon className="w-4 h-4 text-indigo-400" />
              <h4 className="text-xs font-semibold text-zinc-200">AI Chat Analyst</h4>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-xs leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-indigo-600 text-white font-medium'
                      : 'bg-zinc-950 border border-zinc-800 text-zinc-200 font-sans whitespace-pre-line'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 flex items-center space-x-2">
                  <ArrowPathIcon className="w-3.5 h-3.5 animate-spin text-indigo-500" />
                  <span className="text-[10px] text-zinc-500 font-semibold font-mono animate-pulse">Analyst is reviewing database...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Questions Suggestions */}
          {messages.length === 1 && (
            <div className="px-4 py-2 border-t border-zinc-800/60 bg-zinc-950/20 space-y-1.5">
              <p className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider">Suggested Queries:</p>
              <div className="flex flex-col gap-1">
                {sampleQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(q)}
                    className="text-left text-[10px] text-zinc-400 hover:text-indigo-400 bg-zinc-900 border border-zinc-800 hover:border-indigo-500/20 rounded px-2.5 py-1.5 transition-colors font-medium"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Footer */}
          <form
            onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
            className="p-3 border-t border-zinc-800 bg-zinc-950/30 flex gap-2"
          >
            <input
              type="text"
              placeholder="Ask a question about feedback logs..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors disabled:opacity-40"
            >
              <PaperAirplaneIcon className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AIChatAnalyst;
