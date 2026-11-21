import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send, Bot, MessageSquare, AlertCircle, Lightbulb, CheckCircle2, Loader2 } from 'lucide-react';
import type { SiteContent } from '@lywuai/shared';
import { submitSupportTicket } from '../api';

interface BuilderAiAssistantProps {
  currentSite?: {
    name: string;
    template_id: string;
    content: SiteContent;
  } | null;
  userEmail?: string;
  userName?: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const BuilderAiAssistant: React.FC<BuilderAiAssistantProps> = ({ currentSite, userEmail, userName }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'ticket'>('chat');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        "👋 Hi! I'm your LywuAi Copilot. I can guide you through configuring your website, setting up WhatsApp CTAs, turning on the visitor AI Bot, crafting punchy headlines, or submitting feedback/tickets to our support team!",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Ticket form state
  const [ticketCategory, setTicketCategory] = useState<'problem' | 'suggestion'>('problem');
  const [ticketEmail, setTicketEmail] = useState(userEmail || '');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketSubmitting, setTicketSubmitting] = useState(false);
  const [ticketResult, setTicketResult] = useState<{ ticketId: string; message: string } | null>(null);
  const [ticketError, setTicketError] = useState('');

  const quickPrompts = [
    '🎫 Raise a problem ticket or suggestion',
    '💬 How do I connect WhatsApp?',
    '🤖 How do I enable the AI Receptionist?',
    '✍️ Suggest 3 catchy hero headlines',
    '🚀 How do I publish my website?',
    '⚡ Is LywuAi really 100% free?',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || loading) return;

    if (text.startsWith('🎫')) {
      setActiveTab('ticket');
      return;
    }

