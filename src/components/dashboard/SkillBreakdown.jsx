import React, { useState } from 'react';
import { MoreHorizontal, ChevronDown } from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

const DEFAULT_SKILL_DATA = [
  { name: 'Technical Knowledge', value: 85, color: '#3b82f6' },
  { name: 'Problem Solving', value: 72, color: '#10b981' },
  { name: 'Communication', value: 68, color: '#f59e0b' },
  { name: 'Confidence', value: 80, color: '#8b5cf6' },
];

const DEFAULT_TREND_DATA = [
  { month: 'Jan', score: 62 },
  { month: 'Feb', score: 68 },
  { month: 'Mar', score: 71 },
  { month: 'Apr', score: 74 },
  { month: 'May', score: 78 },
  { month: 'Jun', score: 85 },
];

export default function SkillBreakdown({ breakdown, trends = [] }) {
  const [period, setPeriod] = useState('Last 6 Months');

  const overallScore = breakdown?.skillScores?.overall || 78;

  const skillItems = [
    {
      name: 'Technical Knowledge',
      value: breakdown?.skillScores?.technicalKnowledge ?? 85,
      color: '#3b82f6',
    },
    {
      name: 'Problem Solving',
      value: breakdown?.skillScores?.problemSolving ?? 72,
      color: '#10b981',
    },
    {
      name: 'Communication',
      value: breakdown?.skillScores?.communication ?? 68,
      color: '#f59e0b',
    },
    {
      name: 'Confidence',
      value: breakdown?.skillScores?.confidence ?? 80,
      color: '#8b5cf6',
    },
  ];

  // Recharts donut pie slices
  const donutData = skillItems.map((item) => ({
    name: item.name,
    value: item.value,
  }));

  const chartTrends =
    trends.length > 0
      ? trends.map((t) => ({
          month: t.period?.includes('-') ? t.period.split('-')[1] : t.period,
          score: t.avgScore,
        }))
      : DEFAULT_TREND_DATA;

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-gray-900">Skill Breakdown</h2>
        <button
          className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-50 transition-colors"
          aria-label="Options"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Donut Chart + Legend */}
      <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
        {/* Donut with center text */}
        <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={donutData}
                dataKey="value"
                cx="50%"
                cy="50%"
                innerRadius={46}
                outerRadius={62}
                paddingAngle={4}
                startAngle={90}
                endAngle={-270}
              >
                {donutData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={skillItems[index].color}
                    stroke="transparent"
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Center label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xl font-extrabold text-gray-900">{overallScore}%</span>
            <span className="text-[10px] text-gray-400 font-medium">Overall Score</span>
          </div>
        </div>

        {/* Legend with percentages */}
        <div className="grid grid-cols-1 sm:grid-cols-1 gap-2.5 flex-1 w-full">
          {skillItems.map((item) => (
            <div key={item.name} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-gray-600 font-medium">{item.name}</span>
              </div>
              <span className="font-bold text-gray-900">{item.value}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Progress Over Time Chart */}
      <div className="pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-gray-900">Progress Over Time</span>
          <div className="flex items-center gap-1 text-[11px] font-medium text-gray-500 bg-gray-50 hover:bg-gray-100 px-2 py-1 rounded-lg cursor-pointer">
            <span>{period}</span>
            <ChevronDown className="w-3 h-3 text-gray-400" />
          </div>
        </div>

        <div className="h-24 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartTrends} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: '#9ca3af' }}
              />
              <YAxis
                domain={[0, 100]}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 9, fill: '#9ca3af' }}
                ticks={[0, 25, 50, 75, 100]}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-gray-900 text-white text-[10px] px-2 py-1 rounded shadow">
                        {payload[0].value}%
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="score"
                stroke="#7c3aed"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorScore)"
                dot={{ r: 3, fill: '#7c3aed', strokeWidth: 1.5, stroke: '#fff' }}
                activeDot={{ r: 5, fill: '#7c3aed' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
