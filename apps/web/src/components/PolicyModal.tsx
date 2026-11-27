import React from 'react';
import { X, Shield, FileText, RefreshCw, Mail, Truck } from 'lucide-react';

export type PolicyTab = 'terms' | 'privacy' | 'refund' | 'contact' | 'shipping';

interface PolicyModalProps {
  isOpen: boolean;
  initialTab?: PolicyTab;
  onClose: () => void;
}

export const PolicyModal: React.FC<PolicyModalProps> = ({
  isOpen,
  initialTab = 'terms',
  onClose,
}) => {
  const [tab, setTab] = React.useState<PolicyTab>(initialTab);

  React.useEffect(() => {
    if (initialTab) setTab(initialTab);
  }, [initialTab]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-xl font-black text-slate-900">Legal & Compliance</h2>
            <p className="text-xs text-slate-500 mt-0.5">LywuAi (Launch Your Website Using AI) policies</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab navigation */}
        <div className="flex border-b border-slate-200 bg-white overflow-x-auto px-4 sm:px-6 scrollbar-none">
          <button
            onClick={() => setTab('terms')}
            className={`flex items-center space-x-1.5 py-3 px-3 text-xs font-bold border-b-2 transition shrink-0 ${
              tab === 'terms'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <FileText size={14} />
            <span>Terms of Service</span>
          </button>
          <button
            onClick={() => setTab('privacy')}
            className={`flex items-center space-x-1.5 py-3 px-3 text-xs font-bold border-b-2 transition shrink-0 ${
              tab === 'privacy'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Shield size={14} />
            <span>Privacy Policy</span>
          </button>
          <button
            onClick={() => setTab('refund')}
            className={`flex items-center space-x-1.5 py-3 px-3 text-xs font-bold border-b-2 transition shrink-0 ${
              tab === 'refund'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <RefreshCw size={14} />
            <span>Refund & Cancellation</span>
          </button>
          <button
            onClick={() => setTab('shipping')}
            className={`flex items-center space-x-1.5 py-3 px-3 text-xs font-bold border-b-2 transition shrink-0 ${
              tab === 'shipping'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Truck size={14} />
            <span>Delivery Policy</span>
          </button>
          <button
            onClick={() => setTab('contact')}
            className={`flex items-center space-x-1.5 py-3 px-3 text-xs font-bold border-b-2 transition shrink-0 ${
              tab === 'contact'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Mail size={14} />
            <span>Contact Us</span>
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-600 leading-relaxed max-h-[60vh]">
          {tab === 'terms' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900">1. Acceptance of Terms</h3>
              <p>
                By signing up for or using LywuAi (&quot;Service&quot;), provided at https://lywuai.com, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the Service.
              </p>

              <h3 className="text-sm font-bold text-slate-900">2. Service Description</h3>
              <p>
                LywuAi is a SaaS platform providing AI-powered website building, hosting, analytics, WhatsApp CTA integrations, and conversational AI receptionists for businesses and entrepreneurs.
              </p>

              <h3 className="text-sm font-bold text-slate-900">3. Subscription Pricing & Terms</h3>
              <p>
                LywuAi requires a $1/month subscription for all users, including AI generation, hosting, WhatsApp integrations, 24/7 AI Receptionist, and custom domain connection. No credit card or recurring subscription is required.
              </p>

              <h3 className="text-sm font-bold text-slate-900">4. Permissible Use</h3>
              <p>
                You agree not to use the Service to publish unlawful, abusive, deceptive, defamatory, or fraudulent content. Websites violating Indian cyber laws (Information Technology Act, 2000) or international regulations will be terminated immediately.
              </p>

              <h3 className="text-sm font-bold text-slate-900">5. Limitation of Liability</h3>
              <p>
                LywuAi and its operators shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the Service.
              </p>
            </div>
          )}

          {tab === 'privacy' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900">1. Information We Collect</h3>
              <p>
                We collect your name, email address, password hash, and website configuration data when you register and build websites. Payment information (credit/debit cards, UPI, net banking) is processed securely through Razorpay; LywuAi does not store sensitive banking or card credentials.
              </p>

              <h3 className="text-sm font-bold text-slate-900">2. How We Use Information</h3>
              <p>
                Your information is used solely to provide, operate, and maintain the LywuAi website builder, authenticate your login sessions, manage your subscription billing, and deliver customer support.
              </p>

              <h3 className="text-sm font-bold text-slate-900">3. Data Security</h3>
              <p>
                We employ industry-standard SSL/TLS encryption, salted password hashing, and secure edge cloud infrastructure to protect your personal and website data from unauthorized access.
              </p>

              <h3 className="text-sm font-bold text-slate-900">4. Third-Party Disclosures</h3>
              <p>
                We do not sell, rent, or trade your personal information. Data is only shared with authorized service partners essential for service delivery (e.g. AI and infrastructure providers).
              </p>
            </div>
          )}

          {tab === 'refund' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900">LywuAi Subscription Terms: $1/month, Auto-renews, No Refunds</h3>
              <p>
                LywuAi is completely free for all users. There are <strong>no subscription fees, no recurring charges, and no credit card required</strong> to use any feature on the platform — including live publishing, custom domain connection, 24/7 AI Receptionist, and all 10 industry templates.
              </p>

              <h3 className="text-sm font-bold text-slate-900">Custom Agency Builds (GrowthMachine Studio)</h3>
              <p>
                If you commission a bespoke custom web design, branding, or marketing project through our partner agency <strong>GrowthMachine Studio</strong> (<a href="https://growthmachinestudio.com/" target="_blank" rel="noopener noreferrer">growthmachinestudio.com</a>), those engagements are governed by a separate client agreement with their own payment and refund terms.
              </p>

              <h3 className="text-sm font-bold text-slate-900">Questions?</h3>
              <p>
                If you have any billing questions or concerns, email us at <strong>support@lywuai.com</strong> or raise a support ticket from the LywuAi dashboard.
              </p>
            </div>
          )}

          {tab === 'shipping' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900">1. Digital Service Delivery</h3>
              <p>
                LywuAi provides 100% cloud-based Software as a Service (SaaS). <strong>No physical goods or packages are shipped.</strong>
              </p>

              <h3 className="text-sm font-bold text-slate-900">2. Instant Access</h3>
              <p>
                Upon successful registration, your account and all features are activated <strong>immediately and automatically</strong>. A confirmation is sent to your registered email address.
              </p>
            </div>
          )}

          {tab === 'contact' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900">Contact & Support Details</h3>
              <p>
                For customer service, billing inquiries, or technical support, please contact us:
              </p>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div>
                  <strong>Platform:</strong> LywuAi (Launch Your Website Using AI)
                </div>
                <div>
                  <strong>Parent Studio:</strong> GrowthMachine Studio
                </div>
                <div>
                  <strong>Support Email:</strong>{' '}
                  <a href="mailto:support@lywuai.com" className="text-blue-600 hover:underline">
                    support@lywuai.com
                  </a>
                </div>
                <div>
                  <strong>Help Desk:</strong> Built-in 24/7 Support Ticket Center in dashboard
                </div>
                <div>
                  <strong>Operating Country:</strong> India
                </div>
                <div>
                  <strong>Support Hours:</strong> Monday – Saturday, 9:00 AM – 7:00 PM IST
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
