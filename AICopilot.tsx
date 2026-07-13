import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageSquare, Sparkles, User, Activity, ArrowRight, AlertCircle } from 'lucide-react';
import { ChatMessage } from '../types';

export default function AICopilot() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: "Hello! I am your Vittscore AI Copilot. I can analyze your credit score, suggest ledger optimization strategies, and evaluate commercial loan eligibility questions based on your GST, UPI, and banking alt-data streams. How can I help you support your business growth today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto scroll chat to bottom when message list expands
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      sender: 'user',
      text: inputText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    // Simulate response delay
    setTimeout(() => {
      setIsTyping(false);
      const assistantMsg: ChatMessage = {
        id: Math.random().toString(),
        sender: 'assistant',
        text: "This feature is under active development. The AI copilot will soon explain your score, suggest improvements, and answer loan-eligibility questions here.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, assistantMsg]);
    }, 1500);
  };

  const loadPresetQuery = (query: string) => {
    setInputText(query);
  };

  const presetQueries = [
    "Why is my EPFO score lower than other pillars?",
    "What interest rate would I qualify for with my current 74 score?",
    "Provide a 3-step strategy to boost my UPI ratio score next month."
  ];

  return (
    <div id="ai-copilot-panel" className="max-w-4xl mx-auto my-6 bg-slate-900 border border-slate-800 rounded-xl shadow-xl flex flex-col h-[580px] text-slate-100 font-sans overflow-hidden">
      
      {/* Copilot Header */}
      <div className="bg-slate-950 px-6 py-4 border-b border-slate-800/60 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-teal-500/15 p-2 rounded-lg text-teal-400">
            <Sparkles className="h-5 w-5 stroke-[2]" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <span>Financial Copilot</span>
            </h2>
            <p className="text-3xs font-mono text-slate-400 uppercase tracking-wider">AI Score Explainer & Advisor</p>
          </div>
        </div>

        {/* Work In Progress Amber Badge */}
        <span className="flex items-center space-x-1 px-2.5 py-1 rounded bg-amber-950/40 text-amber-400 text-3xs font-semibold uppercase tracking-wider border border-amber-500/20">
          <AlertCircle className="h-3 w-3" />
          <span>Work In Progress</span>
        </span>
      </div>

      {/* Messages Thread container */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-900/40">
        
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start space-x-3.5 max-w-[85%] ${
              msg.sender === 'user' ? 'ml-auto flex-row-reverse space-x-reverse' : ''
            }`}
          >
            {/* Avatar */}
            <div className={`p-2 rounded-lg shrink-0 ${
              msg.sender === 'user' ? 'bg-slate-800 text-slate-300' : 'bg-teal-950 text-teal-400'
            }`}>
              {msg.sender === 'user' ? (
                <User className="h-4.5 w-4.5" />
              ) : (
                <Activity className="h-4.5 w-4.5" />
              )}
            </div>

            {/* Bubble wrapper */}
            <div>
              <div className={`px-4 py-3 rounded-xl text-sm leading-relaxed relative ${
                msg.sender === 'user'
                  ? 'bg-teal-500 text-slate-950 font-medium rounded-tr-none'
                  : 'bg-slate-950 text-slate-300 border border-slate-850 rounded-tl-none'
              }`}>
                {/* Simulated alert in Assistant bubbles for active development warning */}
                {msg.sender === 'assistant' && msg.id !== 'welcome' && (
                  <div className="flex items-center space-x-1 px-1.5 py-0.5 rounded bg-amber-950/60 border border-amber-500/10 text-amber-400 text-4xs uppercase tracking-wider font-mono font-bold mb-2 w-fit">
                    <span>Feature Under Construction</span>
                  </div>
                )}
                
                <p>{msg.text}</p>
              </div>
              <span className={`block text-4xs font-mono text-slate-500 mt-1 ${
                msg.sender === 'user' ? 'text-right' : 'text-left'
              }`}>
                {msg.timestamp}
              </span>
            </div>
          </div>
        ))}

        {/* Dynamic Typing simulator */}
        {isTyping && (
          <div className="flex items-start space-x-3.5 max-w-[80%]">
            <div className="p-2 rounded-lg shrink-0 bg-teal-950 text-teal-400">
              <Activity className="h-4.5 w-4.5 animate-pulse" />
            </div>
            <div className="bg-slate-950 text-slate-400 px-4 py-3 border border-slate-850 rounded-xl rounded-tl-none text-xs flex items-center space-x-1.5">
              <span className="h-1.5 w-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="h-1.5 w-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="h-1.5 w-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </div>
          </div>
        )}

        <div ref={scrollRef} />
      </div>

      {/* Preset Queries footer block */}
      {messages.length === 1 && !isTyping && (
        <div className="px-6 py-3 bg-slate-950/40 border-t border-slate-850">
          <span className="block text-4xs font-mono text-slate-500 uppercase tracking-widest mb-2">
            PRESET SCORING QUERIES
          </span>
          <div className="flex flex-col sm:flex-row gap-2">
            {presetQueries.map((q, i) => (
              <button
                key={i}
                onClick={() => loadPresetQuery(q)}
                className="text-left text-3xs font-medium text-slate-400 bg-slate-950 hover:bg-slate-850 border border-slate-850 px-3 py-1.5 rounded-lg hover:text-teal-400 transition-all cursor-pointer truncate"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Form Footer */}
      <form onSubmit={handleSendMessage} className="bg-slate-950 p-4 border-t border-slate-800/80 flex items-center space-x-3">
        <input
          id="chat-input-box"
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ask AI Copilot to audit your ledger or suggest enhancements..."
          className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
        />
        <button
          id="chat-send-btn"
          type="submit"
          className="bg-teal-400 hover:bg-teal-300 text-slate-950 p-2.5 rounded-lg shadow-md transition-colors cursor-pointer flex items-center justify-center shrink-0"
        >
          <Send className="h-4.5 w-4.5" />
        </button>
      </form>

    </div>
  );
}
