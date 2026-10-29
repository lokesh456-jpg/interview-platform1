import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Upload, Sparkles, Bot } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function WelcomeBanner() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const firstName = user?.name ? user.name.split(' ')[0] : 'there';

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#eef2ff] via-[#f5f3ff] to-[#e0e7ff] border border-indigo-100/60 p-6 sm:p-8 mb-6 shadow-xs">
      {/* Subtle decorative circles */}
      <div className="absolute -top-16 -right-16 w-64 h-64 bg-purple-200/30 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-20 right-48 w-56 h-56 bg-indigo-200/30 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
        {/* Left Column: Greeting and Actions */}
        <div className="max-w-xl">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
            Welcome back,{' '}
            <span className="text-[#6366f1]">{firstName}!</span>{' '}
            <span className="inline-block animate-bounce">👋</span>
          </h1>

          <p className="text-base sm:text-lg font-semibold text-gray-800 mt-2">
            Ready to improve your interview skills today?
          </p>

          <p className="text-xs sm:text-sm text-gray-500 mt-1 leading-relaxed">
            Practice with AI, get personalized feedback, and land your dream job.
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-5">
            <button
              onClick={() => navigate('/interview/new')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs sm:text-sm font-semibold shadow-md shadow-indigo-200 transition-all cursor-pointer"
            >
              <span>Start New Interview</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => navigate('/resumes')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-gray-50 active:bg-gray-100 text-gray-700 text-xs sm:text-sm font-semibold border border-gray-200/80 shadow-xs transition-all cursor-pointer"
            >
              <Upload className="w-4 h-4 text-gray-500" />
              <span>Upload Resume</span>
            </button>
          </div>
        </div>

        {/* Right Column: Illustration & Feature Badge */}
        <div className="relative flex items-center justify-center lg:justify-end w-full lg:w-auto">
          {/* Floating Pill Badge */}
          <div className="absolute top-2 right-4 sm:right-6 lg:-top-4 lg:right-0 bg-white/95 backdrop-blur-md rounded-2xl shadow-lg shadow-indigo-100/50 border border-white/80 p-3 sm:p-3.5 flex items-center gap-3 z-10 max-w-[240px]">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white shrink-0 shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-900 leading-tight">AI-Powered</p>
              <p className="text-[11px] text-gray-500 leading-tight">Personalized Questions</p>
              <p className="text-[10px] text-gray-400">based on your resume</p>
            </div>
          </div>

          {/* Character illustration container */}
          <div className="w-44 h-44 sm:w-52 sm:h-52 relative flex items-center justify-center">
            {/* Styled Character Graphic Avatar */}
            <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-3xl bg-gradient-to-tr from-indigo-600 to-purple-600 p-1 shadow-xl shadow-indigo-200/50 flex items-center justify-center overflow-hidden">
              <div className="w-full h-full rounded-[22px] bg-gradient-to-b from-indigo-500 via-purple-600 to-indigo-800 flex flex-col items-center justify-end p-2 relative">
                {/* Robot / Developer Avatar Mascot */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-inner mb-2">
                  <Bot className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
                </div>
                {/* Laptop Mock */}
                <div className="w-24 sm:w-28 h-7 bg-gray-900 rounded-t-lg border-t-2 border-indigo-300 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-indigo-400 flex items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
