import React from 'react';
import { useNavigate } from 'react-router-dom';

const DEFAULT_SKILLS = [
  { name: 'Data Structures & Algorithms', level: 85, color: 'bg-indigo-600' },
  { name: 'System Design', level: 72, color: 'bg-indigo-400' },
  { name: 'React.js', level: 68, color: 'bg-amber-500' },
  { name: 'Node.js', level: 80, color: 'bg-emerald-500' },
  { name: 'MongoDB', level: 70, color: 'bg-purple-600' },
];

export default function TopSkills({ skills = [] }) {
  const navigate = useNavigate();

  const displaySkills =
    skills.length >= 3
      ? skills.slice(0, 5).map((s, idx) => ({
          name: s.name,
          level: s.level,
          color: DEFAULT_SKILLS[idx % DEFAULT_SKILLS.length].color,
        }))
      : DEFAULT_SKILLS;

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs h-full flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-gray-900">Your Top Skills</h2>
        <button
          onClick={() => navigate('/settings')}
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
        >
          Edit
        </button>
      </div>

      {/* Progress Bars */}
      <div className="space-y-3.5 flex-1 flex flex-col justify-around">
        {displaySkills.map((skill) => (
          <div key={skill.name}>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-gray-800 truncate mr-2">
                {skill.name}
              </span>
              <span className="font-bold text-gray-900 shrink-0">
                {skill.level}%
              </span>
            </div>

            {/* Track and fill */}
            <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${skill.color}`}
                style={{ width: `${skill.level}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
