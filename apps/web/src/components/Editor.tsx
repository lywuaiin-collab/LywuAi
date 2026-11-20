import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { Site, SiteContent, Subscription, TrialStatus } from '@lywuai/shared';
import { getTemplate } from '@lywuai/templates';
import { autosaveSite, publishSite } from '../api';
import { ImagePickerModal } from './ImagePickerModal';
import { UserGuideModal } from './UserGuideModal';
import {
  ArrowLeft,
  Smartphone,
  Tablet,
  Monitor,
  ExternalLink,
  Check,
  Palette,
  Search,
  MessageCircle,
  Layout,
  List,
  Image as ImageIcon,
  Send,
  HelpCircle,
  Bot,
  Sparkles,
  Globe,
} from 'lucide-react';
import { BuilderAiAssistant } from './BuilderAiAssistant';

interface EditorProps {
  initialSite: Site & { content: SiteContent };
  subscription?: Subscription | null;
  trial?: TrialStatus | null;
  onUpgrade?: (plan?: 'pro' | 'business') => void;
  onBack: () => void;
  onSiteUpdated: (site: Site) => void;
}

export const Editor: React.FC<EditorProps> = ({ initialSite, subscription, trial: _trial, onUpgrade, onBack, onSiteUpdated }) => {
  const isBusiness = subscription?.status === 'active' && subscription.plan === 'business';
  const isPro = subscription?.status === 'active' && (subscription.plan === 'pro' || isBusiness);
  const [site, setSite] = useState<Site>(initialSite);
  const [content, setContent] = useState<SiteContent>(initialSite.content);
  const [siteName, setSiteName] = useState(initialSite.name);
  const [siteSlug, setSiteSlug] = useState(initialSite.slug);
  const [customDomain, setCustomDomain] = useState(initialSite.custom_domain || '');
  const [domainSaving, setDomainSaving] = useState(false);
  const [domainMessage, setDomainMessage] = useState<{ text: string; error?: boolean } | null>(null);

  const [activeTab, setActiveTab] = useState<'theme' | 'seo' | 'cta' | 'hero' | 'sections' | 'contact' | 'ai_chat' | 'domain'>('hero');
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [publishing, setPublishing] = useState(false);
  const [publishUrl, setPublishUrl] = useState<string | null>(
    initialSite.status === 'published' ? `/s/${initialSite.slug}` : null
  );

  // Image Picker Modal state
  const [imagePickerTarget, setImagePickerTarget] = useState<'hero' | null>(null);
  const [guideOpen, setGuideOpen] = useState(false);

  const dirtyRef = useRef(false);
  const autosaveTimerRef = useRef<any>(null);

  // Client-Side 0ms Live Render (Zero Server Requests!)
  const renderedHtml = useMemo(() => {
    try {
      const tpl = getTemplate(content.template_id);
      return tpl.render(content, { slug: siteSlug });
    } catch {
      return '<html><body><p>Preview rendering error</p></body></html>';
    }
  }, [content, siteSlug]);

  // Debounced Autosave (2s delay, coalesced UPDATE)
  useEffect(() => {
    if (!dirtyRef.current) return;

    setSaveStatus('unsaved');
    if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);

    autosaveTimerRef.current = setTimeout(async () => {
      setSaveStatus('saving');
      const res = await autosaveSite(site.id, {
        content,
        name: siteName,
        slug: siteSlug,
        custom_domain: isBusiness ? (customDomain ? customDomain.trim().toLowerCase() : null) : undefined,
      });

      if (res.success) {
        setSaveStatus('saved');
        dirtyRef.current = false;
        onSiteUpdated({ ...site, name: siteName, slug: siteSlug, custom_domain: customDomain || null });
      } else {
        setSaveStatus('unsaved');
      }
    }, 2000);

    return () => {
      if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    };
  }, [content, siteName, siteSlug, site.id, customDomain, isBusiness]);

  const updateContent = (updater: (prev: SiteContent) => SiteContent) => {
    dirtyRef.current = true;
    setContent((prev) => updater({ ...prev }));
  };

  const handlePublish = async () => {
    setPublishing(true);
    // Ensure draft is saved first
    await autosaveSite(site.id, {
      content,
      name: siteName,
      slug: siteSlug,
      custom_domain: isBusiness ? (customDomain ? customDomain.trim().toLowerCase() : null) : undefined,
    });

    const res = await publishSite(site.id);
    setPublishing(false);

    if (res.success && res.url) {
      setPublishUrl(res.url);
      setSite((s) => ({ ...s, status: 'published', slug: res.slug || s.slug, custom_domain: customDomain || null }));
      const liveLink = customDomain ? `https://${customDomain}` : `${window.location.origin}${res.url}`;
      alert(`🎉 Congratulations! Your website is live at ${liveLink}`);
    } else {
      alert('Publishing error: ' + (res.error || 'Please try again.'));
    }
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-slate-100 z-50">
      {/* Top Control Bar */}
      <header className="h-14 bg-white border-b border-slate-200 px-4 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition px-2.5 py-1.5 rounded-lg hover:bg-slate-50"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Dashboard</span>
          </button>

          <a
            href="https://growthmachinestudio.com/"
            target="_blank"
            rel="noopener noreferrer"
            title="Need a bespoke custom website? Contact GrowthMachine Studio"
            className="hidden lg:flex items-center space-x-1.5 text-[11px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 px-2.5 py-1 rounded-lg transition"
          >
            <Sparkles size={12} className="text-amber-500" />
            <span>Need Custom Website? GrowthMachine Studio →</span>
          </a>

          <button
            onClick={() => setGuideOpen(true)}
            title="How to Edit & Publish"
            className="flex items-center space-x-1 text-xs font-bold text-slate-500 hover:text-blue-600 transition px-2 py-1.5 rounded-lg hover:bg-slate-50"
          >
            <HelpCircle size={15} />
            <span className="hidden md:inline">Guide</span>
          </button>

          <div className="h-5 w-px bg-slate-200"></div>

          <div className="flex items-center space-x-1">
            <input
              type="text"
              value={siteName}
              onChange={(e) => {
                dirtyRef.current = true;
                setSiteName(e.target.value);
              }}
              className="text-xs font-bold text-slate-900 px-2 py-1 rounded border border-transparent hover:border-slate-200 focus:border-blue-500 focus:outline-none max-w-[140px] sm:max-w-[180px]"
            />
            <span className="text-[10px] text-slate-400 font-mono hidden md:inline">/s/</span>
            <input
              type="text"
              value={siteSlug}
              onChange={(e) => {
                dirtyRef.current = true;
                setSiteSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'));
              }}
              className="text-[10px] font-mono text-slate-600 px-1.5 py-0.5 rounded border border-transparent hover:border-slate-200 focus:border-blue-500 focus:outline-none max-w-[110px] hidden md:inline"
            />
          </div>
        </div>

        {/* Center: Device Viewport Switcher */}
        <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
          <button
            onClick={() => setViewport('desktop')}
            title="Desktop View"
            className={`p-1.5 rounded-lg transition ${viewport === 'desktop' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
          >
            <Monitor size={16} />
          </button>
          <button
            onClick={() => setViewport('tablet')}
            title="Tablet View"
            className={`p-1.5 rounded-lg transition ${viewport === 'tablet' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
          >
            <Tablet size={16} />
          </button>
          <button
            onClick={() => setViewport('mobile')}
            title="Mobile View"
            className={`p-1.5 rounded-lg transition ${viewport === 'mobile' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
          >
            <Smartphone size={16} />
          </button>
        </div>

        {/* Right: Autosave & Publish */}
        <div className="flex items-center space-x-3">
          <div className="text-[11px] font-medium text-slate-400 hidden sm:flex items-center space-x-1">
            {saveStatus === 'saved' ? (
              <span className="text-emerald-600 flex items-center space-x-1">
                <Check size={12} />
                <span>Saved</span>
              </span>
            ) : saveStatus === 'saving' ? (
              <span>Saving...</span>
            ) : (
              <span>Unsaved changes</span>
            )}
          </div>

          {publishUrl && (
            <a
              href={publishUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-bold text-xs transition"
            >
              <span>Live Site</span>
              <ExternalLink size={12} />
            </a>
          )}

          <button
            onClick={handlePublish}
            disabled={publishing}
            className="flex items-center space-x-1.5 px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition disabled:opacity-50"
          >
            <Send size={13} />
            <span>{publishing ? 'Publishing...' : 'Publish Live'}</span>
          </button>
        </div>
      </header>

      {/* Editor Body: Left Sidebar + Center Preview */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Settings Sidebar */}
        <div className="w-80 sm:w-96 bg-white border-r border-slate-200 flex flex-col shrink-0 shadow-sm z-10">
          {/* Section Navigation Tabs */}
          <div className="flex border-b border-slate-200 text-xs font-bold text-slate-500 overflow-x-auto p-1 bg-slate-50">
            <button
              onClick={() => setActiveTab('hero')}
              className={`px-3 py-2 rounded-lg flex items-center space-x-1 whitespace-nowrap transition ${activeTab === 'hero' ? 'bg-white text-blue-600 shadow-xs' : 'hover:text-slate-800'}`}
            >
              <Layout size={14} />
              <span>Hero</span>
            </button>
            <button
              onClick={() => setActiveTab('sections')}
              className={`px-3 py-2 rounded-lg flex items-center space-x-1 whitespace-nowrap transition ${activeTab === 'sections' ? 'bg-white text-blue-600 shadow-xs' : 'hover:text-slate-800'}`}
            >
              <List size={14} />
              <span>Sections</span>
            </button>
            <button
              onClick={() => setActiveTab('cta')}
              className={`px-3 py-2 rounded-lg flex items-center space-x-1 whitespace-nowrap transition ${activeTab === 'cta' ? 'bg-white text-blue-600 shadow-xs' : 'hover:text-slate-800'}`}
            >
              <MessageCircle size={14} />
              <span>WhatsApp</span>
            </button>
            <button
              onClick={() => setActiveTab('theme')}
              className={`px-3 py-2 rounded-lg flex items-center space-x-1 whitespace-nowrap transition ${activeTab === 'theme' ? 'bg-white text-blue-600 shadow-xs' : 'hover:text-slate-800'}`}
            >
              <Palette size={14} />
              <span>Style</span>
            </button>
            <button
              onClick={() => setActiveTab('seo')}
              className={`px-3 py-2 rounded-lg flex items-center space-x-1 whitespace-nowrap transition ${activeTab === 'seo' ? 'bg-white text-blue-600 shadow-xs' : 'hover:text-slate-800'}`}
            >
              <Search size={14} />
              <span>SEO</span>
            </button>
            <button
              onClick={() => setActiveTab('domain')}
              className={`px-2.5 py-1.5 rounded-lg flex items-center space-x-1 whitespace-nowrap transition ${activeTab === 'domain' ? 'bg-white text-indigo-600 shadow-xs ring-1 ring-indigo-200' : 'hover:text-slate-800'}`}
            >
              <Globe size={13} className="text-indigo-600" />
              <span>Domain</span>
              <span className="px-1 py-0.2 rounded text-[9px] font-black bg-indigo-100 text-indigo-800 border border-indigo-300">
                BIZ
              </span>
            </button>
            <button
              onClick={() => setActiveTab('ai_chat')}
              className={`px-2.5 py-1.5 rounded-lg flex items-center space-x-1 whitespace-nowrap transition ${activeTab === 'ai_chat' ? 'bg-white text-indigo-600 shadow-xs ring-1 ring-indigo-200' : 'hover:text-slate-800'}`}
            >
              <Bot size={13} className="text-indigo-600" />
              <span>AI Bot</span>
              <span className="px-1 py-0.2 rounded text-[9px] font-black bg-indigo-100 text-indigo-800 border border-indigo-300">
                BIZ
              </span>
            </button>
          </div>

          {/* Tab Content Panel */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
            {/* HERO SECTION TAB */}
            {activeTab === 'hero' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="font-extrabold text-slate-900 text-sm">Hero Headline & CTA</span>
                  <label className="text-[11px] font-semibold text-slate-500 flex items-center space-x-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={content.sections.hero.enabled}
                      onChange={(e) =>
                        updateContent((c) => {
                          c.sections.hero.enabled = e.target.checked;
                          return c;
                        })
                      }
                      className="rounded text-blue-600"
                    />
                    <span>Enabled</span>
                  </label>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Headline</label>
                  <textarea
                    rows={2}
                    value={content.sections.hero.headline}
                    onChange={(e) =>
                      updateContent((c) => {
                        c.sections.hero.headline = e.target.value;
                        return c;
                      })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Subheadline</label>
                  <textarea
                    rows={3}
                    value={content.sections.hero.subhead}
                    onChange={(e) =>
                      updateContent((c) => {
                        c.sections.hero.subhead = e.target.value;
                        return c;
                      })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">CTA Label</label>
                    <input
                      type="text"
                      value={content.sections.hero.cta_label}
                      onChange={(e) =>
                        updateContent((c) => {
                          c.sections.hero.cta_label = e.target.value;
                          return c;
                        })
                      }
                      className="w-full p-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">CTA Link</label>
                    <input
                      type="text"
                      value={content.sections.hero.cta_url}
                      onChange={(e) =>
                        updateContent((c) => {
                          c.sections.hero.cta_url = e.target.value;
                          return c;
                        })
                      }
                      className="w-full p-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Hero Image</label>
                  {content.sections.hero.image_url ? (
                    <div className="relative rounded-xl overflow-hidden border border-slate-200 mb-2 aspect-video bg-slate-50">
                      <img src={content.sections.hero.image_url} alt="Hero" className="w-full h-full object-cover" />
                      <button
                        onClick={() =>
                          updateContent((c) => {
                            c.sections.hero.image_url = null;
                            return c;
                          })
                        }
                        className="absolute top-2 right-2 bg-slate-900/80 text-white p-1 rounded-md text-[10px]"
                      >
                        Remove
                      </button>
                    </div>
                  ) : null}
                  <button
                    onClick={() => setImagePickerTarget('hero')}
                    className="w-full py-2 px-3 rounded-xl border border-slate-200 hover:border-blue-500 text-slate-700 font-bold flex items-center justify-center space-x-1.5 transition"
                  >
                    <ImageIcon size={14} className="text-blue-600" />
                    <span>Choose Photo (Unsplash / Upload)</span>
                  </button>
                </div>
              </div>
            )}

            {/* SECTIONS TAB (Features, Menu, Projects, Pricing) */}
            {activeTab === 'sections' && (
              <div className="space-y-6">
                {/* Features Editor */}
                {content.sections.features && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                      <span className="font-bold text-slate-800">Features / Services</span>
                      <label className="text-[11px] font-semibold text-slate-500 flex items-center space-x-1">
                        <input
                          type="checkbox"
                          checked={content.sections.features.enabled}
                          onChange={(e) =>
                            updateContent((c) => {
                              if (c.sections.features) c.sections.features.enabled = e.target.checked;
                              return c;
                            })
                          }
                        />
                        <span>Enabled</span>
                      </label>
                    </div>

                    {content.sections.features.items.map((item, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) =>
                            updateContent((c) => {
                              if (c.sections.features) c.sections.features.items[idx].title = e.target.value;
                              return c;
                            })
                          }
                          placeholder="Feature Title"
                          className="w-full p-1.5 font-bold text-xs rounded border border-slate-200 bg-white"
                        />
                        <textarea
                          rows={2}
                          value={item.text}
                          onChange={(e) =>
                            updateContent((c) => {
                              if (c.sections.features) c.sections.features.items[idx].text = e.target.value;
                              return c;
                            })
                          }
                          placeholder="Feature Description"
                          className="w-full p-1.5 text-xs rounded border border-slate-200 bg-white"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Restaurant Menu Editor */}
                {content.sections.menu && (
                  <div className="space-y-4">
                    <div className="font-bold text-slate-800 pb-1 border-b border-slate-100">
                      Restaurant Menu Categories
                    </div>
                    {content.sections.menu.categories.map((cat, catIdx) => (
                      <div key={catIdx} className="space-y-2">
                        <input
                          type="text"
                          value={cat.category}
                          onChange={(e) =>
                            updateContent((c) => {
                              if (c.sections.menu) c.sections.menu.categories[catIdx].category = e.target.value;
                              return c;
                            })
                          }
                          className="w-full font-black text-xs p-1.5 rounded border border-slate-200"
                        />
                        {cat.items.map((item, itemIdx) => (
                          <div key={itemIdx} className="p-2 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={item.name}
                                onChange={(e) =>
                                  updateContent((c) => {
                                    if (c.sections.menu) c.sections.menu.categories[catIdx].items[itemIdx].name = e.target.value;
                                    return c;
                                  })
                                }
                                className="flex-1 font-semibold p-1 rounded border border-slate-200 bg-white"
                              />
                              <input
                                type="text"
                                value={item.price}
                                onChange={(e) =>
                                  updateContent((c) => {
                                    if (c.sections.menu) c.sections.menu.categories[catIdx].items[itemIdx].price = e.target.value;
                                    return c;
                                  })
                                }
                                className="w-16 font-bold p-1 rounded border border-slate-200 bg-white text-right"
                              />
                            </div>
                            <input
                              type="text"
                              value={item.description}
                              onChange={(e) =>
                                updateContent((c) => {
                                  if (c.sections.menu) c.sections.menu.categories[catIdx].items[itemIdx].description = e.target.value;
                                  return c;
                                })
                              }
                              className="w-full text-[11px] p-1 rounded border border-slate-200 bg-white text-slate-600"
                            />
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* WHATSAPP & PHONE ACTION BUTTONS TAB */}
            {activeTab === 'cta' && (
              <div className="space-y-4">
                <div className="pb-2 border-b border-slate-100">
                  <h4 className="font-extrabold text-slate-900 text-sm">Floating Action Buttons</h4>
                  <p className="text-[11px] text-slate-500">
                    Proven conversion boosters for local clients: adds a floating WhatsApp or Call button on the live site.
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">WhatsApp Floating Button</span>
                    <input
                      type="checkbox"
                      checked={content.contact_actions?.enable_whatsapp || false}
                      onChange={(e) =>
                        updateContent((c) => {
                          if (!c.contact_actions) c.contact_actions = { enable_whatsapp: false, enable_call: false };
                          c.contact_actions.enable_whatsapp = e.target.checked;
                          return c;
                        })
                      }
                      className="rounded text-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      WhatsApp Number (Include Country Code)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. +15551234567"
                      value={content.contact_actions?.whatsapp_number || ''}
                      onChange={(e) =>
                        updateContent((c) => {
                          if (!c.contact_actions) c.contact_actions = { enable_whatsapp: true, enable_call: false };
                          c.contact_actions.whatsapp_number = e.target.value;
                          return c;
                        })
                      }
                      className="w-full p-2 text-xs rounded-xl border border-emerald-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-blue-50/60 border border-blue-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">Click-to-Call Button</span>
                    <input
                      type="checkbox"
                      checked={content.contact_actions?.enable_call || false}
                      onChange={(e) =>
                        updateContent((c) => {
                          if (!c.contact_actions) c.contact_actions = { enable_whatsapp: false, enable_call: false };
                          c.contact_actions.enable_call = e.target.checked;
                          return c;
                        })
                      }
                      className="rounded text-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Telephone Number
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. +1 (555) 123-4567"
                      value={content.contact_actions?.call_number || ''}
                      onChange={(e) =>
                        updateContent((c) => {
                          if (!c.contact_actions) c.contact_actions = { enable_whatsapp: false, enable_call: true };
                          c.contact_actions.call_number = e.target.value;
                          return c;
                        })
                      }
                      className="w-full p-2 text-xs rounded-xl border border-blue-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* THEME & COLOR TAB */}
            {activeTab === 'theme' && (
              <div className="space-y-4">
                <div className="pb-2 border-b border-slate-100">
                  <h4 className="font-extrabold text-slate-900 text-sm">Theme & Branding</h4>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Primary Brand Color</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={content.theme.primary}
                      onChange={(e) =>
                        updateContent((c) => {
                          c.theme.primary = e.target.value;
                          return c;
                        })
                      }
                      className="w-8 h-8 rounded-lg cursor-pointer border-0"
                    />
                    <input
                      type="text"
                      value={content.theme.primary}
                      onChange={(e) =>
                        updateContent((c) => {
                          c.theme.primary = e.target.value;
                          return c;
                        })
                      }
                      className="flex-1 p-2 rounded-xl border border-slate-200 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Accent Color</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={content.theme.accent}
                      onChange={(e) =>
                        updateContent((c) => {
                          c.theme.accent = e.target.value;
                          return c;
                        })
                      }
                      className="w-8 h-8 rounded-lg cursor-pointer border-0"
                    />
                    <input
                      type="text"
                      value={content.theme.accent}
                      onChange={(e) =>
                        updateContent((c) => {
                          c.theme.accent = e.target.value;
                          return c;
                        })
                      }
                      className="flex-1 p-2 rounded-xl border border-slate-200 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Typography Font</label>
                  <select
                    value={content.theme.font}
                    onChange={(e) =>
                      updateContent((c) => {
                        c.theme.font = e.target.value;
                        return c;
                      })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="Inter">Inter (Clean Modern)</option>
                    <option value="Plus Jakarta Sans">Plus Jakarta Sans (SaaS & Tech)</option>
                    <option value="Outfit">Outfit (Friendly & Warm)</option>
                    <option value="Playfair Display">Playfair Display (Editorial Luxury)</option>
                  </select>
                </div>

                {/* Branding Badge Toggle (PRO Feature) */}
                <div className="pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <div className="pr-3">
                      <div className="flex items-center space-x-1.5">
                        <span className="font-bold text-slate-800 text-xs">Remove "Built with LywuAi" Badge</span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-amber-100 text-amber-800 border border-amber-200">
                          PRO
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {isPro
                          ? "Hide the LywuAi footer branding badge on your published website."
                          : "Free websites include a subtle 'Built with LywuAi' badge. Upgrade to Pro to remove it."}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={content.hide_badge || false}
                        onChange={(e) => {
                          if (!isPro) {
                            onUpgrade?.();
                            return;
                          }
                          updateContent((c) => {
                            c.hide_badge = e.target.checked;
                            return c;
                          });
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* SEO TAB */}
            {activeTab === 'seo' && (
              <div className="space-y-4">
                <div className="pb-2 border-b border-slate-100">
                  <h4 className="font-extrabold text-slate-900 text-sm">SEO & Social Meta Tags</h4>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Browser Title Tag</label>
                  <input
                    type="text"
                    value={content.seo.title}
                    onChange={(e) =>
                      updateContent((c) => {
                        c.seo.title = e.target.value;
                        return c;
                      })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Meta Description</label>
                  <textarea
                    rows={3}
                    value={content.seo.description}
                    onChange={(e) =>
                      updateContent((c) => {
                        c.seo.description = e.target.value;
                        return c;
                      })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
              </div>
            )}

            {/* CUSTOM DOMAIN (BUSINESS PLAN EXCLUSIVE) */}
            {activeTab === 'domain' && (
              <div className="space-y-4">
                <div className="pb-2 border-b border-slate-100 flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <h4 className="font-extrabold text-slate-900 text-sm">Custom Domain</h4>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-indigo-100 text-indigo-800 border border-indigo-300">
                        BUSINESS PLAN
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Connect your own domain (e.g. <code>yourbusiness.com</code>) to your published website.
                    </p>
                  </div>
                </div>

                {!isBusiness ? (
                  <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200/90 space-y-2.5">
                    <div className="flex items-center space-x-2 text-indigo-900 font-bold text-xs">
                      <Globe size={16} className="text-indigo-600" />
                      <span>Business Exclusive Feature</span>
                    </div>
                    <p className="text-[11px] text-indigo-800 leading-relaxed">
                      Connecting a custom branded domain is exclusive to the Business Plan (₹799/mo). Upgrade to Business to connect your own domain with automatic fast cloud hosting.
                    </p>
                    <button
                      type="button"
                      onClick={() => onUpgrade?.('business')}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xs shadow-sm shadow-indigo-500/20 transition flex items-center justify-center space-x-1.5"
                    >
                      <Sparkles size={14} />
                      <span>Upgrade to Business — ₹799/mo</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-3">
                      <label className="block font-bold text-slate-700">Domain Name</label>
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={customDomain}
                          placeholder="e.g. yourbusiness.com"
                          onChange={(e) => {
                            setCustomDomain(e.target.value);
                            dirtyRef.current = true;
                          }}
                          className="flex-1 p-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                        />
                        <button
                          type="button"
                          disabled={domainSaving}
                          onClick={async () => {
                            setDomainSaving(true);
                            setDomainMessage(null);
                            const clean = customDomain.trim().toLowerCase();
                            const res = await autosaveSite(site.id, { custom_domain: clean || null });
                            setDomainSaving(false);
                            if (res.success) {
                              setDomainMessage({ text: clean ? 'Domain saved successfully!' : 'Domain cleared.' });
                              onSiteUpdated({ ...site, custom_domain: clean || null });
                            } else {
                              setDomainMessage({ text: res.error || 'Failed to save domain', error: true });
                            }
                          }}
                          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition disabled:opacity-50"
                        >
                          {domainSaving ? 'Saving...' : 'Save'}
                        </button>
                      </div>

                      {domainMessage && (
                        <p className={`text-[11px] font-semibold ${domainMessage.error ? 'text-red-600' : 'text-emerald-600'}`}>
                          {domainMessage.text}
                        </p>
                      )}
                    </div>

                    {/* DNS Configuration Instructions */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                      <h5 className="font-bold text-slate-800 text-xs">DNS Setup Instructions</h5>
                      <p className="text-[11px] text-slate-600">
                        Log in to where you purchased your domain (GoDaddy, Namecheap, Cloudflare, etc.) and add this CNAME record:
                      </p>
                      <div className="bg-white rounded-xl p-3 border border-slate-200 font-mono text-[11px] space-y-1">
                        <div className="flex justify-between"><span className="text-slate-400">Type:</span> <span className="font-bold">CNAME</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">Host / Name:</span> <span className="font-bold">@ (or www)</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">Value / Target:</span> <span className="font-bold text-indigo-600">cname.lywuai.com</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">TTL:</span> <span className="font-bold">Automatic / 3600</span></div>
                      </div>
                      <p className="text-[10px] text-slate-400">
                        Once saved, DNS changes usually propagate globally in 5 to 15 minutes.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 24/7 AI RECEPTIONIST CHATBOT (BUSINESS FEATURE) */}
            {activeTab === 'ai_chat' && (
              <div className="space-y-4">
                <div className="pb-2 border-b border-slate-100 flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <h4 className="font-extrabold text-slate-900 text-sm">24/7 AI Receptionist</h4>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-indigo-100 text-indigo-800 border border-indigo-300">
                        BUSINESS PLAN
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Answers visitor inquiries 24/7, captures leads, and guides clients to call or WhatsApp you.
                    </p>
                  </div>
                </div>

                {/* Pricing / Value Box */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-50/80 to-purple-50/80 border border-indigo-200/80 space-y-2">
                  <div className="flex items-center space-x-2">
                    <Sparkles size={16} className="text-indigo-600" />
                    <span className="font-bold text-slate-800">Included in Business Plan (₹799/mo)</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Powered by LywuAi Copilot. Automatically learns your website's services, hours, and contact details to give accurate answers.
                  </p>
                </div>

                {/* Business Exclusive Upgrade Banner */}
                {!isBusiness && (
                  <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200/90 space-y-2.5">
                    <div className="flex items-center space-x-2 text-indigo-900 font-bold text-xs">
                      <Sparkles size={16} className="text-indigo-600" />
                      <span>Business Exclusive Feature</span>
                    </div>
                    <p className="text-[11px] text-indigo-800 leading-relaxed">
                      The 24/7 AI Receptionist is an exclusive feature for Business plan members. Upgrade to Business (₹799/mo) to enable automated conversational lead capture on your live website.
                    </p>
                    <button
                      type="button"
                      onClick={() => onUpgrade?.('business')}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xs shadow-sm shadow-indigo-500/20 transition flex items-center justify-center space-x-1.5"
                    >
                      <Sparkles size={14} />
                      <span>Upgrade to Business — ₹799/mo (or ₹7,999/yr)</span>
                    </button>
                  </div>
                )}

                {/* Enable Toggle */}
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 block">Enable Live AI Chatbot</span>
                      <span className="text-[10px] text-slate-500">Displays floating chat bubble on published site</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={content.ai_chat?.enabled || false}
                        onChange={(e) => {
                          if (!isBusiness) {
                            onUpgrade?.('business');
                            return;
                          }
                          updateContent((c) => {
                            if (!c.ai_chat) {
                              c.ai_chat = {
                                enabled: false,
                                is_pro: true,
                                bot_name: `${siteName.split('-')[0].trim()} Assistant`,
                                welcome_message: `Hello! I'm the 24/7 AI Receptionist for ${siteName}. How can I help you today?`,
                              };
                            }
                            c.ai_chat.enabled = e.target.checked;
                            c.ai_chat.is_pro = true;
                            return c;
                          });
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>

                  {content.ai_chat?.enabled && (
                    <div className="space-y-3 pt-3 border-t border-slate-100">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Bot Name</label>
                        <input
                          type="text"
                          value={content.ai_chat?.bot_name || ''}
                          placeholder="e.g. Apex Assistant"
                          onChange={(e) =>
                            updateContent((c) => {
                              if (!c.ai_chat) c.ai_chat = { enabled: true, is_pro: true };
                              c.ai_chat.bot_name = e.target.value;
                              return c;
                            })
                          }
                          className="w-full p-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Greeting / Welcome Message</label>
                        <textarea
                          rows={3}
                          value={content.ai_chat?.welcome_message || ''}
                          placeholder="e.g. Hello! Ask me about our services, pricing, or hours."
                          onChange={(e) =>
                            updateContent((c) => {
                              if (!c.ai_chat) c.ai_chat = { enabled: true, is_pro: true };
                              c.ai_chat.welcome_message = e.target.value;
                              return c;
                            })
                          }
                          className="w-full p-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[10px] text-slate-600 flex items-center space-x-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                        <span>Preview this live in the center frame! Click the chat icon in the bottom right corner.</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center: Live Client-Side Rendered Iframe */}
        <div className="flex-1 flex items-center justify-center p-4 overflow-hidden bg-slate-200/70">
          <div
            className={`h-full transition-all duration-300 bg-white shadow-2xl rounded-2xl overflow-hidden border border-slate-300 flex flex-col ${
              viewport === 'desktop'
                ? 'w-full'
                : viewport === 'tablet'
                ? 'w-[768px]'
                : 'w-[375px]'
            }`}
          >
            <iframe
              title="Site Live Preview"
              srcDoc={renderedHtml}
              className="w-full h-full border-none"
              sandbox="allow-scripts allow-forms allow-same-origin"
            />
          </div>
        </div>
      </div>

      {/* User Guide Modal */}
      <UserGuideModal
        isOpen={guideOpen}
        onClose={() => setGuideOpen(false)}
      />

      {/* Image Picker Modal */}
      {imagePickerTarget && (
        <ImagePickerModal
          isOpen={true}
          siteId={site.id}
          onClose={() => setImagePickerTarget(null)}
          onSelectImage={(url) => {
            updateContent((c) => {
              if (imagePickerTarget === 'hero') c.sections.hero.image_url = url;
              return c;
            });
          }}
        />
      )}
      {/* Floating Builder Copilot Assistant */}
      <BuilderAiAssistant
        currentSite={{
          name: siteName,
          template_id: content.template_id,
          content,
        }}
      />
    </div>
  );
};
