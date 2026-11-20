import React from 'react';
import type { Site, User, Subscription, TrialStatus } from '@lywuai/shared';
import { ExternalLink, Edit3, MessageSquare, Trash2, Plus, Sparkles, CheckCircle2, Globe, Clock, ArrowRight } from 'lucide-react';

interface DashboardProps {
  user: User;
  sites: Site[];
  subscription?: Subscription | null;
  trial?: TrialStatus | null;
  onNewSite: () => void;
  onEditSite: (siteId: string) => void;
  onViewSubmissions: (site: Site) => void;
  onDeleteSite: (siteId: string) => void;
  onUpgrade: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  user,
  sites,
  subscription,
  trial,
  onNewSite,
  onEditSite,
  onViewSubmissions,
  onDeleteSite,
  onUpgrade,
}) => {
  const isBusiness = subscription?.status === 'active' && subscription.plan === 'business';
  const isPro = subscription?.status === 'active' && (subscription.plan === 'pro' || isBusiness);
  const isTrialExpired = !isPro && !!trial?.expired;
  const canCreateSite = sites.length < 1 && !isTrialExpired;

  return (
    <div className="space-y-8">
      {/* Welcome & Plan Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/10 border border-white/20 text-blue-100 mb-3">
            <Sparkles size={13} className="text-amber-300" />
            <span>GrowthMachine Studio</span>
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Hello, {user.name || user.email.split('@')[0]}!
          </h1>
          <p className="text-sm text-blue-100 mt-1 max-w-xl">
            Manage your AI-crafted websites, edit content, configure WhatsApp CTAs, and track customer inquiries.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 min-w-[220px] text-center">
          <div className="text-xs font-semibold text-blue-200 uppercase tracking-wider">
            {isBusiness
              ? 'Business Plan (₹799/mo)'
              : isPro
              ? 'Pro Plan (₹249/mo)'
              : trial?.expired
              ? '⚠️ Trial Expired'
              : `15-Day Free Trial (${trial?.days_left ?? 15}d left)`}
          </div>
          <div className="text-2xl font-black text-white mt-1">
            {sites.length === 0 ? '0' : '1'}
          </div>
          <div className="text-[11px] text-blue-200 mt-0.5">Active Website</div>
          {!isBusiness && (
            <button
              onClick={onUpgrade}
              className="mt-2.5 px-3 py-1 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-[11px] shadow-sm transition inline-flex items-center space-x-1"
            >
              <span>{isPro ? 'Upgrade to Business' : 'Upgrade Plan'}</span>
              <ArrowRight size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Trial Expired Alert Banner */}
      {isTrialExpired && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center space-x-2 text-xs">
            <Clock size={18} className="text-amber-600 shrink-0" />
            <span>
              <strong>Your 15-day free trial has expired.</strong> Upgrade to Pro (₹249/mo) or Business (₹799/mo) to publish and manage your websites.
            </span>
          </div>
          <button
            onClick={onUpgrade}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shrink-0 shadow-sm transition"
          >
            Upgrade to Pro — ₹249/mo
          </button>
        </div>
      )}

      {/* Sites Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Your Websites</h2>
          <p className="text-xs text-slate-500">
            {isBusiness
              ? 'Business tier with Custom Domain & 24/7 AI Receptionist'
              : isPro
              ? 'Pro tier with WhatsApp CTAs & Fast Cloud Hosting'
              : 'Free 15-day trial period • 1 site included'}
          </p>
        </div>
        <button
          onClick={() => {
            if (!canCreateSite) {
              onUpgrade();
            } else {
              onNewSite();
            }
          }}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition"
        >
          <Plus size={16} />
          <span>{canCreateSite ? 'New Website' : sites.length >= 1 ? 'One Site Per Account' : 'Trial Expired — Upgrade'}</span>
        </button>
      </div>

      {/* Site Grid or Empty State */}
      {sites.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-xl mx-auto shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 font-black text-2xl">
            ⚡
          </div>
          <h3 className="text-lg font-bold text-slate-900">No websites created yet</h3>
          <p className="text-xs text-slate-500 mt-1 mb-6 max-w-md mx-auto">
            Choose from our curated starter templates, enter a quick description, and let AI generate an editable website in under 10 seconds.
          </p>
          <button
            onClick={() => {
              if (isTrialExpired) onUpgrade();
              else onNewSite();
            }}
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition"
          >
            <Plus size={16} />
            <span>Create Your First Site</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sites.map((site) => (
            <div
              key={site.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition flex flex-col justify-between overflow-hidden"
            >
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 tracking-wider">
                    {site.template_id}
                  </span>
                  {site.status === 'published' ? (
                    <span className="inline-flex items-center space-x-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
                      <CheckCircle2 size={12} />
                      <span>Live</span>
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200/60">
                      Draft
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-slate-900 truncate mb-1">{site.name}</h3>
                <div className="text-xs text-slate-400 font-mono truncate mb-2">/s/{site.slug}</div>

                {site.custom_domain && (
                  <div className="mb-3 inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 text-[11px] font-bold">
                    <Globe size={11} />
                    <span className="truncate max-w-[180px]">{site.custom_domain}</span>
                  </div>
                )}

                <div className="text-[11px] text-slate-500">
                  Updated {new Date(site.updated_at).toLocaleDateString()}
                </div>
              </div>

              <div className="border-t border-slate-100 bg-slate-50/60 p-3 flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onEditSite(site.id)}
                    className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition"
                  >
                    <Edit3 size={13} />
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={() => onViewSubmissions(site)}
                    title="View Form Submissions"
                    className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 transition"
                  >
                    <MessageSquare size={13} className="text-slate-500" />
                    <span>Leads</span>
                  </button>

                  {site.status === 'published' && (
                    <a
                      href={site.custom_domain ? `https://${site.custom_domain}` : `/s/${site.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Open Live Website"
                      className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-blue-600 transition"
                    >
                      <ExternalLink size={14} />
                    </a>
                  )}
                </div>

                <button
                  onClick={() => {
                    if (confirm(`Are you sure you want to delete "${site.name}"?`)) {
                      onDeleteSite(site.id);
                    }
                  }}
                  title="Delete Site"
                  className="p-1.5 text-slate-400 hover:text-red-600 transition rounded-lg"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* GrowthMachine Studio Bespoke Agency Banner */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Custom Web Development</span>
          <h3 className="text-xl font-black mt-1">Need a custom bespoke website or full-stack web app?</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Our parent agency GrowthMachine Studio designs and develops high-converting custom digital experiences, bespoke UI/UX, and tailored software solutions.
          </p>
        </div>
        <a
          href="https://growthmachinestudio.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="px-6 py-3 rounded-2xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs shrink-0 shadow-lg transition inline-flex items-center space-x-1.5"
        >
          <span>Contact GrowthMachine Studio</span>
          <ArrowRight size={14} />
        </a>
      </div>
    </div>
  );
};
