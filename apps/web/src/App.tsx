import React, { useState, useEffect } from 'react';
import type { User, Site, SiteContent, Subscription, TrialStatus } from '@lywuai/shared';
import { fetchMe, fetchUserSites, fetchSite, deleteSite, logoutUser, getSubscriptionStatus } from './api';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { TemplatePicker } from './components/TemplatePicker';
import { Editor } from './components/Editor';
import { AuthModal } from './components/AuthModal';
import { SubmissionsModal } from './components/SubmissionsModal';
import { UserGuideModal } from './components/UserGuideModal';
import { TemplateShowcase } from './components/TemplateShowcase';
import { BuilderAiAssistant } from './components/BuilderAiAssistant';
import { PolicyModal, type PolicyTab } from './components/PolicyModal';

export const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);

  // View state: 'dashboard' | 'template_picker' | 'editor'
  const [view, setView] = useState<'dashboard' | 'template_picker' | 'editor'>('dashboard');
  const [activeSite, setActiveSite] = useState<(Site & { content: SiteContent }) | null>(null);

  // Modal states
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [submissionsSite, setSubmissionsSite] = useState<Site | null>(null);
  const [guideModalOpen, setGuideModalOpen] = useState(false);
  const [policyModalOpen, setPolicyModalOpen] = useState(false);
  const [policyTab, setPolicyTab] = useState<PolicyTab>('terms');
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [trial, setTrial] = useState<TrialStatus | null>(null);

  useEffect(() => {
    initApp();

    // Check for deep-linked policy URLs (e.g. /terms, /privacy, /refund, /contact)
    const path = window.location.pathname.toLowerCase().replace(/^\/+|\/+$/g, '');
    if (path === 'terms' || path === 'terms-and-conditions') {
      setPolicyTab('terms');
      setPolicyModalOpen(true);
    } else if (path === 'privacy' || path === 'privacy-policy') {
      setPolicyTab('privacy');
      setPolicyModalOpen(true);
    } else if (path === 'refund' || path === 'refund-policy' || path === 'cancellation-policy') {
      setPolicyTab('refund');
      setPolicyModalOpen(true);
    } else if (path === 'contact' || path === 'contact-us') {
      setPolicyTab('contact');
      setPolicyModalOpen(true);
    } else if (path === 'shipping' || path === 'delivery') {
      setPolicyTab('shipping');
      setPolicyModalOpen(true);
    }
  }, []);

  const initApp = async () => {
    setLoading(true);
    const currentUser = await fetchMe();
    setUser(currentUser);
    if (currentUser) {
      const userSites = await fetchUserSites();
      setSites(userSites);
      const subResult = await getSubscriptionStatus();
      setSubscription(subResult.subscription);
      if (subResult.trial) setTrial(subResult.trial);
    }
    setLoading(false);
  };

  const handleEditSite = async (siteId: string) => {
    const res = await fetchSite(siteId);
    if (res.site) {
      setActiveSite(res.site);
      setView('editor');
    } else {
      alert('Could not load site');
    }
  };

  const handleSiteCreated = async (siteId: string) => {
    const res = await fetchSite(siteId);
    if (res.site) {
      setActiveSite(res.site);
      setView('editor');
      const updatedSites = await fetchUserSites();
      setSites(updatedSites);
    }
  };

  const handleDeleteSite = async (siteId: string) => {
    const ok = await deleteSite(siteId);
    if (ok) {
      setSites((prev) => prev.filter((s) => s.id !== siteId));
    } else {
      alert('Failed to delete site');
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
    setSites([]);
    setSubscription(null);
    setView('dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black animate-pulse">
            L
          </div>
          <span className="text-xs font-bold text-slate-500">Loading LywuAi...</span>
        </div>
      </div>
    );
  }

  // If in Editor view, render full-screen editor
  if (view === 'editor' && activeSite) {
    return (
      <Editor
        initialSite={activeSite}
        subscription={subscription}
        trial={trial}
        onBack={() => {
          setView('dashboard');
          fetchUserSites().then(setSites);
        }}
        onSiteUpdated={(updated) => {
          setSites((prev) => prev.map((s) => (s.id === updated.id ? { ...s, ...updated } : s)));
        }}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar
        user={user}
        subscription={subscription}
        trial={trial}
        onOpenAuth={() => setAuthModalOpen(true)}
        onLogout={handleLogout}
        onNewSite={() => {
          if (!user) {
            setAuthModalOpen(true);
          } else {
            setView('template_picker');
          }
        }}
        onGoHome={() => setView('dashboard')}
        onOpenGuide={() => setGuideModalOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!user ? (
          // Landing View for Visitors — public, no login needed to browse
          <div>
            {/* ── Hero ── */}
            <div className="text-center py-16 sm:py-24 max-w-3xl mx-auto space-y-6">
              <span className="inline-flex items-center px-3.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-xs">
                ⚡ 100% Free Forever • Custom Domain &amp; AI Receptionist Included
              </span>
              <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-none">
                Launch Your Business Website in 60 Seconds.
              </h1>
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
                Professional responsive templates, smart AI copy generation, instant live preview, WhatsApp chat, 24/7 AI Receptionist, and your own custom domain. 100% free for everyone — no credit card, no subscription.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-xl shadow-blue-500/25 transition transform hover:-translate-y-0.5"
                >
                  Start Building — It's 100% Free
                </button>
                {/* Browse Templates scrolls down — NO login popup */}
                <a
                  href="#templates"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm transition"
                >
                  Browse Templates ↓
                </a>
              </div>

              {/* Feature Highlights Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-16 text-left">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="text-xl mb-2">⚡</div>
                  <h3 className="font-bold text-sm text-slate-900 mb-1">Sub-50ms Fast Cloud Hosting</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Published statically across high-speed global cloud infrastructure with zero server latency.
                  </p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="text-xl mb-2">💬</div>
                  <h3 className="font-bold text-sm text-slate-900 mb-1">WhatsApp &amp; Call CTA</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Turn visitors into paying customers with 1-click floating WhatsApp chat and phone buttons.
                  </p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="text-xl mb-2">🛡️</div>
                  <h3 className="font-bold text-sm text-slate-900 mb-1">Smart Spam Protection</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Built-in intelligent spam defense guards your contact forms without annoying captchas.
                  </p>
                </div>
              </div>
            </div>

            {/* ── Template Showcase — 100% public, no login to browse or preview ── */}
            <TemplateShowcase onUseTemplate={() => setAuthModalOpen(true)} />
          </div>
        ) : view === 'template_picker' ? (
          <TemplatePicker
            onCancel={() => setView('dashboard')}
            onSiteCreated={handleSiteCreated}
          />
        ) : (
          <Dashboard
            user={user}
            sites={sites}
            subscription={subscription}
            trial={trial}
            onNewSite={() => setView('template_picker')}
            onEditSite={handleEditSite}
            onViewSubmissions={(s) => setSubmissionsSite(s)}
            onDeleteSite={handleDeleteSite}
            onUpgrade={() => {}}
          />
        )}
      </main>

      <footer className="border-t border-slate-200 bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-6 gap-y-2 text-xs font-semibold text-slate-600">
            <button
              onClick={() => { setPolicyTab('terms'); setPolicyModalOpen(true); }}
              className="hover:text-blue-600 transition"
            >
              Terms of Service
            </button>
            <button
              onClick={() => { setPolicyTab('privacy'); setPolicyModalOpen(true); }}
              className="hover:text-blue-600 transition"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => { setPolicyTab('refund'); setPolicyModalOpen(true); }}
              className="hover:text-blue-600 transition"
            >
              Refund &amp; Cancellation
            </button>
            <button
              onClick={() => { setPolicyTab('shipping'); setPolicyModalOpen(true); }}
              className="hover:text-blue-600 transition"
            >
              Shipping &amp; Delivery
            </button>
            <button
              onClick={() => { setPolicyTab('contact'); setPolicyModalOpen(true); }}
              className="hover:text-blue-600 transition"
            >
              Contact Us
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 pt-4 border-t border-slate-100 space-y-3 sm:space-y-0">
            <div>© {new Date().getFullYear()} LywuAi — Launch Your Website Using AI. All rights reserved.</div>

            <div className="studio-credit inline-flex items-center gap-2.5 rounded-full border border-slate-200/90 px-4 py-1.5 bg-white/90">
              <span className="studio-credit__pulse h-2 w-2 shrink-0 rounded-full bg-amber-400" aria-hidden="true"></span>
              <span className="text-[10px] uppercase tracking-[0.15em] text-slate-400 font-bold">Designed by</span>
              <a
                href="https://growthmachinestudio.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="relative z-10 font-bold text-slate-800 transition-colors hover:text-amber-600"
                aria-label="Designed by GrowthMachine Studio"
              >
                GrowthMachine Studio
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={(loggedUser) => {
          setUser(loggedUser);
          fetchUserSites().then(setSites);
          getSubscriptionStatus().then((r) => {
            setSubscription(r.subscription);
            if (r.trial) setTrial(r.trial);
          });
        }}
      />

      {/* Submissions Inquiries Modal */}
      <SubmissionsModal
        site={submissionsSite}
        onClose={() => setSubmissionsSite(null)}
      />

      {/* User Quick Guide Modal */}
      <UserGuideModal
        isOpen={guideModalOpen}
        onClose={() => setGuideModalOpen(false)}
      />

      {/* Floating AI Builder Assistant Copilot */}
      <BuilderAiAssistant
        userEmail={user?.email}
        userName={user?.name || undefined}
      />

      {/* Compliance & Policy Modal */}
      <PolicyModal
        isOpen={policyModalOpen}
        initialTab={policyTab}
        onClose={() => setPolicyModalOpen(false)}
      />
    </div>
  );
};
