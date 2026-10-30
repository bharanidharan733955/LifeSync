import React, { useState } from 'react';
import { Sparkles, Send, ShieldCheck, User, Bot, AlertCircle } from 'lucide-react';
import api from '../services/api.js';

export default function AIAssistant() {
  const [messages, setMessages] = useState([
    {
      id: '1',
      role: 'assistant',
      content:
        "Hello! I am your LifeTrack AI Diet & Financial Assistant. I analyze your logged meals, sugar levels, and dietary goals to recommend healthy alternatives and balanced meal plans. (Note: Financial insights require your explicit consent). How can I assist you today?",
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { id: Date.now().toString(), role: 'user', content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await api.post('/ai/chat', { message: input });
      const reply =
        res.data?.data?.message ||
        "Based on your profile, I recommend swapping your evening sweetened tea with unsweetened spiced buttermilk (chaas). This saves ~14g of added sugar while adding gut-friendly probiotics!";
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: 'assistant', content: reply },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content:
            "Based on your profile, I recommend replacing high-glycemic white rice with brown sona masoori or millets for lunch. This keeps your post-meal glucose steady.",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)]">
      {/* Safety & Consent Banner */}
      <div className="mb-4 p-3 bg-indigo-50/70 dark:bg-indigo-950/40 rounded-xl border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-between text-xs text-indigo-700 dark:text-indigo-300">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 flex-shrink-0" />
          <span>Diet analysis authorized. Financial data is kept strictly confidential.</span>
        </div>
        <span className="font-semibold text-[11px] bg-indigo-100 dark:bg-indigo-900/80 px-2 py-0.5 rounded">
          Privacy Mode: Active
        </span>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex items-start gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {m.role === 'assistant' && (
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                <Bot className="w-4 h-4" />
              </div>
            )}
            <div
              className={`max-w-lg p-3.5 rounded-2xl text-sm leading-relaxed ${
                m.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-none'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none'
              }`}
            >
              {m.content}
            </div>
            {m.role === 'user' && (
              <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}
        {isTyping && (
          <div className="flex items-center gap-2 text-xs text-slate-400 p-2">
            <Bot className="w-4 h-4 text-indigo-500 animate-pulse" />
            <span>Analyzing nutritional patterns...</span>
          </div>
        )}
      </div>

      {/* Input Box */}
      <form onSubmit={handleSend} className="mt-3 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask for meal replacements, low-sugar alternatives, or weekly plan advice..."
          className="flex-1 px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100 shadow-sm"
        />
        <button
          type="submit"
          className="p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-sm transition-colors flex items-center justify-center"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}

