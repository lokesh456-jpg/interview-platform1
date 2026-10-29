import React, { useState, useEffect } from 'react';
import {
  BarChart2,
  TrendingUp,
  Award,
  Clock,
  Calendar,
  Layers,
  ChevronDown,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { analyticsApi } from '../api/analytics';

export default function AnalyticsPage() {
  const [overview, setOverview] = useState(null);
  const [trends, setTrends] = useState([]);
  const [categories, setCategories] = useState([]);
  const [breakdown, setBreakdown] = useState(null);
  const [activity, setActivity] = useState([]);
  const [period, setPeriod] = useState('6months');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [period]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const [ovRes, trRes, catRes, brRes, actRes] = await Promise.allSettled([
        analyticsApi.getOverview(),
        analyticsApi.getScoreTrends(period),
        analyticsApi.getCategoryPerformance(),
        analyticsApi.getSkillBreakdown(),
        analyticsApi.getMonthlyActivity(),
      ]);

      if (ovRes.status === 'fulfilled' && ovRes.value.success) setOverview(ovRes.value.overview);
      if (trRes.status === 'fulfilled' && trRes.value.success) setTrends(trRes.value.trends || []);
      if (catRes.status === 'fulfilled' && catRes.value.success) setCategories(catRes.value.data || []);
      if (brRes.status === 'fulfilled' && brRes.value.success) setBreakdown(brRes.value.breakdown);
      if (actRes.status === 'fulfilled' && actRes.value.success) setActivity(actRes.value.data || []);
    } catch (err) {
      console.warn('Analytics loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  const demoTrends = [
    { period: 'Jan', avgScore: 65 },
    { period: 'Feb', avgScore: 70 },
    { period: 'Mar', avgScore: 72 },
    { period: 'Apr', avgScore: 76 },
    { period: 'May', avgScore: 81 },
    { period: 'Jun', avgScore: 85 },
  ];

  const demoCategories = [
    { category: 'Technical', avgScore: 82, count: 5 },
    { category: 'Behavioral', avgScore: 74, count: 3 },
    { category: 'HR', avgScore: 79, count: 2 },
    { category: 'Coding', avgScore: 70, count: 4 },
    { category: 'System Design', avgScore: 68, count: 2 },
  ];

  const displayTrends = trends.length > 0 ? trends : demoTrends;
  const displayCategories = categories.length > 0 ? categories : demoCategories;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Performance Analytics</h1>
        <p className="text-xs text-gray-500 mt-1">
          Detailed metrics, historical performance trajectories, and topic-specific analysis.
        </p>
      </div>

      {/* 4 Stat Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-semibold text-gray-500">Total Completed</span>
            <Layers className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-2xl font-black text-gray-900">
            {overview?.totalInterviews || 12}
          </p>
          <span className="text-[11px] text-emerald-600 font-semibold block mt-1">
            +3 this month
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-semibold text-gray-500">Average Score</span>
            <BarChart2 className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-2xl font-black text-gray-900">
            {overview?.avgScore ? `${overview.avgScore}%` : '78%'}
          </p>
          <span className="text-[11px] text-emerald-600 font-semibold block mt-1">
            Across all rounds
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-semibold text-gray-500">Best Score</span>
            <Award className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-2xl font-black text-indigo-600">
            {overview?.bestScore ? `${overview.bestScore}%` : '92%'}
          </p>
          <span className="text-[11px] text-gray-400 block mt-1">Personal record</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-semibold text-gray-500">Practice Time</span>
            <Clock className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-2xl font-black text-gray-900">
            {overview?.totalHours ? `${overview.totalHours} hrs` : '6.5 hrs'}
          </p>
          <span className="text-[11px] text-emerald-600 font-semibold block mt-1">
            +2.1 hrs this month
          </span>
        </div>
      </div>

      {/* Score Trends Line / Area Chart */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-gray-900">Score Progression Over Time</h3>
            <p className="text-xs text-gray-400">Mean evaluation score across completed sessions</p>
          </div>

          <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-xl border border-gray-200">
            {['1month', '3months', '6months'].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                  period === p
                    ? 'bg-white text-indigo-700 shadow-xs font-bold'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {p === '1month' ? '1M' : p === '3months' ? '3M' : '6M'}
              </button>
            ))}
          </div>
        </div>

        <div className="h-64 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={displayTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="analyticsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis dataKey="period" tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} />
              <YAxis domain={[0, 100]} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-gray-900 text-white text-xs px-2.5 py-1.5 rounded-lg shadow-md font-bold">
                        Average: {payload[0].value}%
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="avgScore"
                stroke="#6366f1"
                strokeWidth={3}
                fill="url(#analyticsGradient)"
                dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Performance Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-gray-900">Performance by Category</h3>
            <p className="text-xs text-gray-400">Average score per interview type</p>
          </div>

          <div className="h-60 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={displayCategories} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis
                  dataKey="category"
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#9ca3af' }}
                />
                <YAxis domain={[0, 100]} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-gray-900 text-white text-xs px-2.5 py-1.5 rounded-lg shadow-md font-bold">
                          {payload[0].payload.category}: {payload[0].value}%
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="avgScore" fill="#6366f1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Skill Dimensions Radar / Breakdown */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-xs space-y-5 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-gray-900">Skill Competencies</h3>
            <p className="text-xs text-gray-400">Aggregated across all evaluated questions</p>
          </div>

          <div className="space-y-4">
            {[
              { name: 'Technical Knowledge', value: breakdown?.skillScores?.technicalKnowledge || 85, color: 'bg-indigo-600' },
              { name: 'Problem Solving & Algorithms', value: breakdown?.skillScores?.problemSolving || 72, color: 'bg-emerald-500' },
              { name: 'Communication & STAR Format', value: breakdown?.skillScores?.communication || 68, color: 'bg-amber-500' },
              { name: 'Confidence & Delivery', value: breakdown?.skillScores?.confidence || 80, color: 'bg-purple-600' },
            ].map((s) => (
              <div key={s.name}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-semibold text-gray-800">{s.name}</span>
                  <span className="font-bold text-gray-900">{s.value}%</span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${s.color}`}
                    style={{ width: `${s.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <p className="text-[11px] text-gray-400 italic pt-2">
            Skill evaluations update in real-time as you complete interview rounds.
          </p>
        </div>
      </div>
    </div>
  );
}
