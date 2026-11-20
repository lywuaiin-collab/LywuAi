import React, { useState } from 'react';
import { X, CreditCard, Smartphone, Building2, Wallet, Shield, Zap, CheckCircle2, Loader2 } from 'lucide-react';
import { createPaymentOrder, verifyPayment } from '../api';

// Extend Window for Razorpay checkout script
declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void; on: (event: string, cb: () => void) => void };
  }
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (sub: { status: string; plan: string; current_period_end: string }) => void;
  userEmail?: string;
  userName?: string;
  initialPlan?: 'pro' | 'business';
}

const PRO_FEATURES = [
  'WhatsApp & Click-to-Call direct buttons',
  'Remove "Built with LywuAi" badge',
  '25 custom media uploads (10 MB)',
  '50 AI copy generations per day',
  'All 10 industry starter templates',
  'Fast cloud hosting with sub-50ms latency',
  'Smart spam protection',
  'Customer lead capture inbox',
];

const BUSINESS_FEATURES = [
  'Connect Custom Domain (yourdomain.com)',
  '24/7 AI Receptionist Chatbot for visitors',
  'WhatsApp & Click-to-Call direct buttons',
  'Remove "Built with LywuAi" badge',
  '100 custom media uploads (50 MB)',
  '200 AI copy generations per day',
  'Priority support ticket dispatch',
  'All 10 industry starter templates',
  'Fast cloud hosting with sub-50ms latency',
];

