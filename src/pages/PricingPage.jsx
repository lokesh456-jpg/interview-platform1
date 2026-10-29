import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Crown, Zap, Sparkles, ArrowRight, AlertCircle } from 'lucide-react';
import { planApi } from '../api/plans';

export default function PricingPage() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlanData();
  }, []);

  const loadPlanData = async () => {
    try {
      setLoading(true);
      const [plansRes, usageRes] = await Promise.allSettled([
        planApi.getPlans(),
        planApi.getUsage(),
      ]);

      if (plansRes.status === 'fulfilled' && plansRes.value.success) {
        setPlans(plansRes.value.plans || []);
      }
      if (usageRes.status === 'fulfilled' && usageRes.value.success) {
        setUsage(usageRes.value.usage);
      }
    } catch (err) {
      console.warn('Failed to load plans:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold mb-3">
          <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
          <span>Flexible Plans for Every Stage</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
          Upgrade to Supercharge Your Preparation
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-2">
          Unlock unlimited mock interviews, voice AI assessments, and deep analytics.
        </p>
      </div>

      {/* Usage Indicator if logged in */}
      {usage && (
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs max-w-2xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-gray-500 block">Current Plan:</span>
            <span className="text-base font-extrabold text-indigo-600 uppercase">
              {usage.plan} Tier
            </span>
          </div>

          <div className="flex items-center gap-6 text-xs text-gray-700">
            <div>
              <span className="text-gray-400 block text-[11px]">Interviews:</span>
              <span className="font-bold">
                {usage.interviews.used} / {usage.interviews.limit ?? '∞'}
              </span>
            </div>
            <div>
              <span className="text-gray-400 block text-[11px]">Resumes Analyzed:</span>
              <span className="font-bold">
                {usage.resumeAnalyses.used} / {usage.resumeAnalyses.limit ?? '∞'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
        {/* Free Plan */}
        <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Free Tier</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-600">
                CURRENT
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">For getting started with AI prep</p>

            <div className="mt-5 mb-6">
              <span className="text-4xl font-black text-gray-900">$0</span>
              <span className="text-xs text-gray-400"> / forever</span>
            </div>

            <ul className="space-y-3 text-xs text-gray-600 border-t border-gray-100 pt-5">
              {[
                '10 mock interviews',
                '3 resume analyses',
                'Standard rubric evaluation',
                'Interview history & scores',
                'Text and voice dictation',
              ].map((f, i) => (
                <li key={i} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>

          <button
            onClick={() => navigate('/interview/new')}
            className="mt-8 w-full py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold transition-colors"
          >
            Practice Free
          </button>
        </div>

        {/* Pro Plan */}
        <div className="bg-gradient-to-b from-indigo-50/70 via-purple-50/40 to-white rounded-3xl p-8 border-2 border-indigo-600 shadow-lg shadow-indigo-100 flex flex-col justify-between relative">
          <span className="absolute -top-3.5 right-6 px-3.5 py-1 bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider rounded-full shadow-xs flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            <span>Recommended</span>
          </span>

          <div>
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-amber-500 fill-amber-500" />
              <h2 className="text-lg font-bold text-gray-900">Pro Plan</h2>
            </div>
            <p className="text-xs text-gray-500 mt-1">For focused, career-accelerating prep</p>

            <div className="mt-5 mb-6">
              <span className="text-4xl font-black text-indigo-600">$19</span>
              <span className="text-xs text-gray-400"> / month</span>
            </div>

            <ul className="space-y-3 text-xs text-gray-700 font-medium border-t border-indigo-100 pt-5">
              {[
                'Unlimited mock interviews',
                'Unlimited resume analyses',
                'Deep rubric scoring & model answers',
                'Personalized recommendations engine',
                'Detailed skill breakdown & trends',
                'Priority question generation',
                'Export personal interview data',
              ].map((f, i) => (
                <li key={i} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8 space-y-3">
            <button
              onClick={() =>
                alert(
                  'Payment integration is not configured in this environment. Pro tier features are demonstrated for informational purposes.'
                )
              }
              className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-bold shadow-md shadow-indigo-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Upgrade to Pro</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-100 flex items-start gap-2 text-[10px] text-amber-800">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
              <span>
                Payment gateway (Stripe/PayPal) is unconfigured in this academic deployment. Shown for informational purposes.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
