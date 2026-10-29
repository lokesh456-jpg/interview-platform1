import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BookOpen, MessageSquare, Code2, Sparkles } from 'lucide-react';

const ICON_MAP = {
  'Data Structures & Algorithms': { icon: BookOpen, bg: 'bg-emerald-50 text-emerald-600' },
  'HR Interview': { icon: MessageSquare, bg: 'bg-purple-50 text-purple-600' },
  'System Design': { icon: Code2, bg: 'bg-amber-50 text-amber-600' },
};

const DEFAULT_RECOMMENDATIONS = [
  {
    title: 'Practice DSA',
    topic: 'Data Structures & Algorithms',
    description: 'Strengthen your problem solving skills.',
    actionText: 'Start Practice',
    interviewType: 'coding',
    difficulty: 'medium',
    icon: BookOpen,
    bg: 'bg-emerald-50 text-emerald-600',
  },
  {
    title: 'Mock HR Interview',
    topic: 'HR Interview',
    description: 'Improve communication and confidence.',
    actionText: 'Start Now',
    interviewType: 'hr',
    difficulty: 'easy',
    icon: MessageSquare,
    bg: 'bg-purple-50 text-purple-600',
  },
  {
    title: 'System Design',
    topic: 'System Design',
    description: 'Learn and practice system design concepts.',
    actionText: 'Explore',
    interviewType: 'system_design',
    difficulty: 'hard',
    icon: Code2,
    bg: 'bg-amber-50 text-amber-600',
  },
];

export default function RecommendedSection({ recommendations = [] }) {
  const navigate = useNavigate();

  const items =
    recommendations.length >= 3
      ? recommendations.slice(0, 3).map((r, i) => {
          const mapping = ICON_MAP[r.topic] || DEFAULT_RECOMMENDATIONS[i % 3];
          return {
            ...r,
            icon: mapping.icon,
            bg: mapping.bg,
            actionText: r.actionText || 'Start Now',
          };
        })
      : DEFAULT_RECOMMENDATIONS;

  const handleStartPractice = (rec) => {
    navigate('/interview/new', {
      state: {
        presetRole: rec.topic || rec.title,
        presetType: rec.interviewType || 'technical',
        presetDifficulty: rec.difficulty || 'medium',
      },
    });
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-bold text-gray-900">Recommended for You</h2>
          <span className="p-1 rounded-full bg-indigo-50 text-indigo-600 text-[10px]">
            <Sparkles className="w-3 h-3" />
          </span>
        </div>
        <button
          onClick={() => navigate('/interview/new')}
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors cursor-pointer"
        >
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 3 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {items.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="p-4 rounded-xl border border-gray-100 hover:border-indigo-100 hover:shadow-xs transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center shrink-0`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-gray-900 leading-tight">
                    {item.title}
                  </h3>
                </div>
                <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="mt-4">
                <button
                  onClick={() => handleStartPractice(item)}
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-indigo-50/70 hover:bg-indigo-100/80 active:bg-indigo-200/80 text-indigo-700 text-xs font-semibold transition-all cursor-pointer"
                >
                  <span>{item.actionText}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
