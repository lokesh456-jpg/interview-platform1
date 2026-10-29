import React from 'react';
import { MoreHorizontal } from 'lucide-react';

export default function StatCard({ title, value, change, isPositive = true, icon: Icon, iconBg, iconColor }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs hover:shadow-sm transition-all duration-200">
      <div className="flex items-start justify-between">
        <div className={`w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        <button
          className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-50 transition-colors"
          aria-label="Options"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-4">
        <p className="text-xs font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1 tracking-tight">{value}</p>

        {change && (
          <div className="flex items-center gap-1.5 mt-2">
            <span className={`text-xs font-semibold ${isPositive ? 'text-emerald-600' : 'text-gray-500'}`}>
              {isPositive ? '↑' : ''} {change}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
