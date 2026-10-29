import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f8f9fb] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-3xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 shadow-sm">
        <Bot className="w-8 h-8" />
      </div>

      <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">404</h1>
      <p className="text-base font-bold text-gray-700 mt-2">Page Not Found</p>
      <p className="text-xs text-gray-400 mt-1 max-w-sm">
        The page you are looking for doesn't exist or has been moved.
      </p>

      <button
        onClick={() => navigate('/dashboard')}
        className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Return to Dashboard</span>
      </button>
    </div>
  );
}