    const newMessages: Message[] = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const siteContext = currentSite
        ? `Site Name: ${currentSite.name}
Template: ${currentSite.template_id}
Current Headline: ${currentSite.content.sections.hero.headline}
Primary Color: ${currentSite.content.theme.primary}`
        : 'User is browsing the builder dashboard.';

      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          siteContext,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to get answer');
      }

      const data = await res.json();
      setMessages([...newMessages, { role: 'assistant', content: data.reply || 'Here is what I recommend for your website.' }]);
    } catch (err: any) {
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: `⚠️ ${err?.message || 'Connection error. Please verify your Copilot settings.'}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketMessage.trim() || ticketSubmitting) return;

    setTicketSubmitting(true);
    setTicketError('');

    const res = await submitSupportTicket({
      category: ticketCategory,
      message: ticketMessage.trim(),
      email: ticketEmail.trim() || userEmail || undefined,
      name: userName || undefined,
    });

    if (res.success && res.ticketId) {
      setTicketResult({ ticketId: res.ticketId, message: res.message || 'Ticket submitted successfully!' });
      setTicketMessage('');
    } else {
      setTicketError(res.error || 'Failed to submit ticket. Please try again.');
    }
    setTicketSubmitting(false);
  };

  return (
    <div className="fixed bottom-5 right-5 z-40 select-none">
      {/* Floating Chat Box */}
      {isOpen && (
        <div className="mb-3 w-80 sm:w-96 h-[520px] max-h-[82vh] bg-white rounded-3xl shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-700 p-3.5 text-white flex flex-col space-y-2.5 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-7 h-7 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-xs">
                  <Sparkles size={14} />
                </div>
                <div>
                  <h3 className="font-extrabold text-xs tracking-tight leading-none">LywuAi Copilot</h3>
                  <span className="text-[10px] text-blue-100 font-medium">Launch Your Website Using AI</span>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex p-0.5 rounded-xl bg-black/20 text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setActiveTab('chat')}
                className={`flex-1 py-1 rounded-lg flex items-center justify-center space-x-1.5 transition ${
                  activeTab === 'chat' ? 'bg-white text-blue-700 shadow-xs' : 'text-blue-100 hover:text-white'
                }`}
              >
                <MessageSquare size={12} />
                <span>AI Copilot</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('ticket');
                  setTicketResult(null);
                  setTicketError('');
                }}
                className={`flex-1 py-1 rounded-lg flex items-center justify-center space-x-1.5 transition ${
                  activeTab === 'ticket' ? 'bg-white text-blue-700 shadow-xs' : 'text-blue-100 hover:text-white'
                }`}
              >
                <AlertCircle size={12} />
                <span>Ticket / Feedback</span>
              </button>
            </div>
          </div>

          {activeTab === 'chat' ? (
            <>
              {/* Quick Action Suggestion Chips */}
              <div className="p-2.5 bg-slate-50 border-b border-slate-100 flex gap-1.5 overflow-x-auto no-scrollbar shrink-0">
                {quickPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(prompt)}
                    disabled={loading}
                    className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-white border border-slate-200 text-slate-700 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50/50 whitespace-nowrap transition shrink-0 disabled:opacity-50"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {/* Message List */}
              <div className="flex-1 p-3.5 overflow-y-auto space-y-3 text-xs bg-slate-50/50">
                {messages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] p-3 rounded-2xl leading-relaxed whitespace-pre-wrap ${
                        m.role === 'user'
                          ? 'bg-blue-600 text-white rounded-br-xs shadow-xs'
                          : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs shadow-xs'
                      }`}
                    >
                      {m.content}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-bl-xs text-xs text-slate-400 flex items-center space-x-2">
                      <Bot size={14} className="animate-spin text-blue-600" />
                      <span>Thinking with LywuAi Copilot...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Bar */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="p-2.5 bg-white border-t border-slate-200 flex items-center space-x-2 shrink-0"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask Copilot for headlines, colors..."
                  disabled={loading}
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="p-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 transition shadow-sm shadow-blue-500/20"
                  aria-label="Send Message"
                >
                  <Send size={14} />
                </button>
              </form>
            </>
          ) : (
            /* Ticket / Feedback Form Tab */
            <div className="flex-1 p-4 overflow-y-auto bg-slate-50 flex flex-col justify-between text-xs">
              {ticketResult ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-4 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                    <CheckCircle2 size={28} />
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-sm">Ticket Submitted!</h4>
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-mono font-bold text-xs">
                    {ticketResult.ticketId}
                  </span>
                  <p className="text-[11px] text-slate-600 leading-relaxed max-w-[240px]">
                    {ticketResult.message}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setTicketResult(null);
                      setActiveTab('chat');
                    }}
                    className="mt-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition"
                  >
                    Back to AI Chat
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmitTicket} className="space-y-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5 text-[11px]">Category</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setTicketCategory('problem')}
                        className={`p-2 rounded-xl border flex items-center space-x-1.5 text-[11px] font-bold transition ${
                          ticketCategory === 'problem'
                            ? 'bg-rose-50 border-rose-300 text-rose-700 shadow-xs'
                            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        <AlertCircle size={13} className={ticketCategory === 'problem' ? 'text-rose-600' : 'text-slate-400'} />
                        <span>Problem / Issue</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setTicketCategory('suggestion')}
                        className={`p-2 rounded-xl border flex items-center space-x-1.5 text-[11px] font-bold transition ${
                          ticketCategory === 'suggestion'
                            ? 'bg-indigo-50 border-indigo-300 text-indigo-700 shadow-xs'
                            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        <Lightbulb size={13} className={ticketCategory === 'suggestion' ? 'text-indigo-600' : 'text-slate-400'} />
                        <span>Suggestion</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1 text-[11px]">Your Email (Optional)</label>
                    <input
                      type="email"
                      value={ticketEmail}
                      onChange={(e) => setTicketEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1 text-[11px]">Description *</label>
                    <textarea
                      rows={4}
                      value={ticketMessage}
                      onChange={(e) => setTicketMessage(e.target.value)}
                      placeholder={
                        ticketCategory === 'problem'
                          ? 'Describe the issue or error you encountered...'
                          : 'Share your feature idea or recommendation for LywuAi...'
                      }
                      required
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                  </div>

                  {ticketError && (
                    <div className="p-2 rounded-xl bg-red-50 text-red-600 text-[11px] font-medium">
                      {ticketError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={!ticketMessage.trim() || ticketSubmitting}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 disabled:opacity-50 transition flex items-center justify-center space-x-1.5"
                  >
                    {ticketSubmitting ? (
                      <>
                        <Loader2 size={13} className="animate-spin" />
                        <span>Routing Ticket...</span>
                      </>
                    ) : (
                      <span>Submit Ticket to Support</span>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      )}

      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="group relative flex items-center space-x-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-700 text-white font-bold text-xs shadow-xl shadow-blue-600/30 hover:shadow-blue-600/50 hover:scale-105 active:scale-95 transition-all duration-200"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
        </span>
        <Sparkles size={15} className="group-hover:rotate-12 transition-transform" />
        <span>{isOpen ? 'Close Copilot' : 'AI Copilot'}</span>
      </button>
    </div>
  );
};
