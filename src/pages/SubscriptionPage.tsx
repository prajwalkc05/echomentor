import { useEffect, useState } from 'react';
import { Check, X, Zap, Crown, Star, Loader2, ChevronDown, ChevronUp, Shield } from 'lucide-react';
import { api } from '../utils/api';
import { useUser } from '../context/UserContext';

interface Plan {
  _id: string;
  name: string;
  price: number;
  billingCycle: string;
  features: string[];
  active: boolean;
}

const PLAN_META: Record<string, {
  icon: any; badge: string; badgeClass: string;
  cardClass: string; btnClass: string; priceColor: string;
}> = {
  Free: {
    icon: Star,
    badge: '',
    badgeClass: '',
    cardClass: 'border-white/10 bg-[#13131f]',
    btnClass: 'bg-white/5 text-gray-500 cursor-default',
    priceColor: 'text-white',
  },
  Pro: {
    icon: Zap,
    badge: '🔥 Most Popular',
    badgeClass: 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/25',
    cardClass: 'border-purple-500/40 bg-gradient-to-b from-[#1e1535] to-[#13131f] shadow-2xl shadow-purple-900/40',
    btnClass: 'bg-gradient-to-r from-purple-600 to-violet-600 text-white hover:from-purple-500 hover:to-violet-500 shadow-lg shadow-purple-700/30',
    priceColor: 'text-purple-300',
  },
  Premium: {
    icon: Crown,
    badge: '👑 Best Value',
    badgeClass: 'bg-amber-500/15 text-amber-400 border border-amber-500/25',
    cardClass: 'border-amber-500/20 bg-[#13131f]',
    btnClass: 'border border-purple-500/50 text-purple-300 hover:bg-purple-500/10',
    priceColor: 'text-amber-300',
  },
};

const getPlanMeta = (name: string, index: number) => {
  if (PLAN_META[name]) return PLAN_META[name];
  // Fallback for any custom plan name added by admin
  const isHighlighted = index === 1;
  return {
    icon: Zap,
    badge: isHighlighted ? '⭐ Popular' : '',
    badgeClass: 'bg-purple-500/15 text-purple-400 border border-purple-500/25',
    cardClass: isHighlighted
      ? 'border-purple-500/40 bg-gradient-to-b from-[#1e1535] to-[#13131f] shadow-2xl shadow-purple-900/40'
      : 'border-white/10 bg-[#13131f]',
    btnClass: isHighlighted
      ? 'bg-gradient-to-r from-purple-600 to-violet-600 text-white hover:from-purple-500 hover:to-violet-500'
      : 'border border-purple-500/50 text-purple-300 hover:bg-purple-500/10',
    priceColor: isHighlighted ? 'text-purple-300' : 'text-white',
  };
};

const FAQS = [
  { q: 'How do subscriptions work?', a: 'Select a plan and pay securely via Razorpay. Your account upgrades instantly after payment confirmation.' },
  { q: 'Can I cancel anytime?', a: 'Yes. Cancel from Settings → Subscription. Access continues until the billing period ends.' },
  { q: 'Will I lose my data if I downgrade?', a: 'No. All your resumes, chats, and study plans are always preserved.' },
  { q: 'Are refunds available?', a: 'Refunds are available within 7 days of purchase. Contact support@echomentor.com.' },
  { q: 'Can I upgrade mid-cycle?', a: 'Yes. Upgrade anytime — your new plan activates immediately.' },
  { q: 'Is my payment information safe?', a: 'Absolutely. All payments go through Razorpay. We never store card details.' },
];

