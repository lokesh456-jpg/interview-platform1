import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bot,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Mic,
  FileText,
  BarChart2,
  ChevronDown,
  Shield,
  Zap,
  Code,
  Users,
} from 'lucide-react';

const FAQS = [
  {
    q: 'How does InterviewAI generate personalized questions?',
    a: 'InterviewAI parses your uploaded resume (PDF/DOCX) using advanced document extraction and analyzes your skills, experiences, and projects to generate custom, context-aware interview questions matching your target job role.',
  },
  {
    q: 'Can I answer questions using my microphone?',
    a: 'Yes! InterviewAI supports native browser speech recognition. You can speak naturally, view real-time live transcriptions, and receive AI evaluations of your spoken responses.',
  },
  {
    q: 'What interview categories are available?',
    a: 'We support Technical interviews (DSA, Frontend, Backend), Behavioral (STAR method), HR & Cultural fit, System Design architecture, and mixed custom assessments.',
  },
  {
    q: 'How are answers evaluated?',
    a: 'Answers are evaluated on categorized rubrics: correctness, relevance, completeness, clarity, and reasoning. You receive specific strengths, improvement areas, and a sample improved answer.',
  },
  {
    q: 'Is my resume data kept private and secure?',
    a: 'Absolutely. Resumes are processed over encrypted channels and stored in secure private storage. We never share your resume or transcripts with unauthorized third parties.',
  },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="min-h-screen bg-[#f8f9fb] text-gray-900 flex flex-col">
      {/* Top Navigation */}
      <header className="border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-200">
              <Bot className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-900">
              Interview<span className="text-indigo-600">AI</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <a href="#features" className="hover:text-indigo-600 transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-indigo-600 transition-colors">
              How It Works
            </a>
            <a href="#categories" className="hover:text-indigo-600 transition-colors">
              Categories
            </a>
            <a href="#pricing" className="hover:text-indigo-600 transition-colors">
              Pricing
            </a>
            <a href="#faq" className="hover:text-indigo-600 transition-colors">
              FAQ
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/login')}
              className="text-sm font-semibold text-gray-700 hover:text-indigo-600 px-4 py-2"
            >
              Log in
            </button>
            <button
              onClick={() => navigate('/register')}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-sm shadow-indigo-200 transition-all"
            >
              Start Free
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-16 pb-20 px-6 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span>The Next Generation AI Interview Coach</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight max-w-4xl mx-auto leading-tight">
          Master Your Next Tech Interview with{' '}
          <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Intelligent AI
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mt-6 leading-relaxed">
          Upload your resume, simulate realistic voice & text interviews, get instant rubric-based evaluations, and track your skill improvement over time.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
          <button
            onClick={() => navigate('/register')}
            className="flex items-center gap-2 px-7 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-base shadow-lg shadow-indigo-200 transition-all cursor-pointer"
          >
            <span>Start Practicing Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate('/login')}
            className="px-7 py-3.5 rounded-xl bg-white hover:bg-gray-50 text-gray-700 font-semibold text-base border border-gray-200 shadow-xs transition-all cursor-pointer"
          >
            View Demo Dashboard
          </button>
        </div>

        {/* Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-4xl mx-auto mt-16 pt-12 border-t border-gray-100">
          <div>
            <p className="text-3xl font-extrabold text-gray-900">50K+</p>
            <p className="text-xs text-gray-500 mt-1">Interviews Practiced</p>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-indigo-600">94%</p>
            <p className="text-xs text-gray-500 mt-1">Confidence Boost</p>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-purple-600">3.2x</p>
            <p className="text-xs text-gray-500 mt-1">Higher Offer Rate</p>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-emerald-600">100%</p>
            <p className="text-xs text-gray-500 mt-1">Personalized Questions</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white border-y border-gray-100 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-gray-900">
              Everything You Need to Ace Your Interview
            </h2>
            <p className="text-sm text-gray-500 mt-3">
              Built by experienced engineers to simulate real tech, behavioral, and system design interviews.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-indigo-50/40 border border-indigo-100">
              <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center mb-4">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Resume-Aware Questions</h3>
              <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                Extracts your exact technologies, projects, and career progression to challenge you on what is actually on your resume.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-purple-50/40 border border-purple-100">
              <div className="w-12 h-12 rounded-xl bg-purple-600 text-white flex items-center justify-center mb-4">
                <Mic className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Voice & Speech Support</h3>
              <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                Practice speaking your answers aloud with browser speech recognition, live transcript preview, and audio synthesis.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-emerald-50/40 border border-emerald-100">
              <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center mb-4">
                <BarChart2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Deep Analytics & Rubrics</h3>
              <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                Get scored on correctness, clarity, completeness, and reasoning with clear strengths, gaps, and model responses.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-gray-900">How InterviewAI Works</h2>
          <p className="text-sm text-gray-500 mt-3">Four simple steps to your dream tech job</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { step: '01', title: 'Upload Resume', desc: 'Drop your PDF or DOCX resume to extract your tech stack and experiences.' },
            { step: '02', title: 'Configure Session', desc: 'Select role, difficulty, duration, question count, and text or voice mode.' },
            { step: '03', title: 'Live Mock Interview', desc: 'Answer questions in real-time with responsive timers and live transcription.' },
            { step: '04', title: 'Receive Report', desc: 'Review comprehensive scoring, missed concepts, and recommended next steps.' },
          ].map((s) => (
            <div key={s.step} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs relative">
              <span className="text-3xl font-extrabold text-indigo-100 block mb-3">{s.step}</span>
              <h3 className="text-base font-bold text-gray-900">{s.title}</h3>
              <p className="text-xs text-gray-500 mt-2 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-white border-y border-gray-100 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Simple, Transparent Pricing</h2>
            <p className="text-sm text-gray-500 mt-3">Start free, upgrade whenever you need unlimited practice</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Free */}
            <div className="p-8 rounded-3xl bg-white border border-gray-200 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Free Tier</h3>
                <p className="text-xs text-gray-500 mt-1">Perfect for getting started</p>
                <div className="mt-4 mb-6">
                  <span className="text-4xl font-extrabold text-gray-900">$0</span>
                  <span className="text-xs text-gray-400"> / forever</span>
                </div>
                <ul className="space-y-3 text-xs text-gray-600">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> 10 mock interviews</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> 3 resume analyses</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Basic rubric evaluation</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Text & voice interview modes</li>
                </ul>
              </div>
              <button
                onClick={() => navigate('/register')}
                className="mt-8 w-full py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold text-xs transition-colors"
              >
                Sign Up Free
              </button>
            </div>

            {/* Pro */}
            <div className="p-8 rounded-3xl bg-gradient-to-b from-indigo-50/60 to-purple-50/40 border-2 border-indigo-600 shadow-md flex flex-col justify-between relative">
              <span className="absolute -top-3 right-6 px-3 py-1 bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider rounded-full shadow-xs">
                Most Popular
              </span>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Pro Tier</h3>
                <p className="text-xs text-gray-500 mt-1">For active job seekers</p>
                <div className="mt-4 mb-6">
                  <span className="text-4xl font-extrabold text-indigo-600">$19</span>
                  <span className="text-xs text-gray-400"> / month</span>
                </div>
                <ul className="space-y-3 text-xs text-gray-700 font-medium">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-600" /> Unlimited mock interviews</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-600" /> Unlimited resume analyses</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-600" /> Deep AI feedback & follow-ups</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-600" /> Advanced skill analytics & trends</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-600" /> Priority question generation</li>
                </ul>
              </div>
              <button
                onClick={() => navigate('/pricing')}
                className="mt-8 w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-200 transition-all"
              >
                Get Pro Access
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 px-6 max-w-3xl mx-auto w-full">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-xs">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left font-semibold text-sm text-gray-900 hover:bg-gray-50/50 transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-gray-400 transition-transform ${
                    openFaq === i ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {openFaq === i && (
                <div className="px-5 pb-5 text-xs text-gray-600 leading-relaxed border-t border-gray-50 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-gray-100 bg-white py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-gray-500">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <Bot className="w-4 h-4" />
            </div>
            <span className="font-bold text-gray-900">InterviewAI</span>
            <span>© 2026 InterviewAI Platform. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-6">
            <a href="#features" className="hover:text-gray-900">Privacy</a>
            <a href="#features" className="hover:text-gray-900">Terms</a>
            <a href="#faq" className="hover:text-gray-900">Security</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
