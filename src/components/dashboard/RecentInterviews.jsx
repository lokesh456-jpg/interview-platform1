import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronRight, Code, Database, Monitor, Users } from 'lucide-react';

const CATEGORY_COLORS = {
  Technical: 'bg-indigo-50 text-indigo-700',
  technical: 'bg-indigo-50 text-indigo-700',
  Mixed: 'bg-purple-50 text-purple-700',
  mixed: 'bg-purple-50 text-purple-700',
  Behavioral: 'bg-blue-50 text-blue-700',
  behavioral: 'bg-blue-50 text-blue-700',
  hr: 'bg-emerald-50 text-emerald-700',
  HR: 'bg-emerald-50 text-emerald-700',
  coding: 'bg-sky-50 text-sky-700',
  system_design: 'bg-violet-50 text-violet-700',
};

const getScoreStyle = (score) => {
  if (score >= 75) return 'bg-emerald-50 text-emerald-700';
  if (score >= 65) return 'bg-amber-50 text-amber-700';
  return 'bg-red-50 text-red-700';
};

const getInterviewIcon = (type, title = '') => {
  const lower = (type + ' ' + title).toLowerCase();
  if (lower.includes('full stack') || lower.includes('software') || lower.includes('code')) {
    return { icon: Code, bg: 'bg-indigo-50 text-indigo-600' };
  }
  if (lower.includes('data structures') || lower.includes('dsa') || lower.includes('database')) {
    return { icon: Database, bg: 'bg-purple-50 text-purple-600' };
  }
  if (lower.includes('frontend') || lower.includes('react') || lower.includes('web')) {
    return { icon: Monitor, bg: 'bg-blue-50 text-blue-600' };
  }
  return { icon: Users, bg: 'bg-amber-50 text-amber-600' };
};

export default function RecentInterviews({ interviews = [], loading = false }) {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs h-full flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-gray-900">Recent Interviews</h2>
        <button
          onClick={() => navigate('/history')}
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors cursor-pointer"
        >
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* List */}
      <div className="space-y-3 flex-1 flex flex-col justify-around">
        {loading ? (
          [1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse flex items-center gap-4 py-2">
              <div className="w-10 h-10 bg-gray-100 rounded-xl" />
              <div className="flex-1 space-y-2">
                <div className="w-1/2 h-3 bg-gray-100 rounded" />
                <div className="w-1/4 h-2.5 bg-gray-100 rounded" />
              </div>
            </div>
          ))
        ) : interviews.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-xs text-gray-400">No interviews completed yet.</p>
            <button
              onClick={() => navigate('/interview/new')}
              className="mt-3 text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
            >
              Start your first interview →
            </button>
          </div>
        ) : (
          interviews.slice(0, 4).map((interview) => {
            const { icon: Icon, bg } = getInterviewIcon(interview.interviewType, interview.title);
            const score = interview.overallScore;
            const categoryLabel =
              interview.interviewType.charAt(0).toUpperCase() +
              interview.interviewType.slice(1).replace('_', ' ');

            return (
              <div
                key={interview._id}
                onClick={() =>
                  navigate(
                    interview.status === 'completed'
                      ? `/interviews/${interview._id}/report`
                      : `/interview/${interview._id}`
                  )
                }
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50/80 cursor-pointer transition-all duration-150 group"
              >
                {/* Left: Icon + Title & Date */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-semibold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
                      {interview.title}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {interview.dateFormatted ||
                        new Date(interview.createdAt).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                    </p>
                  </div>
                </div>

                {/* Right: Badge + Score + Chevron */}
                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={`px-3 py-1 rounded-lg text-xs font-medium capitalize hidden sm:inline-block ${
                      CATEGORY_COLORS[interview.interviewType] || 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {categoryLabel}
                  </span>

                  {score !== null && score !== undefined ? (
                    <span
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold ${getScoreStyle(
                        score
                      )}`}
                    >
                      {score}%
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-500">
                      Draft
                    </span>
                  )}

                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-600 transition-colors" />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