export default function SubscriptionPage() {
  const { user } = useUser();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  useEffect(() => { fetchPlans(); }, []);

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchPlans = async () => {
    try {
      const res = await api.get('/api/subscription/plans');
      // res is already parsed JSON: { success: true, data: [...] }
      const list = Array.isArray(res?.data) ? res.data
                 : Array.isArray(res) ? res
                 : [];
      setPlans(list);
    } catch (err: any) {
      console.error('fetchPlans error:', err);
      showToast('error', 'Could not load plans from server.');
    } finally {
      setLoading(false);
    }
  };

  const loadRazorpay = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) return resolve(true);
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleSubscribe = async (plan: Plan) => {
    if (plan.name === 'Free' || user.subscriptionPlan === plan.name) return;
    setProcessingId(plan._id);
    try {
      const razorpayLoaded = await loadRazorpay();
      if (!razorpayLoaded) {
        showToast('error', 'Failed to load payment gateway. Check your internet connection.');
        setProcessingId(null);
        return;
      }

      const res = await api.post('/api/subscription/create-order', { planId: plan._id });
      // res shape: { success: true, data: { order: {...}, payment: {...} } }
      const order = res?.data?.order || res?.order;
      if (!order?.id) throw new Error(res?.error || 'Failed to create order');

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY,
        amount: order.amount,
        currency: 'INR',
        order_id: order.id,
        name: 'EchoMentor',
        description: `${plan.name} Plan`,
        handler: async (response: any) => {
          try {
            await api.post('/api/subscription/verify-payment', {
              razorpayOrderId: order.id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            showToast('success', `🎉 Welcome to ${plan.name}! Refreshing...`);
            setTimeout(() => window.location.reload(), 2000);
          } catch {
            showToast('error', 'Payment verification failed. Contact support.');
          }
        },
        prefill: { name: user.name || '', email: user.email || '' },
        theme: { color: '#7c3aed' },
        modal: { ondismiss: () => setProcessingId(null) },
      };
      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch {
      showToast('error', 'Failed to initiate payment. Please try again.');
      setProcessingId(null);
    }
  };

  const allFeatures = Array.from(new Set(plans.flatMap(p => p.features)));
  const currentPlanName = user.subscriptionPlan || 'Free';

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#0a0a14]">
        <Loader2 size={32} className="animate-spin text-purple-400" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-[#0a0a14] relative">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl text-sm font-medium shadow-xl border transition-all ${
          toast.type === 'success'
            ? 'bg-green-950 border-green-500/30 text-green-300'
            : 'bg-red-950 border-red-500/30 text-red-300'
        }`}>
          {toast.msg}
        </div>
      )}

      <div className="max-w-6xl mx-auto px-6 py-14">

        {/* Hero */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 border border-purple-500/30 bg-purple-500/10 rounded-full px-4 py-1.5 text-purple-300 text-xs font-medium mb-6">
            <Zap size={12} /> Flexible Plans for Every Student
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
            Simple, Transparent Pricing
          </h1>
          <p className="text-gray-400 max-w-lg mx-auto leading-relaxed">
            Start free. Upgrade when you need more AI power, unlimited tools, and priority support.
          </p>
        </div>

        {/* No plans fallback */}
        {plans.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
              <Shield size={28} className="text-gray-500" />
            </div>
            <p className="text-gray-400 mb-2">Plans are being set up.</p>
            <p className="text-gray-600 text-sm">Please check back soon or contact support.</p>
          </div>
        ) : (
          <>
            {/* Pricing Cards */}
            <div className={`grid gap-6 mb-20 ${
              plans.length === 3 ? 'md:grid-cols-3' :
              plans.length === 2 ? 'md:grid-cols-2 max-w-2xl mx-auto' :
              'max-w-sm mx-auto'
            }`}>
              {plans.map((plan, index) => {
                const meta = getPlanMeta(plan.name, index);
                const Icon = meta.icon;
                const isCurrent = currentPlanName === plan.name;
                const isProcessing = processingId === plan._id;
                const isPro = plan.name === 'Pro';

                return (
                  <div
                    key={plan._id}
                    className={`relative rounded-2xl p-8 border flex flex-col transition-all duration-200 ${meta.cardClass} ${
                      isPro ? 'md:-translate-y-3 ring-1 ring-purple-500/30' : ''
                    }`}
                  >
                    {/* Badge */}
                    {meta.badge && (
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full mb-5 self-start ${meta.badgeClass}`}>
                        {meta.badge}
                      </span>
                    )}

                    {/* Icon + Name */}
                    <div className="flex items-center gap-2.5 mb-4">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isPro ? 'bg-purple-500/20' : 'bg-white/5'}`}>
                        <Icon size={18} className={isPro ? 'text-purple-400' : 'text-gray-400'} />
                      </div>
                      <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                    </div>

                    {/* Price */}
                    <div className="mb-7">
                      {plan.price === 0 ? (
                        <div className="flex items-baseline gap-1">
                          <span className="text-5xl font-bold text-white">₹0</span>
                          <span className="text-gray-500 text-sm ml-1">forever</span>
                        </div>
                      ) : (
                        <div className="flex items-baseline gap-1">
                          <span className={`text-5xl font-bold ${meta.priceColor}`}>₹{plan.price}</span>
                          <span className="text-gray-500 text-sm ml-1">
                            /{plan.billingCycle === 'monthly' ? 'month' : 'year'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* CTA */}
                    <button
                      onClick={() => handleSubscribe(plan)}
                      disabled={plan.name === 'Free' || isCurrent || !!processingId}
                      className={`w-full py-3 rounded-xl font-semibold text-sm mb-8 transition-all flex items-center justify-center gap-2 ${
                        isCurrent
                          ? 'bg-green-500/10 text-green-400 border border-green-500/20 cursor-default'
                          : meta.btnClass
                      } ${processingId && !isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {isProcessing ? (
                        <><Loader2 size={14} className="animate-spin" /> Processing...</>
                      ) : isCurrent ? (
                        <><Check size={14} /> Current Plan</>
                      ) : plan.name === 'Free' ? (
                        'Free Forever'
                      ) : (
                        `Get ${plan.name} →`
                      )}
                    </button>

                    {/* Divider */}
                    <div className="border-t border-white/5 mb-6" />

                    {/* Features */}
                    <div className="space-y-3 flex-1">
                      {plan.features.map((f, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <div className="w-4 h-4 rounded-full bg-green-500/15 flex items-center justify-center shrink-0 mt-0.5">
                            <Check size={10} className="text-green-400" />
                          </div>
                          <span className="text-gray-300 text-sm leading-snug">{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Feature Comparison */}
            {allFeatures.length > 0 && (
              <div className="mb-20">
                <h2 className="text-2xl font-bold text-white text-center mb-2">Compare Plans</h2>
                <p className="text-gray-500 text-center text-sm mb-8">Everything you get with each plan</p>
                <div className="rounded-2xl border border-white/8 overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-white/3 border-b border-white/8">
                        <th className="text-left px-6 py-4 text-sm text-gray-500 font-medium">Feature</th>
                        {plans.map(p => (
                          <th key={p._id} className="text-center px-6 py-4">
                            <div className="text-sm font-bold text-white">{p.name}</div>
                            <div className="text-xs text-gray-500 mt-0.5">
                              {p.price === 0 ? 'Free' : `₹${p.price}/${p.billingCycle === 'monthly' ? 'mo' : 'yr'}`}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {allFeatures.map((feature, idx) => (
                        <tr key={idx} className={`border-b border-white/5 ${idx % 2 === 0 ? 'bg-transparent' : 'bg-white/1.5'}`}>
                          <td className="px-6 py-3.5 text-gray-400 text-sm">{feature}</td>
                          {plans.map(p => (
                            <td key={p._id} className="text-center px-6 py-3.5">
                              {p.features.includes(feature)
                                ? <Check size={16} className="text-green-400 mx-auto" />
                                : <X size={16} className="text-gray-700 mx-auto" />
                              }
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

        {/* FAQ */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-white text-center mb-2">FAQ</h2>
          <p className="text-gray-500 text-sm text-center mb-8">Common questions answered</p>
          <div className="space-y-2">
            {FAQS.map((faq, idx) => (
              <div key={idx} className="border border-white/8 rounded-xl overflow-hidden bg-[#13131f]">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left group"
                >
                  <span className="text-sm font-medium text-white group-hover:text-purple-300 transition-colors">{faq.q}</span>
                  {openFaq === idx
                    ? <ChevronUp size={15} className="text-purple-400 shrink-0" />
                    : <ChevronDown size={15} className="text-gray-600 shrink-0" />
                  }
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-4 text-gray-400 text-sm leading-relaxed border-t border-white/5 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
