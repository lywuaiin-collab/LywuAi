import React, { useState } from 'react';
import { templates } from '@lywuai/templates';
import type { TemplateDefinition } from '@lywuai/shared';
import { generateContentWithAi, createSite } from '../api';
import { Sparkles, ArrowRight, ArrowLeft, Check } from 'lucide-react';

interface TemplatePickerProps {
  onCancel: () => void;
  onSiteCreated: (siteId: string) => void;
}

export const TemplatePicker: React.FC<TemplatePickerProps> = ({ onCancel, onSiteCreated }) => {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateDefinition>(templates[0]);
  const [siteName, setSiteName] = useState('');
  const [description, setDescription] = useState('');
  const [useAi, setUseAi] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!siteName.trim()) {
      setError('Please provide a website name');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Create site record in D1
      const res = await createSite(siteName.trim(), selectedTemplate.id);
      if (res.error || !res.site) {
        setError(res.error || 'Failed to initialize site');
        setLoading(false);
        return;
      }

      const siteId = res.site.id;

      // 2. If user requested AI generation, run it and save draft
      if (useAi && description.trim()) {
        const aiRes = await generateContentWithAi(selectedTemplate.id, description.trim());
        if (aiRes.success && aiRes.content) {
          await fetch(`/api/sites/${siteId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: aiRes.content }),
          });
        }
      }

      onSiteCreated(siteId);
    } catch {
      setError('An unexpected error occurred during creation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-4 space-y-8">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onCancel}
          className="flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft size={16} />
          <span>Back to Dashboard</span>
        </button>
        <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
          Step 1 of 2: Template & AI Setup
        </span>
      </div>

      <div className="text-center max-w-xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Choose a Starter Template
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Pick a curated foundation for your project. You can customize all colors, text, and layouts in the visual editor.
        </p>
      </div>

      {error && (
        <div className="max-w-xl mx-auto p-3 rounded-xl bg-red-50 text-red-700 text-xs border border-red-200 text-center font-medium">
          {error}
        </div>
      )}

      {/* Template Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {templates.map((tpl) => {
          const isSelected = selectedTemplate.id === tpl.id;
          return (
            <div
              key={tpl.id}
              onClick={() => setSelectedTemplate(tpl)}
              className={`group cursor-pointer rounded-2xl border-2 transition overflow-hidden bg-white flex flex-col justify-between ${
                isSelected
                  ? 'border-blue-600 ring-4 ring-blue-500/10 shadow-lg'
                  : 'border-slate-200/90 hover:border-slate-300 shadow-xs'
              }`}
            >
              <div>
                <div className="relative h-40 overflow-hidden bg-slate-100">
                  <img
                    src={tpl.thumbnail}
                    alt={tpl.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  {isSelected && (
                    <div className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md">
                      <Check size={14} />
                    </div>
                  )}
                  <span className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-slate-900/80 text-white backdrop-blur-xs">
                    {tpl.category}
                  </span>
                </div>

                <div className="p-4">
                  <h3 className="text-sm font-bold text-slate-900 mb-1">{tpl.name}</h3>
                  <p className="text-[11px] text-slate-500 leading-relaxed">{tpl.description}</p>
                </div>
              </div>

              <div className="p-4 pt-0">
                <div
                  className={`w-full py-1.5 text-center rounded-lg text-xs font-bold transition ${
                    isSelected ? 'bg-blue-50 text-blue-700' : 'text-slate-500 group-hover:text-slate-800'
                  }`}
                >
                  {isSelected ? 'Selected' : 'Select'}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Creation & AI Configuration Form */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md p-6 sm:p-8 max-w-2xl mx-auto">
        <form onSubmit={handleCreate} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">Website or Brand Name *</label>
            <input
              type="text"
              required
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              placeholder="e.g. Apex Electricians, Bella Vista Bistro, Alex Design"
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          <div className="bg-blue-50/60 rounded-2xl p-4 border border-blue-100 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sparkles size={16} className="text-blue-600" />
                <span className="text-xs font-bold text-slate-800">Generate Custom Copy with Free AI</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={useAi}
                  onChange={(e) => setUseAi(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {useAi && (
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Describe what your business or project does:
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Certified local residential electrician serving North London. 24/7 emergency service, transparent quotes, and rewiring specialists."
                  className="w-full text-xs p-3 rounded-xl border border-blue-200/80 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
                <div className="text-[10px] text-slate-500 mt-1">
                  💡 Uses LywuAi Copilot or smart copy presets. Completely free.
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/25 transition flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {loading ? (
              <span>Setting up your website...</span>
            ) : (
              <>
                <span>Launch Visual Editor</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
