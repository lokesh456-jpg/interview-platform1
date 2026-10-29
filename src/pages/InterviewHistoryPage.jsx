import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  ArrowUpDown,
  Calendar,
  Clock,
  PlaySquare,
  FileText,
  Trash2,
  RotateCcw,
  ChevronRight,
  Plus,
} from 'lucide-react';
import { interviewApi } from '../api/interviews';

const TYPE_FILTERS = [
  { id: '', name: 'All Categories' },
  { id: 'technical', name: 'Technical' },
  { id: 'behavioral', name: 'Behavioral' },
  { id: 'hr', name: 'HR' },
  { id: 'coding', name: 'Coding' },
  { id: 'system_design', name: 'System Design' },
  { id: 'mixed', name: 'Mixed' },
];

export default function InterviewHistoryPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const querySearch = searchParams.get('search') || '';

  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(querySearch);
  const [selectedType, setSelectedType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  useEffect(() => {
    fetchInterviews();
  }, [search, selectedType, selectedStatus, sortBy, sortOrder, page]);

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 8,
        search: search.trim() || undefined,
        interviewType: selectedType || undefined,
        status: selectedStatus || undefined,
        sortBy,
        sortOrder,
      };

      const res = await interviewApi.getAll(params);
      if (res.success) {
        setInterviews(res.interviews || []);
        if (res.pagination) {
          setPagination(res.pagination);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch interview history:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this interview record and its report?')) return;
    try {
      await interviewApi.delete(id);
      setInterviews((prev) => prev.filter((i) => i._id !== id));
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  const handleRetry = async (id) => {
    try {
      const res = await interviewApi.retry(id);
      if (res.success && res.interview) {
        navigate(`/interview/${res.interview._id}`);
      }
    } catch (err) {
      alert('Retry failed: ' + err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header & CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Interview History</h1>
          <p className="text-xs text-gray-500 mt-1">
            Review past mock interviews, feedback reports, and performance progression.
          </p>
        </div>

        <button
          onClick={() => navigate('/interview/new')}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm shadow-indigo-200 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Interview</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by role or title..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50/70 focus:bg-white text-xs text-gray-900 rounded-xl border border-gray-200 focus:border-indigo-500 outline-none transition-all"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select
            value={selectedType}
            onChange={(e) => {
              setSelectedType(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 bg-gray-50 focus:bg-white border border-gray-200 rounded-xl text-gray-700 outline-none"
          >
            {TYPE_FILTERS.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 bg-gray-50 focus:bg-white border border-gray-200 rounded-xl text-gray-700 outline-none"
          >
            <option value="">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="in_progress">In Progress</option>
            <option value="draft">Draft</option>
          </select>

          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [sb, so] = e.target.value.split('-');
              setSortBy(sb);
              setSortOrder(so);
              setPage(1);
            }}
            className="px-3 py-2 bg-gray-50 focus:bg-white border border-gray-200 rounded-xl text-gray-700 outline-none"
          >
            <option value="createdAt-desc">Newest First</option>
            <option value="createdAt-asc">Oldest First</option>
            <option value="overallScore-desc">Highest Score</option>
            <option value="overallScore-asc">Lowest Score</option>
          </select>
        </div>
      </div>

      {/* Interviews Table / Card List */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs text-gray-400">Loading interview records...</p>
          </div>
        ) : interviews.length === 0 ? (
          <div className="py-20 text-center">
            <PlaySquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-gray-900">No interviews found</h3>
            <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
              You haven't completed any interviews matching these filters. Start one to see your results!
            </p>
            <button
              onClick={() => navigate('/interview/new')}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold"
            >
              Start New Interview
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {interviews.map((item) => (
              <div
                key={item._id}
                onClick={() =>
                  navigate(
                    item.status === 'completed'
                      ? `/interviews/${item._id}/report`
                      : `/interview/${item._id}`
                  )
                }
                className="p-5 hover:bg-gray-50/70 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer group"
              >
                {/* Left: Info */}
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-gray-900 group-hover:text-indigo-600 transition-colors truncate">
                      {item.title}
                    </h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-indigo-50 text-indigo-700">
                      {item.interviewType}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
                    <span>{item.jobRole}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(item.createdAt).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                    <span>•</span>
                    <span className="capitalize">Status: {item.status}</span>
                  </div>
                </div>

                {/* Right: Score + Actions */}
                <div className="flex items-center gap-4 shrink-0">
                  {item.overallScore !== null && item.overallScore !== undefined ? (
                    <div className="text-right">
                      <span className="text-base font-black text-indigo-600">
                        {item.overallScore}%
                      </span>
                      <span className="text-[10px] text-gray-400 block">Score</span>
                    </div>
                  ) : (
                    <span className="px-2.5 py-1 bg-gray-100 text-gray-500 rounded-lg text-xs font-medium">
                      Incomplete
                    </span>
                  )}

                  <div className="flex items-center gap-1">
                    <button
                      title="Retry Interview"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRetry(item._id);
                      }}
                      className="p-2 text-gray-400 hover:text-indigo-600 rounded-xl hover:bg-white"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                    <button
                      title="Delete Record"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(item._id);
                      }}
                      className="p-2 text-gray-400 hover:text-red-600 rounded-xl hover:bg-white"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-600 ml-1" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Footer */}
        {pagination.totalPages > 1 && (
          <div className="p-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-600">
            <span>
              Showing page {page} of {pagination.totalPages}
            </span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50 font-medium"
              >
                Previous
              </button>
              <button
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50 font-medium"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