const PAYMENT_METHODS = [
  { id: 'card', icon: CreditCard, label: 'Credit / Debit Card', desc: 'Visa, Mastercard, Amex, RuPay' },
  { id: 'upi', icon: Smartphone, label: 'UPI', desc: 'PhonePe, GPay, Paytm, BHIM' },
  { id: 'netbanking', icon: Building2, label: 'Net Banking', desc: 'All major Indian banks' },
  { id: 'wallet', icon: Wallet, label: 'Wallets & EMI', desc: 'Paytm, PhonePe, Bajaj Pay' },
];

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  userEmail,
  userName,
  initialPlan = 'pro',
}) => {
  const [selectedPlan, setSelectedPlan] = useState<'pro' | 'business'>(initialPlan);
  const [step, setStep] = useState<'plan' | 'processing' | 'success' | 'error'>('plan');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  // Load Razorpay checkout script dynamically
  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const isBusiness = selectedPlan === 'business';
  const priceDisplay = isBusiness
    ? billingCycle === 'yearly'
      ? '₹7,999'
      : '₹799'
    : billingCycle === 'yearly'
    ? '₹2,499'
    : '₹249';

  const monthlyEquivalent = isBusiness
    ? billingCycle === 'yearly'
      ? '₹666/mo'
      : '/month'
    : billingCycle === 'yearly'
    ? '₹208/mo'
    : '/month';

  const handlePayment = async () => {
    setStep('processing');
    setErrorMsg('');

    try {
      // 1. Create order on backend (plan & cycle)
      const order = await createPaymentOrder(selectedPlan, billingCycle);

      if (order.error) {
        setErrorMsg(order.error);
        setStep('error');
        return;
      }

      // Dev mode — simulate payment success directly
      if (order.dev_mode) {
        const result = await verifyPayment({
          razorpay_order_id: order.order_id,
          razorpay_payment_id: 'pay_DEV_' + Date.now(),
          razorpay_signature: 'dev_signature',
          plan: selectedPlan,
          period: billingCycle,
        });
        if (result.success && result.subscription) {
          setStep('success');
          onSuccess(result.subscription);
        } else {
          setErrorMsg(result.error || 'Dev mode activation failed');
          setStep('error');
        }
        return;
      }

      // 2. Load Razorpay checkout
      const loaded = await loadRazorpayScript();
      if (!loaded || !window.Razorpay) {
        setErrorMsg('Could not load payment gateway. Please try again.');
        setStep('error');
        return;
      }

      // 3. Open Razorpay checkout modal
      const rzp = new window.Razorpay({
        key: order.key_id,
        amount: order.amount,
        currency: order.currency,
        order_id: order.order_id,
        name: 'LywuAi',
        description: `${selectedPlan === 'business' ? 'Business Plan' : 'Pro Plan'} — ${
          billingCycle === 'yearly' ? 'Yearly Subscription (Save 17%)' : 'Monthly Subscription'
        }`,
        image: '',
        prefill: {
          email: userEmail || '',
          name: userName || '',
        },
        theme: {
          color: selectedPlan === 'business' ? '#4f46e5' : '#2563eb',
        },
        handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          // 4. Verify payment
          const result = await verifyPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            plan: selectedPlan,
            period: billingCycle,
          });

          if (result.success && result.subscription) {
            setStep('success');
            onSuccess(result.subscription);
          } else {
            setErrorMsg(result.error || 'Payment verification failed');
            setStep('error');
          }
        },
        modal: {
          ondismiss: () => {
            setStep('plan');
          },
        },
      });

      rzp.on('payment.failed', () => {
        setErrorMsg('Payment failed. Please try again or use a different method.');
        setStep('error');
      });

      rzp.open();
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong');
      setStep('error');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[92vh] overflow-y-auto relative">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition z-10"
        >
          <X size={20} />
        </button>

        {/* ── Plan View ── */}
        {step === 'plan' && (
          <div className="p-6 sm:p-8">
            {/* Plan Switcher: Pro vs Business */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <button
                type="button"
                onClick={() => setSelectedPlan('pro')}
                className={`p-3.5 rounded-2xl border text-left transition relative ${
                  selectedPlan === 'pro'
                    ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-black uppercase text-blue-700 tracking-wider">Pro Plan</span>
                  <span className="text-[10px] font-bold text-slate-500">5 Sites</span>
                </div>
                <div className="text-lg font-black text-slate-900">
                  {billingCycle === 'yearly' ? '₹2,499' : '₹249'}
                  <span className="text-xs font-normal text-slate-500">{billingCycle === 'yearly' ? '/yr' : '/mo'}</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">WhatsApp CTAs & No Badge</p>
              </button>

              <button
                type="button"
                onClick={() => setSelectedPlan('business')}
                className={`p-3.5 rounded-2xl border text-left transition relative ${
                  selectedPlan === 'business'
                    ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-black uppercase text-indigo-700 tracking-wider">Business</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-indigo-600 text-white">HOT</span>
                </div>
                <div className="text-lg font-black text-slate-900">
                  {billingCycle === 'yearly' ? '₹7,999' : '₹799'}
                  <span className="text-xs font-normal text-slate-500">{billingCycle === 'yearly' ? '/yr' : '/mo'}</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">Custom Domain & AI Bot</p>
              </button>
            </div>

            {/* Billing Cycle Selector */}
            <div className="flex justify-center mb-6">
              <div className="inline-flex p-1 rounded-2xl bg-slate-100 border border-slate-200">
                <button
                  type="button"
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold transition ${
                    billingCycle === 'monthly'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Monthly Billing
                </button>
                <button
                  type="button"
                  onClick={() => setBillingCycle('yearly')}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition ${
                    billingCycle === 'yearly'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>Yearly Billing</span>
                  <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black bg-gradient-to-r from-emerald-500 to-green-600 text-white">
                    SAVE 17%
                  </span>
                </button>
              </div>
            </div>

            {/* Price Header */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-black text-slate-900">
                Upgrade to LywuAi {isBusiness ? 'Business' : 'Pro'}
              </h2>
              <div className="mt-2 flex items-baseline justify-center space-x-1.5">
                <span className={`text-4xl font-black ${isBusiness ? 'text-indigo-600' : 'text-blue-600'}`}>
                  {priceDisplay}
                </span>
                <span className="text-sm text-slate-500 font-medium">
                  {billingCycle === 'yearly' ? `/ year (${monthlyEquivalent})` : '/ month'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {billingCycle === 'yearly'
                  ? '2 months free included • Cancel anytime'
                  : 'Billed monthly • Cancel anytime'}
              </p>
            </div>

            {/* Key Differentiator Notice for Pro */}
            {!isBusiness && (
              <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200/80 text-[11px] text-amber-800 flex items-center justify-between">
                <span>Looking for <strong>Custom Domain</strong> or <strong>24/7 AI Chatbot</strong>?</span>
                <button
                  type="button"
                  onClick={() => setSelectedPlan('business')}
                  className="font-bold underline text-amber-900 ml-2 whitespace-nowrap"
                >
                  Switch to Business →
                </button>
              </div>
            )}

            {/* Key Features List */}
            <div className="bg-slate-50 rounded-2xl p-4 mb-6 border border-slate-100">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                {isBusiness ? 'Business Plan Privileges' : 'Pro Plan Included Features'}
              </h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(isBusiness ? BUSINESS_FEATURES : PRO_FEATURES).map((f) => (
                  <li key={f} className="flex items-start space-x-2 text-xs text-slate-700">
                    <CheckCircle2
                      size={15}
                      className={`mt-0.5 shrink-0 ${isBusiness ? 'text-indigo-600' : 'text-green-500'}`}
                    />
                    <span className={f.includes('Custom Domain') || f.includes('AI Receptionist') ? 'font-bold text-indigo-900' : ''}>
                      {f}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Payment Methods */}
            <div className="mb-6">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
                Accepted Payment Methods
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {PAYMENT_METHODS.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center space-x-2.5 p-2.5 rounded-xl border border-slate-200 bg-white"
                  >
                    <m.icon size={16} className={`${isBusiness ? 'text-indigo-600' : 'text-blue-600'} shrink-0`} />
                    <div>
                      <div className="text-xs font-bold text-slate-800">{m.label}</div>
                      <div className="text-[10px] text-slate-400">{m.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Button */}
            <button
              onClick={handlePayment}
              className={`w-full py-3.5 rounded-2xl text-white font-bold text-sm shadow-xl transition transform hover:-translate-y-0.5 flex items-center justify-center space-x-2 ${
                isBusiness
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-indigo-500/25'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-500/25'
              }`}
            >
              <Zap size={18} />
              <span>
                Pay {priceDisplay} & Activate {isBusiness ? 'Business' : 'Pro'}
              </span>
            </button>

            <div className="flex items-center justify-center space-x-1 mt-3 text-[10px] text-slate-400">
              <Shield size={12} />
              <span>Secured by Razorpay • 256-bit SSL encryption</span>
            </div>

            {/* GrowthMachine Studio Upsell for Custom Website */}
            <div className="mt-5 pt-4 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-500">
                Need a 100% custom bespoke web application built for you?{' '}
                <a
                  href="https://growthmachinestudio.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-indigo-600 hover:underline inline-flex items-center space-x-0.5"
                >
                  <span>Contact GrowthMachine Studio →</span>
                </a>
              </p>
            </div>
          </div>
        )}

        {/* ── Processing ── */}
        {step === 'processing' && (
          <div className="p-8 flex flex-col items-center justify-center min-h-[320px] space-y-4">
            <Loader2 size={40} className="text-blue-600 animate-spin" />
            <p className="text-sm font-bold text-slate-700">Preparing your checkout...</p>
            <p className="text-xs text-slate-400">You'll be redirected to the secure payment page</p>
          </div>
        )}

        {/* ── Success ── */}
        {step === 'success' && (
          <div className="p-8 flex flex-col items-center justify-center min-h-[320px] space-y-4">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 size={36} className="text-green-600" />
            </div>
            <h3 className="text-xl font-black text-slate-900">
              You're on {selectedPlan === 'business' ? 'Business' : 'Pro'}! 🎉
            </h3>
            <p className="text-sm text-slate-600 text-center">
              Your LywuAi {selectedPlan === 'business' ? 'Business' : 'Pro'} subscription is now active. All features have been unlocked.
            </p>
            <button
              onClick={onClose}
              className="mt-4 px-8 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition"
            >
              Start Building
            </button>
          </div>
        )}

        {/* ── Error ── */}
        {step === 'error' && (
          <div className="p-8 flex flex-col items-center justify-center min-h-[320px] space-y-4">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
              <X size={36} className="text-red-600" />
            </div>
            <h3 className="text-xl font-black text-slate-900">Payment Issue</h3>
            <p className="text-sm text-red-600 text-center">{errorMsg || 'Something went wrong'}</p>
            <div className="flex space-x-3 mt-2">
              <button
                onClick={() => setStep('plan')}
                className="px-6 py-2.5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm transition"
              >
                Try Again
              </button>
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
