import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  PlaySquare,
  History,
  BarChart3,
  Settings,
  Crown,
  ArrowRight,
  Bot,
} from 'lucide-react';

const NAV_ITEMS = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Upload Resume', path: '/resumes', icon: FileText },
  { name: 'Start Interview', path: '/interview/new', icon: PlaySquare },
  { name: 'Interview History', path: '/history', icon: History },
  { name: 'Analytics', path: '/analytics', icon: BarChart3 },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export default function Sidebar({ onCloseMobile }) {
  const navigate = useNavigate();

  return (
    <aside className="w-64 bg-white border-r border-gray-100 flex flex-col h-full select-none">
      {/* Brand Logo */}
      <div className="h-20 flex items-center px-6 gap-3">
        <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-200">
          <Bot className="w-5 h-5" />
        </div>
        <span className="text-xl font-bold tracking-tight text-gray-900">
          Interview<span className="text-indigo-600">AI</span>
        </span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-indigo-50/90 text-indigo-700 font-semibold shadow-xs'
                    : 'text-gray-600 hover:bg-gray-50/80 hover:text-gray-900'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={`w-4.5 h-4.5 ${
                      isActive ? 'text-indigo-600' : 'text-gray-400'
                    }`}
                  />
                  <span>{item.name}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Upgrade to Pro Card */}
      <div className="p-4 m-4 rounded-2xl bg-gradient-to-b from-indigo-50/60 to-purple-50/40 border border-indigo-100/70">
        <div className="flex items-center gap-2 mb-1.5">
          <Crown className="w-4 h-4 text-amber-500 fill-amber-500" />
          <span className="text-sm font-bold text-gray-900">Upgrade to Pro</span>
        </div>
        <p className="text-xs text-gray-500 mb-3 leading-relaxed">
          Get advanced features and unlimited interviews.
        </p>
        <button
          onClick={() => {
            navigate('/pricing');
            if (onCloseMobile) onCloseMobile();
          }}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-semibold shadow-sm shadow-indigo-300 transition-all"
        >
          <span>Upgrade Now</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
}
