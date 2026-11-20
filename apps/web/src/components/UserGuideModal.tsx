import React from 'react';
import { X, Layout, Sparkles, MessageCircle, Send, CheckCircle2, Inbox } from 'lucide-react';

interface UserGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserGuideModal: React.FC<UserGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl max-w-xl w-full p-6 sm:p-8 relative max-h-[90vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1 rounded-lg transition"
          aria-label="Close Guide"
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div className="mb-6 text-center sm:text-left">
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200/60 mb-2">
            <span>✨ 60-Second Quick Start</span>
          </span>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            How to Build Your Website Easily
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Follow these 4 simple steps to customize and launch your website today.
          </p>
        </div>

        {/* 4 Simple Steps */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-slate-700">
          {/* Step 1 */}
          <div className="flex items-start space-x-3.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 font-black text-sm">
              1
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-1.5">
                <span>Pick a Starter Template</span>
                <Layout size={14} className="text-blue-600" />
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                Click <strong>"Create Website"</strong> on your dashboard. Choose the template that matches your business: <em>Local Business, Restaurant, Portfolio, or Agency</em>.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start space-x-3.5 p-3.5 rounded-2xl bg-blue-50/50 border border-blue-100">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 font-black text-sm shadow-xs">
              2
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-1.5">
                <span>Let AI Write Your Words</span>
                <Sparkles size={14} className="text-amber-500" />
              </h3>
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                Type one sentence describing what you do (for example: <em>"Italian pizzeria in Chicago with home delivery"</em>). The AI will write custom headlines, descriptions, and feature lists for you!
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-start space-x-3.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 font-black text-sm">
              3
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-1.5">
                <span>Customize in the Left Sidebar</span>
                <MessageCircle size={14} className="text-emerald-600" />
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                In the visual editor:
              </p>
              <ul className="text-xs text-slate-600 list-disc list-inside mt-1 space-y-0.5">
                <li><strong>Hero Tab:</strong> Change your headline and pick free professional photos.</li>
                <li><strong>WhatsApp Tab:</strong> Add your phone number so clients can chat or call with 1 click.</li>
                <li><strong>Style Tab:</strong> Change your brand colors and font family.</li>
              </ul>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex items-start space-x-3.5 p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 font-black text-sm shadow-xs">
              4
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-1.5">
                <span>Click "Publish Live"</span>
                <Send size={14} className="text-emerald-700" />
              </h3>
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                Hit the blue <strong>"Publish Live"</strong> button at the top right. Your website is instantly live on the internet! You can share your link with anyone immediately.
              </p>
            </div>
          </div>

          {/* Pro-Tip Box */}
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-start space-x-3">
            <Inbox size={18} className="text-amber-700 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 leading-relaxed">
              <strong>How you get customer inquiries:</strong> When a visitor fills out the contact form on your published website, their message goes directly to your dashboard under the <strong>"Leads"</strong> button!
            </div>
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition flex items-center justify-center space-x-1.5"
          >
            <CheckCircle2 size={15} />
            <span>Got it, let's build!</span>
          </button>
        </div>
      </div>
    </div>
  );
};
